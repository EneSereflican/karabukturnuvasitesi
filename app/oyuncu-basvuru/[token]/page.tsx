import { notFound } from 'next/navigation';
import OyuncuForm from '@/components/OyuncuForm';
import { playerInviteArchive } from '@/lib/portfolio-data';

interface OyuncuBasvuruPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function OyuncuBasvuruPage({
  params,
}: OyuncuBasvuruPageProps) {
  const { token } = await params;
  const isArchiveToken = token === playerInviteArchive.token;

  return (
    <div className="min-h-screen bg-[#0d1f12] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-white mb-4">Oyuncu Başvurusu</h1>
        <p className="text-gray-400 mb-6">
          Bu akış artık kapalı. Arşiv demo görünümü olarak takım anahtarına bağlı örnek bilgiler gösteriliyor.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#2d4a32] bg-[#0d1f12] p-4">
            <p className="text-gray-400 text-xs mb-1">Takım Anahtarı</p>
            <p className="text-[#f0a500] font-mono text-xl font-bold">{token}</p>
          </div>
          <div className="rounded-xl border border-[#2d4a32] bg-[#0d1f12] p-4">
            <p className="text-gray-400 text-xs mb-1">Arşiv Takımı</p>
            <p className="text-white font-semibold">{isArchiveToken ? playerInviteArchive.teamName : 'Karabük Üniversitesi'}</p>
            <p className="text-gray-500 text-sm">{isArchiveToken ? playerInviteArchive.teamInstitution : 'Karabük Üniversitesi'}</p>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-dashed border-[#2d4a32] bg-[#0d1f12] p-4 text-sm text-gray-300">
          Yeni oyuncu kaydı alınmıyor. Bu sayfa yalnızca turnuva dönemindeki sürecin nasıl göründüğünü göstermek için tutuluyor.
        </div>
      </div>
    </div>
  );
}
