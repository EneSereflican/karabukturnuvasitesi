import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateToken } from '@/lib/tokens';
import { sendCaptainWelcomeEmail } from '@/lib/email';

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

const OPTIONAL_FILES = ['other'];

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
      'team_name',
      'jersey_number',
    ];

    for (const field of requiredFields) {
      if (!formData.get(field)) {
        return NextResponse.json(
          { error: `${field} alanı zorunludur` },
          { status: 400 }
        );
      }
    }

    // Get optional field
    const jerseyColor = formData.get('jersey_color') as string | null;

    // Validate all files (required and optional)
    const allFileFields = [...REQUIRED_FILES, ...OPTIONAL_FILES];
    const files: Record<string, File> = {};

    for (const fileField of allFileFields) {
      const file = formData.get(fileField) as File | null;

      if (!file && REQUIRED_FILES.includes(fileField)) {
        return NextResponse.json(
          { error: `${fileField} dosyası zorunludur` },
          { status: 400 }
        );
      }

      if (file) {
        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          return NextResponse.json(
            {
              error: `${fileField}: Sadece PDF, JPG veya PNG dosyaları kabul edilir`,
            },
            { status: 400 }
          );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            {
              error: `${fileField}: Dosya boyutu 5 MB'dan küçük olmalıdır`,
            },
            { status: 400 }
          );
        }

        files[fileField] = file;
      }
    }

    // Generate tokens
    const captainToken = generateToken();
    const playerInviteToken = generateToken();

    // Create Supabase service client
    const supabase = createServiceClient();

    // Get form data
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const tcNo = formData.get('tc_no') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const institution = formData.get('institution') as string;
    const teamName = formData.get('team_name') as string;
    const jerseyNumber = formData.get('jersey_number') as string;

    // Insert into teams table
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: teamName,
        institution,
        jersey_color: jerseyColor || null,
        captain_token: captainToken,
        player_invite_token: playerInviteToken,
        status: 'pending',
      })
      .select('id')
      .single();

    if (teamError || !teamData) {
      console.error('Teams insert error:', teamError);
      return NextResponse.json(
        { error: 'Başvuru sırasında bir hata oluştu' },
        { status: 500 }
      );
    }

    const teamId = teamData.id;

    // Insert into captains table
    const { data: captainData, error: captainError } = await supabase
      .from('captains')
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

    if (captainError || !captainData) {
      console.error('Captains insert error:', captainError);
      return NextResponse.json(
        { error: 'Başvuru sırasında bir hata oluştu' },
        { status: 500 }
      );
    }

    const captainId = captainData.id;

    // Upload files and insert into documents table
    for (const [documentType, file] of Object.entries(files)) {
      try {
        const timestamp = Date.now();
        const filePath = `teams/${teamId}/captains/${captainId}/${documentType}/${timestamp}-${file.name}`;

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
            owner_type: 'captain',
            owner_id: captainId,
            team_id: teamId,
            document_type: documentType,
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

    // Send welcome email
    try {
      await sendCaptainWelcomeEmail({
        to: email,
        teamName,
        captainToken,
        playerInviteToken,
      });
    } catch (err) {
      console.error('Email sending error:', err);
      // Don't fail the entire process if email fails
    }

    return NextResponse.json(
      { success: true, captainToken },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Başvuru sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
