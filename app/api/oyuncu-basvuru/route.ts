import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const REQUIRED_FILES = [
  'tc_front',
  'tc_back',
  'work_certificate',
  'sgk_certificate',
  'passport_photo',
  'bank_receipt',
];

const OPTIONAL_FILES = ['other_document'];

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

    // Validate required form fields
    const requiredFields = [
      'first_name',
      'last_name',
      'tc_no',
      'phone',
      'email',
      'institution',
      'jersey_number',
      'invite_token',
    ];

    for (const field of requiredFields) {
      if (!formData.get(field)) {
        return NextResponse.json(
          { error: `${field} alanı zorunludur` },
          { status: 400 }
        );
      }
    }

    // Validate all files (required and optional)
    const allFileFields = [...REQUIRED_FILES, ...OPTIONAL_FILES];
    const files: Record<string, File> = {};

    for (const fileField of allFileFields) {
      const file = formData.get(fileField) as File | null;

      if (!file && REQUIRED_FILES.includes(fileField)) {
        return NextResponse.json(
          { error: 'Geçersiz dosya formatı veya boyutu' },
          { status: 400 }
        );
      }

      if (file) {
        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          return NextResponse.json(
            { error: 'Geçersiz dosya formatı veya boyutu' },
            { status: 400 }
          );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: 'Geçersiz dosya formatı veya boyutu' },
            { status: 400 }
          );
        }

        files[fileField] = file;
      }
    }

    // Create Supabase service client
    const supabase = createServiceClient();

    // Get form data
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const tcNo = formData.get('tc_no') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const institution = formData.get('institution') as string;
    const jerseyNumber = formData.get('jersey_number') as string;
    const inviteToken = formData.get('invite_token') as string;

    // Fetch team by invite token
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('id, name, status, update_count')
      .eq('player_invite_token', inviteToken)
      .single();

    if (teamError || !teamData) {
      return NextResponse.json(
        { error: 'Geçersiz davet linki' },
        { status: 404 }
      );
    }

    const teamId = teamData.id;

    // Check if team is approved
    if (teamData.status === 'approved') {
      return NextResponse.json(
        {
          error: 'Bu takımın başvurusu onaylanmıştır, yeni oyuncu kabul edilemiyor',
        },
        { status: 400 }
      );
    }

    // Check team capacity
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('id', { count: 'exact', head: true })
      .eq('team_id', teamId);

    if (playersError) {
      console.error('Players count error:', playersError);
      return NextResponse.json(
        { error: 'Başvuru sırasında bir hata oluştu' },
        { status: 500 }
      );
    }

    const playerCount = playersData?.length || 0;
    const totalMembers = playerCount + 1; // +1 for captain

    if (totalMembers >= 15) {
      return NextResponse.json(
        { error: 'Takım kontenjanı dolmuştur' },
        { status: 400 }
      );
    }

    // Insert into players table
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert({
        team_id: teamId,
        first_name: firstName,
        last_name: lastName,
        tc_no: tcNo,
        phone,
        email,
        institution,
        jersey_number: parseInt(jerseyNumber, 10),
      })
      .select('id')
      .single();

    if (playerError || !playerData) {
      console.error('Players insert error:', playerError);
      return NextResponse.json(
        { error: 'Başvuru sırasında bir hata oluştu' },
        { status: 500 }
      );
    }

    const playerId = playerData.id;

    // Upload files and insert into documents table
    for (const [documentType, file] of Object.entries(files)) {
      try {
        const timestamp = Date.now();
        const mappedDocumentType = DOCUMENT_TYPE_MAP[documentType];
        const sanitizedName = sanitizeFileName(file.name)
        const filePath = `teams/${teamId}/players/${playerId}/${mappedDocumentType}/${timestamp}-${sanitizedName}`;

        // Upload to Supabase Storage
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, arrayBuffer, {
            contentType: file.type,
          });

        if (uploadError) {
          console.error('File upload error:', uploadError);
          return NextResponse.json(
            { error: 'Başvuru sırasında bir hata oluştu' },
            { status: 500 }
          );
        }

        // Insert into documents table
        const { error: docError } = await supabase
          .from('documents')
          .insert({
            owner_type: 'player',
            owner_id: playerId,
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
            { error: 'Başvuru sırasında bir hata oluştu' },
            { status: 500 }
          );
        }
      } catch (err) {
        console.error('File processing error:', err);
        return NextResponse.json(
          { error: 'Başvuru sırasında bir hata oluştu' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Başvuru sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
