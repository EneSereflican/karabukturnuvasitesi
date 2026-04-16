import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import BasvuruFilter from '@/components/BasvuruFilter';
import DekontYukle from '@/components/DekontYukle';
import { Building2, User } from 'lucide-react';

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
    .select('id, name, institution, status, rejection_note, rejected_player_ids, created_at, team_key')
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

  // Fetch player counts and receipt data for each team
  const teamsWithMembers = await Promise.all(
    teams.map(async (team) => {
      const { data: playersData } = await supabase
        .from('players')
        .select('id, first_name, last_name, jersey_number')
        .eq('team_id', team.id)
        .order('jersey_number', { ascending: true });

      const totalMembers = playersData?.length ?? 0;

      // Check for bank receipt
      const { data: receiptDoc } = await supabase
        .from('documents')
        .select('id')
        .eq('team_id', team.id)
        .eq('owner_type', 'team')
        .eq('document_type', 'bank_receipt')
        .single();

      const hasReceipt = !!receiptDoc;

      return {
        ...team,
        totalMembers,
        players: playersData ?? [],
        hasReceipt,
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
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6"
        >
          ← Ana Sayfaya Dön
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
                        {team.rejection_note && (
                          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                            <p className="text-red-400 text-xs font-medium">Red Gerekçesi:</p>
                            <p className="text-red-300 text-sm mt-1">{team.rejection_note}</p>
                          </div>
                        )}

                        {team.rejected_player_ids && team.rejected_player_ids.length > 0 && (
                          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                            <p className="text-red-400 text-xs font-medium">Sorunlu Oyuncular:</p>
                            <div className="mt-2 space-y-1">
                              {team.rejected_player_ids.map((playerId: string) => {
                                const player = team.players.find((p) => p.id === playerId);
                                if (!player) return null;
                                return (
                                  <p key={playerId} className="text-red-300 text-sm">
                                    • {player.first_name} {player.last_name}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <Link href="/belge-guncelle">
                          <button className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-3 py-1.5 text-sm hover:bg-red-500/30 transition-colors">
                            Belge Güncelle →
                          </button>
                        </Link>
                      </div>
                    )}

                    {/* Dekont Bölümü */}
                    {team.status !== 'approved' && (
                      <DekontYukle teamKey={team.team_key} hasReceipt={team.hasReceipt} />
                    )}

                    {/* Kayıtlı Oyuncular Bölümü */}
                    <div className="border-t border-[#2d4a32] mt-4 pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-gray-400 text-xs font-medium">Kayıtlı Oyuncular</p>
                        <p className="text-gray-400 text-xs">{team.players.length}/15</p>
                      </div>

                      {team.players.length === 0 ? (
                        <div className="bg-[#0d1f12] rounded-lg p-3 text-center">
                          <p className="text-gray-400 text-xs">Henüz oyuncu kaydı bulunmamaktadır.</p>
                        </div>
                      ) : (
                        <div className="space-y-0">
                          {team.players.slice(0, 15).map((player, index) => (
                            <div
                              key={player.id}
                              className={`flex items-center gap-3 py-1.5 ${
                                index < team.players.length - 1
                                  ? 'border-b border-[#2d4a32]/50'
                                  : ''
                              }`}
                            >
                              <div className="w-7 h-7 rounded-full bg-[#f0a500]/10 border border-[#f0a500]/30 text-[#f0a500] text-xs font-bold flex items-center justify-center shrink-0">
                                {player.jersey_number || '-'}
                              </div>
                              <p className="text-white text-sm">
                                {player.first_name} {player.last_name}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}


      </div>
    </div>
  );
}
