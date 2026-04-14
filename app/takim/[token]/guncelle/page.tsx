import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import GuncelleForm from '@/components/GuncelleForm';

interface GuncellePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function GuncellePage({ params }: GuncellePageProps) {
  const { token } = await params;

  const supabase = createServiceClient();

  // Fetch team
  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select('id, name, status, rejection_note, update_count')
    .eq('captain_token', token)
    .single();

  if (teamError || !teamData) {
    notFound();
  }

  // Check if status is rejected
  if (teamData.status !== 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Güncelleme Gerekmiyor
          </h1>
          <p className="text-gray-600 mb-6">
            Başvurunuz şu an reddedilmiş durumda değil.
          </p>
          <Link
            href={`/takim/${token}`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Takip Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  // Check if update count exceeded
  if (teamData.update_count >= 2) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Güncelleme Hakkı Doldu
          </h1>
          <p className="text-gray-600 mb-6">
            Maksimum 2 güncelleme hakkınızı kullandınız. Organizasyon ile
            doğrudan iletişime geçin.
          </p>
          <Link
            href={`/takim/${token}`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Takip Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <GuncelleForm
      captainToken={token}
      teamName={teamData.name}
      rejectionNote={teamData.rejection_note}
      updateCount={teamData.update_count}
    />
  );
}
