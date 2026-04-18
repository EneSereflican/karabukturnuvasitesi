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
  'other_document',
];

const OPTIONAL_FILES: string[] = [];

const DOCUMENT_TYPE_MAP: Record<string, string> = {
  tc_front: 'tc_front',
  tc_back: 'tc_back',
  work_certificate: 'work_certificate',
  sgk_certificate: 'sgk_certificate',
  passport_photo: 'passport_photo',
  other_document: 'other',
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get form data
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const tcNo = formData.get('tc_no') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const institution = formData.get('institution') as string;
    const jerseyNumber = formData.get('jersey_number') as string;
    const teamId = formData.get('team_id') as string;

    // Validations
    if (!firstName || firstName.trim() === '') {
      return NextResponse.json(
        { error: 'Ad alanı zorunludur. Lütfen adınızı girin.', field: 'first_name' },
        { status: 400 }
      );
    }

    if (!lastName || lastName.trim() === '') {
      return NextResponse.json(
        { error: 'Soyad alanı zorunludur. Lütfen soyadınızı girin.', field: 'last_name' },
        { status: 400 }
      );
    }

    if (!phone || phone.trim() === '') {
      return NextResponse.json(
        { error: 'Geçerli bir telefon numarası giriniz.', field: 'phone' },
        { status: 400 }
      );
    }

    if (!email || email.trim() === '') {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi giriniz.', field: 'email' },
        { status: 400 }
      );
    }

    if (!institution || institution.trim() === '') {
      return NextResponse.json(
        { error: 'Kurum adı zorunludur. Çalıştığınız kurumun adını girin.', field: 'institution' },
        { status: 400 }
      );
    }

    if (!jerseyNumber) {
      return NextResponse.json(
        { error: 'Forma numarası 1 ile 99 arasında olmalıdır.', field: 'jersey_number' },
        { status: 400 }
      );
    }

    const jerseyNum = parseInt(jerseyNumber, 10);
    if (isNaN(jerseyNum) || jerseyNum < 1 || jerseyNum > 99) {
      return NextResponse.json(
        { error: 'Forma numarası 1 ile 99 arasında olmalıdır.', field: 'jersey_number' },
        { status: 400 }
      );
    }

    if (tcNo && tcNo.trim() !== '' && tcNo.length !== 11) {
      return NextResponse.json(
        { error: 'TC kimlik numarası 11 haneli olmalıdır.', field: 'tc_no' },
        { status: 400 }
      );
    }

    // Check required files
    const fileChecks: Record<string, { label: string; field: string }> = {
      tc_front: { label: 'TC Kimlik Ön Yüz', field: 'tc_front' },
      tc_back: { label: 'TC Kimlik Arka Yüz', field: 'tc_back' },
      work_certificate: { label: 'Çalışma Belgesi', field: 'work_certificate' },
      sgk_certificate: { label: 'SGK Belgesi', field: 'sgk_certificate' },
      passport_photo: { label: 'Vesikalık Fotoğraf', field: 'passport_photo' },
      other_document: { label: 'Taahhütname', field: 'other_document' },
    };

    const files: Record<string, File> = {};

    for (const [fileField, { label }] of Object.entries(fileChecks)) {
      const file = formData.get(fileField) as File | null;

      if (!file || file.size === 0) {
        const errorMessages: Record<string, string> = {
          tc_front: 'TC Kimlik Ön Yüz belgesi zorunludur. Lütfen kimliğinizin ön yüzünü yükleyin.',
          tc_back: 'TC Kimlik Arka Yüz belgesi zorunludur. Lütfen kimliğinizin arka yüzünü yükleyin.',
          work_certificate: 'Çalışma belgesi zorunludur. Kurumunuzdan aldığınız çalışma belgesini yükleyin.',
          sgk_certificate: 'SGK belgesi zorunludur. SGK hizmet dökümünüzü yükleyin.',
          passport_photo: 'Vesikalık fotoğraf zorunludur. Güncel vesikalık fotoğrafınızı yükleyin.',
          other_document: 'Taahhütname zorunludur. İmzalı taahhütnameyi taratarak yükleyin.',
        };

        return NextResponse.json(
          { error: errorMessages[fileField] || `${label} belgesi zorunludur.`, field: fileField },
          { status: 400 }
        );
      }

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `${label}: Geçersiz dosya formatı. Yalnızca PDF, JPG veya PNG yükleyebilirsiniz.`, field: 'file_format' },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${label}: Dosya boyutu 5 MB limitini aşıyor. Daha küçük bir dosya yükleyin.`, field: 'file_size' },
          { status: 400 }
        );
      }

      files[fileField] = file;
    }

    // Create Supabase service client
    const supabase = createServiceClient();

    // Fetch team by team_id
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('id, name, status, update_count')
      .eq('id', teamId)
      .single();

    if (teamError || !teamData) {
      return NextResponse.json(
        { error: 'Geçersiz takım anahtarı. Lütfen takım sorumlusundan aldığınız anahtarı kontrol edin.', field: 'team_key' },
        { status: 404 }
      );
    }

    // Check if team is approved
    if (teamData.status === 'approved') {
      return NextResponse.json(
        { error: 'Bu takımın başvurusu onaylanmıştır. Yeni oyuncu kaydı kabul edilememektedir.', field: 'team' },
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
        { error: 'Kayıt oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin. Sorun devam ederse yönetici ile iletişime geçin.', field: 'database' },
        { status: 500 }
      );
    }

    const playerCount = playersData?.length || 0;

    if (playerCount >= 15) {
      return NextResponse.json(
        { error: 'Bu takımın kontenjanı dolmuştur. Maksimum 15 oyuncuya ulaşılmıştır.', field: 'team' },
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
        tc_no: tcNo || null,
        phone,
        email,
        institution,
        jersey_number: jerseyNum,
      })
      .select('id')
      .single();

    if (playerError || !playerData) {
      console.error('Players insert error:', playerError);
      return NextResponse.json(
        { error: 'Kayıt oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin. Sorun devam ederse yönetici ile iletişime geçin.', field: 'database' },
        { status: 500 }
      );
    }

    const playerId = playerData.id;

    // Upload files and insert into documents table
    for (const [documentType, file] of Object.entries(files)) {
      try {
        const timestamp = Date.now();
        const mappedDocumentType = DOCUMENT_TYPE_MAP[documentType];
        const sanitizedName = sanitizeFileName(file.name);
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
          const fileChecksReverse = Object.entries(fileChecks).find(([key]) => key === documentType);
          const label = fileChecksReverse ? fileChecksReverse[1].label : 'Dosya';
          return NextResponse.json(
            { error: `${label} yüklenirken bir sorun oluştu. İnternet bağlantınızı kontrol edip tekrar deneyin.`, field: 'upload' },
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
            { error: 'Kayıt oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin. Sorun devam ederse yönetici ile iletişime geçin.', field: 'database' },
            { status: 500 }
          );
        }
      } catch (err) {
        console.error('File processing error:', err);
        return NextResponse.json(
          { error: 'Kayıt oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin. Sorun devam ederse yönetici ile iletişime geçin.', field: 'database' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Kayıt oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin. Sorun devam ederse yönetici ile iletişime geçin.', field: 'database' },
      { status: 500 }
    );
  }
}
