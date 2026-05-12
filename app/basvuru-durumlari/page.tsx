import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import BasvuruFilter from '@/components/BasvuruFilter';
import DekontYukle from '@/components/DekontYukle';
import TakimKart from '@/components/TakimKart';
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

  const supabase = await createClient();

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
            {filteredTeams.map((team) => (
              <TakimKart key={team.id} team={team} />
            ))}
          </div>
        )}


      </div>
    </div>
  );
}
