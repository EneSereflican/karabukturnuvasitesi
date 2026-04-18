import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_');
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get team_key and bank_receipt
    const teamKey = formData.get('team_key') as string | null;
    const bankReceiptFile = formData.get('bank_receipt') as File | null;
    const responsible_email = formData.get('responsible_email') as string;
    const identifier = formData.get('identifier') as string;

    // Validate both are present
    if (!teamKey || !bankReceiptFile) {
      return NextResponse.json(
        { error: 'Takım anahtarı ve dekont dosyası zorunludur' },
        { status: 400 }
      );
    }

    // Validate responsible email
    if (!responsible_email) {
      return NextResponse.json(
        { error: 'Sorumlu e-posta adresi gereklidir' },
        { status: 400 }
      );
    }

    // Validate identifier
    if (!identifier) {
      return NextResponse.json(
        { error: 'TC kimlik no veya e-posta gereklidir' },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(bankReceiptFile.type)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya formatı. PDF, JPG veya PNG yükleyiniz.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (bankReceiptFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Dosya boyutu 5 MB\'dan büyük olamaz' },
        { status: 400 }
      );
    }

    // Create Supabase service client
    const supabase = createServiceClient();

    // Get team by team_key
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('id, name, status, responsible1_email, responsible2_email, responsible1_name, responsible2_name')
      .eq('team_key', teamKey)
      .single();

    if (teamError || !teamData) {
      return NextResponse.json(
        { error: 'Geçersiz takım anahtarı' },
        { status: 404 }
      );
    }

    // Verify identifier
    const isIdentifierEmail = identifier.includes('@');

    let identifierValid = false;

    if (isIdentifierEmail) {
      const { data: playerCheck } = await supabase
        .from('players')
        .select('id')
        .eq('team_id', teamData.id)
        .eq('email', identifier)
        .single();
      identifierValid = !!playerCheck;
      
      if (!identifierValid) {
        identifierValid = 
          teamData.responsible1_email === identifier ||
          teamData.responsible2_email === identifier;
      }
    } else {
      const { data: playerCheck } = await supabase
        .from('players')
        .select('id')
        .eq('team_id', teamData.id)
        .eq('tc_no', identifier)
        .single();
      identifierValid = !!playerCheck;
    }

    if (!identifierValid) {
      return NextResponse.json(
        { error: 'Bu TC kimlik no veya e-posta bu takımda kayıtlı değil' },
        { status: 403 }
      );
    }

    // Delete existing bank_receipt if any
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('team_id', teamData.id)
      .eq('owner_type', 'team')
      .eq('document_type', 'bank_receipt');

    if (deleteError) {
      console.error('Delete error:', deleteError);
    }

    // Sanitize file name
    const sanitizedFileName = sanitizeFileName(bankReceiptFile.name);
    const timestamp = Date.now();
    const filePath = `teams/${teamData.id}/receipts/${timestamp}-${sanitizedFileName}`;

    // Upload to Storage
    const arrayBuffer = await bankReceiptFile.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: bankReceiptFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Dosya yükleme başarısız oldu' },
        { status: 500 }
      );
    }

    // Insert document record
    const { error: insertError } = await supabase.from('documents').insert({
      owner_type: 'team',
      owner_id: teamData.id,
      team_id: teamData.id,
      document_type: 'bank_receipt',
      file_path: uploadData.path,
      file_name: bankReceiptFile.name,
      file_size: bankReceiptFile.size,
      mime_type: bankReceiptFile.type,
    });

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Belge kaydı başarısız oldu' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
