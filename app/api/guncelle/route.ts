import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const DOCUMENT_TYPE_MAP: Record<string, string> = {
  tc_front: 'tc_front',
  tc_back: 'tc_back',
  work_certificate: 'work_certificate',
  sgk_certificate: 'sgk_certificate',
  passport_photo: 'passport_photo',
  bank_receipt: 'bank_receipt',
  other_document: 'other',
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const captainToken = formData.get('captain_token') as string;

    if (!captainToken) {
      return NextResponse.json(
        { error: 'Token gereklidir' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Fetch team
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('id, status, update_count, player_invite_token')
      .eq('captain_token', captainToken)
      .single();

    if (teamError || !teamData) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 404 }
      );
    }

    // Check status
    if (teamData.status !== 'rejected') {
      return NextResponse.json(
        { error: 'Sadece reddedilen başvurular güncellenebilir' },
        { status: 400 }
      );
    }

    // Check update count
    if (teamData.update_count >= 2) {
      return NextResponse.json(
        { error: 'Maksimum güncelleme hakkınız dolmuştur' },
        { status: 400 }
      );
    }

    const teamId = teamData.id;

    // Fetch captain
    const { data: captainData, error: captainError } = await supabase
      .from('captains')
      .select('id')
      .eq('team_id', teamId)
      .single();

    if (captainError || !captainData) {
      return NextResponse.json(
        { error: 'Kaptan bilgisi bulunamadı' },
        { status: 500 }
      );
    }

    const captainId = captainData.id;

    // Get all form entries
    const entries = Array.from(formData.entries());
    const files: Record<string, File> = {};

    // Collect and validate files
    for (const [key, value] of entries) {
      if (value instanceof File && value.size > 0) {
        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(value.type)) {
          return NextResponse.json(
            { error: 'Geçersiz dosya formatı veya boyutu' },
            { status: 400 }
          );
        }

        // Validate file size
        if (value.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: 'Geçersiz dosya formatı veya boyutu' },
            { status: 400 }
          );
        }

        files[key] = value;
      }
    }

    // Process each file
    for (const [documentType, file] of Object.entries(files)) {
      try {
        const mappedDocumentType = DOCUMENT_TYPE_MAP[documentType];

        // Delete old document
        const { data: oldDocs } = await supabase
          .from('documents')
          .select('id')
          .eq('owner_id', captainId)
          .eq('owner_type', 'captain')
          .eq('document_type', mappedDocumentType);

        if (oldDocs && oldDocs.length > 0) {
          await supabase
            .from('documents')
            .delete()
            .eq('id', oldDocs[0].id);
        }

        // Upload new file
        const timestamp = Date.now();
        const filePath = `teams/${teamId}/captains/${captainId}/${mappedDocumentType}/${timestamp}-${file.name}`;

        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, arrayBuffer, {
            contentType: file.type,
          });

        if (uploadError) {
          console.error('File upload error:', uploadError);
          return NextResponse.json(
            { error: 'Güncelleme sırasında hata oluştu' },
            { status: 500 }
          );
        }

        // Insert new document record
        const { error: docError } = await supabase
          .from('documents')
          .insert({
            owner_type: 'captain',
            owner_id: captainId,
            team_id: teamId,
            document_type: mappedDocumentType,
            file_path: filePath,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
          });

        if (docError) {
          console.error('Document record insert error:', docError);
          return NextResponse.json(
            { error: 'Güncelleme sırasında hata oluştu' },
            { status: 500 }
          );
        }
      } catch (err) {
        console.error('File processing error:', err);
        return NextResponse.json(
          { error: 'Güncelleme sırasında hata oluştu' },
          { status: 500 }
        );
      }
    }

    // Update team status
    const { error: updateError } = await supabase
      .from('teams')
      .update({
        status: 'pending',
        update_count: teamData.update_count + 1,
        rejection_note: null,
      })
      .eq('id', teamId);

    if (updateError) {
      console.error('Team update error:', updateError);
      return NextResponse.json(
        { error: 'Güncelleme sırasında hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Güncelleme sırasında hata oluştu' },
      { status: 500 }
    );
  }
}
