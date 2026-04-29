import { createServiceClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  Clock,
  Zap,
  Calendar,
  Trophy,
  ExternalLink,
} from 'lucide-react';

async function getDashboardStats() {
  const supabase = createServiceClient();

  try {
    // Get all teams
    const { data: allTeams, error: teamsError } = await supabase
      .from('teams')
      .select('id, status');

    if (teamsError || !allTeams) {
      throw new Error('Failed to fetch teams');
    }

    // Get all players
    const { data: allPlayers, error: playersError } = await supabase
      .from('players')
      .select('id', { count: 'exact' });

    if (playersError) {
      throw new Error('Failed to fetch players');
    }

    // Get all matches
    const { data: allMatches, error: matchesError } = await supabase
      .from('matches')
      .select('id, status');

    if (matchesError) {
      throw new Error('Failed to fetch matches');
    }

    return {
      totalTeams: allTeams.length,
      approvedTeams: allTeams.filter((t) => t.status === 'approved').length,
      pendingTeams: allTeams.filter((t) => t.status === 'pending').length,
      totalPlayers: allPlayers?.length ?? 0,
      totalMatches: allMatches?.length ?? 0,
      completedMatches: allMatches?.filter((m) => m.status === 'completed')
        .length ?? 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalTeams: 0,
      approvedTeams: 0,
      pendingTeams: 0,
      totalPlayers: 0,
      totalMatches: 0,
      completedMatches: 0,
    };
  }
}

type AdminPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const stats = await getDashboardStats();

  return (
    <div style={{ backgroundColor: '#0d1f12' }} className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Turnuva yönetimi ve istatistikleri buradan kontrol edebilirsiniz.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Total Teams */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: '#2d4a32',
            }}
            className="border rounded-lg p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">Toplam Takım</span>
              <Users size={18} className="text-gray-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalTeams}</p>
          </div>

          {/* Approved Teams */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: 'rgba(34, 197, 94, 0.3)',
            }}
            className="border rounded-lg p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-green-400/70 text-sm">Onaylanan Takım</span>
              <CheckCircle2 size={18} className="text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">
              {stats.approvedTeams}
            </p>
          </div>

          {/* Pending Teams */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: 'rgba(234, 179, 8, 0.3)',
            }}
            className="border rounded-lg p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-yellow-400/70 text-sm">Beklemede</span>
              <Clock size={18} className="text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-yellow-400">
              {stats.pendingTeams}
            </p>
          </div>

          {/* Total Players */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: 'rgba(59, 130, 246, 0.3)',
            }}
            className="border rounded-lg p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-blue-400/70 text-sm">Toplam Oyuncu</span>
              <Zap size={18} className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {stats.totalPlayers}
            </p>
          </div>

          {/* Total Matches */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: 'rgba(168, 85, 247, 0.3)',
            }}
            className="border rounded-lg p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-purple-400/70 text-sm">Toplam Maç</span>
              <Calendar size={18} className="text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {stats.totalMatches}
            </p>
          </div>

          {/* Completed Matches */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: 'rgba(236, 72, 153, 0.3)',
            }}
            className="border rounded-lg p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-pink-400/70 text-sm">Tamamlanan Maç</span>
              <Trophy size={18} className="text-pink-400" />
            </div>
            <p className="text-3xl font-bold text-pink-400">
              {stats.completedMatches}
            </p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Başvuru Yönetimi */}
          <Link href="/admin/basvurular">
            <div
              style={{
                backgroundColor: '#1a2e1d',
                borderColor: '#2d4a32',
              }}
              className="border rounded-lg p-6 sm:p-8 hover:border-[#f0a500]/40 transition-all cursor-pointer group min-h-48 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(240,165,0,0.1)' }}
                  >
                    <Users size={24} className="text-[#f0a500]" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Başvuru Yönetimi
                </h2>
                <p className="text-gray-400 text-sm">
                  Takım başvurularını incele, onayla veya reddet
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4 text-[#f0a500] group-hover:gap-3 transition-all">
                <span className="text-sm font-medium">Devam Et</span>
                <span>→</span>
              </div>
            </div>
          </Link>

          {/* Fikstür Yönetimi */}
          <Link href="/admin/fikstir">
            <div
              style={{
                backgroundColor: '#1a2e1d',
                borderColor: '#2d4a32',
              }}
              className="border rounded-lg p-6 sm:p-8 hover:border-[#f0a500]/40 transition-all cursor-pointer group min-h-48 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(240,165,0,0.1)' }}
                  >
                    <Calendar size={24} className="text-[#f0a500]" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Fikstür Yönetimi
                </h2>
                <p className="text-gray-400 text-sm">
                  Maç ekle, skor gir, gol ve kart bilgilerini yönet
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4 text-[#f0a500] group-hover:gap-3 transition-all">
                <span className="text-sm font-medium">Devam Et</span>
                <span>→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        <div
          style={{
            backgroundColor: '#1a2e1d',
            borderColor: '#2d4a32',
          }}
          className="border rounded-lg p-6"
        >
          <p className="text-gray-400 text-sm mb-4">Hızlı Linkler</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://turnuvaburada.com.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#f0a500] hover:text-[#f0a500]/80 transition-colors"
            >
              <span>Siteyi Görüntüle</span>
              <ExternalLink size={14} />
            </a>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <Link href="/fikstir" className="text-[#f0a500] hover:text-[#f0a500]/80 transition-colors">
              Fikstür
            </Link>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <Link href="/puan-durumu" className="text-[#f0a500] hover:text-[#f0a500]/80 transition-colors">
              Puan Durumu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
