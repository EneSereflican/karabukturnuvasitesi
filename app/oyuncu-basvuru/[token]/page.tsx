import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OyuncuForm from '@/components/OyuncuForm';

interface OyuncuBasvuruPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function OyuncuBasvuruPage({
  params,
}: OyuncuBasvuruPageProps) {
  const { token } = await params;

  const supabase = await createClient();

  // Fetch team by invite token
  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select('id, name, institution, status, update_count')
    .eq('player_invite_token', token)
    .single();

  if (teamError || !teamData) {
    notFound();
  }

  // Fetch players
  const { data: playersData } = await supabase
    .from('players')
    .select('id')
    .eq('team_id', teamData.id);

  const totalMembers = 1 + (playersData?.length ?? 0);
  const spotsLeft = 15 - totalMembers;

  // Check if team is approved
  if (teamData.status === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Başvuru Kapalı
          </h1>
          <p className="text-gray-600">
            Bu takımın başvurusu onaylanmıştır. Yeni oyuncu kaydı kabul
            edilmemektedir.
          </p>
        </div>
      </div>
    );
  }

  // Check if team is full
  if (spotsLeft <= 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Kontenjan Doldu
          </h1>
          <p className="text-gray-600">
            Bu takımda boş yer kalmamıştır.
          </p>
        </div>
      </div>
    );
  }

  return (
    <OyuncuForm
      inviteToken={token}
      teamName={teamData.name}
      teamInstitution={teamData.institution}
      spotsLeft={spotsLeft}
      totalMembers={totalMembers}
    />
  );
}
