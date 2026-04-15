import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import BasvuruFilter from '@/components/BasvuruFilter';
import { Building2, User, AlertCircle, Info } from 'lucide-react';

interface BasvuruDurumlariPageProps {
  searchParams: Promise<{
    durum?: string;
  }>;
}

export default async function BasvuruDurumlariPage({
  searchParams,
}: BasvuruDurumlariPageProps) {
  const params = await searchParams;
  const durum = params.durum || null;

  const supabase = createServiceClient();

  // Fetch all teams
  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .select('id, name, institution, status, created_at')
    .order('created_at', { ascending: true });

  if (teamsError) {
    return (
      <div className="min-h-screen bg-[#0d1f12] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-400">Veri yüklenirken bir hata oluştu.</p>
        </div>
      </div>
    );
  }

  const teams = teamsData || [];

  // Fetch player counts for each team
  const teamsWithMembers = await Promise.all(
    teams.map(async (team) => {
      const { data: playersData } = await supabase
        .from('players')
        .select('id')
        .eq('team_id', team.id);

      const totalMembers = 1 + (playersData?.length ?? 0);

      return {
        ...team,
        totalMembers,
      };
    })
  );

  // Calculate counts
  const counts = {
    all: teamsWithMembers.length,
    pending: teamsWithMembers.filter((t) => t.status === 'pending').length,
    approved: teamsWithMembers.filter((t) => t.status === 'approved').length,
    rejected: teamsWithMembers.filter((t) => t.status === 'rejected').length,
  };

  // Filter teams based on active filter
  const filteredTeams = durum
    ? teamsWithMembers.filter((t) => t.status === durum)
    : teamsWithMembers;

  // Determine active filter for display
  const activeFilter = durum || 'all';

  return (
    <div className="min-h-screen bg-[#0d1f12] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Link */}
        <Link href="/">
          <p className="text-gray-400 text-sm hover:text-white transition-colors mb-6 block">
            ← Ana Sayfa
          </p>
        </Link>

        {/* Center Section */}
        <div className="text-center mb-12">
          <div className="inline-block bg-[#f0a500]/20 border border-[#f0a500]/30 rounded-full px-4 py-2 mb-6">
            <span className="text-[#f0a500] text-sm font-semibold">Canlı Takip</span>
          </div>

          <h1 className="text-white text-4xl font-bold mb-2">Başvuru Durumları</h1>
          <p className="text-gray-400 mb-8">
            Karabük Kamu Kurumları Bahar Futbol Turnuvası 2026
          </p>

          {/* İstatistik Satırı */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center">
              <p className="text-[#f0a500] text-3xl font-bold">{counts.all}</p>
              <p className="text-gray-400 text-sm">Toplam Takım</p>
            </div>

            <div className="hidden sm:block w-px h-12 bg-[#2d4a32]"></div>

            <div className="text-center">
              <p className="text-[#f0a500] text-3xl font-bold">{counts.approved}</p>
              <p className="text-gray-400 text-sm">Onaylanan</p>
            </div>

            <div className="hidden sm:block w-px h-12 bg-[#2d4a32]"></div>

            <div className="text-center">
              <p className="text-[#f0a500] text-3xl font-bold">{counts.pending}</p>
              <p className="text-gray-400 text-sm">Beklemedeki</p>
            </div>
          </div>
        </div>

        {/* 2) FİLTRE SEKMELERİ */}
        <BasvuruFilter active={activeFilter} counts={counts} />

        {/* 3) TAKIM KARTLARI */}
        {filteredTeams.length === 0 ? (
          <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-16 text-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-16 h-16 mx-auto text-gray-500"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            <p className="text-white font-semibold mt-4">Henüz başvuru bulunmamaktadır.</p>
            <p className="text-gray-400 text-sm mt-2">
              İlk başvuruyu yapmak için aşağıdaki butona tıklayın.
            </p>
            <Link href="/basvuru/kaptan">
              <button className="bg-[#f0a500] text-[#0d1f12] font-bold rounded-xl px-6 py-3 mt-6 hover:bg-[#e09500] transition-colors">
                Takım Başvurusu Yap
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {filteredTeams.map((team) => {
              const statusColors: Record<
                string,
                {
                  bg: string;
                  text: string;
                  borderColor: string;
                  label: string;
                }
              > = {
                pending: {
                  bg: 'bg-yellow-500/20',
                  text: 'text-yellow-400',
                  borderColor: 'border-yellow-500/30',
                  label: 'Beklemede',
                },
                approved: {
                  bg: 'bg-green-500/20',
                  text: 'text-green-400',
                  borderColor: 'border-green-500/30',
                  label: 'Onaylandı',
                },
                rejected: {
                  bg: 'bg-red-500/20',
                  text: 'text-red-400',
                  borderColor: 'border-red-500/30',
                  label: 'Reddedildi',
                },
              };

              const statusColor = statusColors[team.status] || statusColors.pending;
              const circleBorder: Record<string, string> = {
                pending: 'border-yellow-500/50',
                approved: 'border-green-500/50',
                rejected: 'border-red-500/50',
              };

              return (
                <div key={team.id}>
                  <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-6 hover:border-[#f0a500]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      {/* Sol Taraf */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-white font-bold text-xl">{team.name}</h2>
                          <div
                            className={`border ${statusColor.borderColor} text-xs font-medium px-3 py-1 rounded-full ${statusColor.bg} ${statusColor.text}`}
                          >
                            {statusColor.label}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Building2 size={14} className="text-gray-500" />
                            <p className="text-gray-400 text-sm">{team.institution}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <User size={14} className="text-gray-500" />
                            <p className="text-gray-400 text-sm">{team.totalMembers}/15 üye</p>
                          </div>
                        </div>
                      </div>

                      {/* Sağ Taraf - Sayaç */}
                      <div
                        className={`w-16 h-16 rounded-full border-2 ${
                          circleBorder[team.status] || circleBorder.pending
                        } flex flex-col items-center justify-center shrink-0 ms-4`}
                      >
                        <p className="text-white font-bold text-lg">{team.totalMembers}</p>
                        <p className="text-gray-400 text-xs">/15</p>
                      </div>
                    </div>

                    {/* Red Notu */}
                    {team.status === 'rejected' && (
                      <div className="mt-4 space-y-3">
                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                          <p className="text-red-400 text-sm">
                            Başvuru reddedilmiştir. Detaylar için takım sorumlusuna ulaşın.
                          </p>
                        </div>
                        <Link href="/belge-guncelle">
                          <button className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-3 py-1.5 text-sm hover:bg-red-500/30 transition-colors">
                            Belge Güncelle →
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5) ALT BİLGİ NOTU */}
        <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-4 mt-8 flex items-center gap-3">
          <Info size={16} className="text-[#f0a500] shrink-0" />
          <p className="text-gray-400 text-sm">
            Başvurunuzun durumunu takip etmek için kayıt sırasında e-posta adresinize gönderilen takip linkini
            kullanın.
          </p>
        </div>
      </div>
    </div>
  );
}
