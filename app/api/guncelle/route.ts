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

const documentTypeLabels: Record<string, string> = {
  tc_front: 'TC Kimlik Ön Yüz',
  tc_back: 'TC Kimlik Arka Yüz',
  work_certificate: 'Çalışma Belgesi',
  sgk_certificate: 'SGK Belgesi',
  passport_photo: 'Vesikalık Fotoğraf',
  bank_receipt: 'Banka Dekontu',
  other: 'Diğer Belge',
};

export async function POST(request: NextRequest) {
  try {
    console.log('Guncelle endpoint hit');
    const formData = await request.formData();
    const team_key = formData.get('team_key') as string;
    const player_id = formData.get('player_id') as string;

    if (!team_key || !player_id) {
      return NextResponse.json(
        { error: 'Takım anahtarı ve oyuncu ID gerekli' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Fetch team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, status, rejection_note')
      .eq('team_key', team_key)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Geçersiz takım anahtarı' },
        { status: 404 }
      );
    }

    if (team.status !== 'rejected') {
      return NextResponse.json(
        { error: 'Sadece reddedilen başvurular güncellenebilir' },
        { status: 400 }
      );
    }

    // Fetch player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, team_id')
      .eq('id', player_id)
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { error: 'Oyuncu bulunamadı' },
        { status: 404 }
      );
    }

    if (player.team_id !== team.id) {
      return NextResponse.json(
        { error: 'Bu oyuncu bu takıma ait değil' },
        { status: 400 }
      );
    }

    // Process files
    const documentTypes = [
      'tc_front',
      'tc_back',
      'work_certificate',
      'sgk_certificate',
      'passport_photo',
      'bank_receipt',
      'other',
    ];

    for (const docType of documentTypes) {
      // Map form field names - form sends 'other_document' for 'other' docType
      const formFieldName = docType === 'other' ? 'other_document' : docType;
      const file = formData.get(formFieldName) as File | null;

      if (!file) continue;

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `${documentTypeLabels[docType]}: Geçersiz dosya türü. PDF, JPG veya PNG dosyaları kabul edilir.` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${documentTypeLabels[docType]}: Dosya boyutu 5MB'dan büyük` },
          { status: 400 }
        );
      }

      // Delete old document record
      const { data: oldDocs } = await supabase
        .from('documents')
        .select('id, file_path')
        .eq('team_id', team.id)
        .eq('owner_id', player.id)
        .eq('document_type', docType);

      if (oldDocs && oldDocs.length > 0) {
        for (const oldDoc of oldDocs) {
          // Delete from storage
          await supabase.storage
            .from('documents')
            .remove([oldDoc.file_path]);

          // Delete from database
          await supabase.from('documents').delete().eq('id', oldDoc.id);
        }
      }

      // Upload new file
      const timestamp = Date.now();
      const sanitized = sanitizeFileName(file.name);
      const filePath = `teams/${team.id}/players/${player.id}/${docType}/${timestamp}-${sanitized}`;

      const buffer = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: 'Dosya yükleme hatası' },
          { status: 500 }
        );
      }
      const dbDocType = docType === 'other_document' ? 'other' : docType;
      const { error: insertError } = await supabase
        .from('documents')
        .insert([
          {
            team_id: team.id,
            owner_type: 'player',
            owner_id: player.id,
            document_type: dbDocType,
            file_path: filePath,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
          },
        ]);

      if (insertError) {
        return NextResponse.json(
          { error: 'Veritabanı hatası' },
          { status: 500 }
        );
      }
    }

    // Update team status
    const { error: updateError } = await supabase
      .from('teams')
      .update({
        status: 'pending',
        rejection_note: null,
      })
      .eq('id', team.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Takım güncelleme hatası' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Guncelle error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
