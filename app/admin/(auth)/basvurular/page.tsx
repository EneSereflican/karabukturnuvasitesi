import { createServiceClient } from '@/lib/supabase/server';
import Link from 'next/link';
import AdminFilter from '@/components/AdminFilter';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  User,
  ChevronRight,
  ClipboardList,
  Calendar,
} from 'lucide-react';

async function getTeamsWithDetails() {
  const supabase = createServiceClient();

  // Fetch all teams
  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .select(
      'id, name, institution, status, rejection_note, update_count, created_at'
    )
    .order('created_at', { ascending: false });

  if (teamsError || !teamsData) {
    return [];
  }

  // Fetch additional details for each team
  const teamsWithDetails = await Promise.all(
    teamsData.map(async (team) => {
      // Get captain info
      const { data: captainData } = await supabase
        .from('captains')
        .select('first_name, last_name')
        .eq('team_id', team.id)
        .limit(1)
        .single();

      // Get player count
      const { data: playersData } = await supabase
        .from('players')
        .select('id')
        .eq('team_id', team.id);

      const totalMembers = playersData?.length ?? 0;

      return {
        ...team,
        captainName: captainData
          ? `${captainData.first_name} ${captainData.last_name}`
          : 'N/A',
        totalMembers,
      };
    })
  );

  return teamsWithDetails;
}

type AdminPageProps = {
  searchParams: Promise<{ durum?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { durum } = await searchParams;
  const teams = await getTeamsWithDetails();
  const filter = durum || 'all';

  // Filter teams based on query param
  let filteredTeams = teams;
  if (filter === 'pending') {
    filteredTeams = teams.filter((t) => t.status === 'pending');
  } else if (filter === 'approved') {
    filteredTeams = teams.filter((t) => t.status === 'approved');
  } else if (filter === 'rejected') {
    filteredTeams = teams.filter((t) => t.status === 'rejected');
  } else if (filter === 'updated') {
    filteredTeams = teams.filter(
      (t) => t.status === 'rejected' && t.update_count > 0
    );
  }

  // Calculate stats
  const stats = {
    total: teams.length,
    pending: teams.filter((t) => t.status === 'pending').length,
    approved: teams.filter((t) => t.status === 'approved').length,
    rejected: teams.filter((t) => t.status === 'rejected').length,
  };

  // Format current date in Turkish
  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div style={{ backgroundColor: '#0d1f12' }} className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link href="/" className="text-gray-400 hover:text-white text-sm mb-4 inline-block">
          ← Ana Sayfaya Dön
        </Link>
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Başvuru Yönetimi</h1>
            <p className="text-gray-400 text-sm mt-1">
              Tüm takım başvurularını buradan yönetebilirsiniz.
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">{dateStr}</p>
          </div>
        </div>

        {/* Fikstür Yönetimi Link Card */}
        <Link href="/admin/fikstir" className="block mb-6">
          <div className="border border-[#2d4a32] hover:border-[#f0a500]/40 rounded-2xl p-5 transition-all"
            style={{ backgroundColor: '#1a2e1d' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(240,165,0,0.1)' }}>
                  <Calendar size={20} className="text-[#f0a500]" />
                </div>
                <div>
                  <p className="text-white font-semibold">Fikstür Yönetimi</p>
                  <p className="text-gray-400 text-sm">Maç ekle, skor gir, olay yönet</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-600" />
            </div>
          </div>
        </Link>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Applications */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: '#2d4a32',
            }}
            className="border rounded-2xl p-4 sm:p-6"
          >
            <Users size={20} className="text-gray-400 mb-2" />
            <p style={{ color: 'white' }} className="text-3xl font-bold mt-2">
              {stats.total}
            </p>
            <p className="text-gray-400 text-sm mt-2">Toplam Başvuru</p>
          </div>

          {/* Pending */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: 'rgba(234, 179, 8, 0.3)',
            }}
            className="border rounded-2xl p-4 sm:p-6 bg-opacity-5"
          >
            <Clock size={20} className="text-yellow-400 mb-2" />
            <p className="text-3xl font-bold mt-2 text-yellow-400">
              {stats.pending}
            </p>
            <p className="text-yellow-400/70 text-sm mt-2">Beklemede</p>
          </div>

          {/* Approved */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: 'rgba(34, 197, 94, 0.3)',
            }}
            className="border rounded-2xl p-4 sm:p-6 bg-opacity-5"
          >
            <CheckCircle2 size={20} className="text-green-400 mb-2" />
            <p className="text-3xl font-bold mt-2 text-green-400">
              {stats.approved}
            </p>
            <p className="text-green-400/70 text-sm mt-2">Onaylanan</p>
          </div>

          {/* Rejected */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: 'rgba(239, 68, 68, 0.3)',
            }}
            className="border rounded-2xl p-4 sm:p-6 bg-opacity-5"
          >
            <XCircle size={20} className="text-red-400 mb-2" />
            <p className="text-3xl font-bold mt-2 text-red-400">
              {stats.rejected}
            </p>
            <p className="text-red-400/70 text-sm mt-2">Reddedilen</p>
          </div>
        </div>

        {/* Filter and List Section */}
        <AdminFilter teams={teams} />

        {/* Teams List */}
        {filteredTeams.length === 0 ? (
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: '#2d4a32',
            }}
            className="border rounded-2xl p-16 text-center"
          >
            <ClipboardList
              size={48}
              className="text-gray-600 mx-auto mb-4"
            />
            <p className="text-white font-semibold mt-4">
              Bu filtrede başvuru bulunmamaktadır.
            </p>
            <p className="text-gray-400 text-sm mt-2">Farklı bir filtre seçin.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTeams.map((team, index) => {
              const isUpdated =
                team.status === 'rejected' && team.update_count > 0;
              const percentage = (team.totalMembers / 15) * 100;
              const progressColor =
                team.totalMembers < 10 ? '#ef4444' : '#f0a500';

              return (
                <Link
                  key={team.id}
                  href={`/admin/takim/${team.id}`}
                  className="group block transition-all"
                  style={{
                    backgroundColor: '#1a2e1d',
                    borderColor: '#2d4a32',
                  }}
                >
                  <div
                    className="border border-[#2d4a32] rounded-2xl p-4 sm:p-5 group-hover:border-[#f0a500]/40 hover:bg-[#1a2e1d]/80 transition-all cursor-pointer"
                    style={{
                      backgroundColor: '#1a2e1d',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Index */}
                      <div className="w-8 text-center text-gray-600 font-mono text-sm group-hover:text-[#f0a500] transition-colors">
                        {index + 1}
                      </div>

                      {/* Team Info */}
                      <div className="flex-1">
                        {/* Team name and status badges */}
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">
                            {team.name}
                          </h3>

                          {/* Status Badge */}
                          {team.status === 'pending' && (
                            <span
                              style={{
                                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                                borderColor: 'rgba(234, 179, 8, 0.3)',
                                color: '#facc15',
                              }}
                              className="text-xs px-2 py-0.5 rounded-full border"
                            >
                              Beklemede
                            </span>
                          )}
                          {team.status === 'approved' && (
                            <span
                              style={{
                                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                borderColor: 'rgba(34, 197, 94, 0.3)',
                                color: '#4ade80',
                              }}
                              className="text-xs px-2 py-0.5 rounded-full border"
                            >
                              Onaylandı
                            </span>
                          )}
                          {team.status === 'rejected' && (
                            <span
                              style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                borderColor: 'rgba(239, 68, 68, 0.3)',
                                color: '#f87171',
                              }}
                              className="text-xs px-2 py-0.5 rounded-full border"
                            >
                              Reddedildi
                            </span>
                          )}

                          {/* Updated Badge */}
                          {isUpdated && (
                            <span
                              style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                borderColor: 'rgba(59, 130, 246, 0.3)',
                                color: '#60a5fa',
                              }}
                              className="text-xs px-2 py-0.5 rounded-full border"
                            >
                              Güncellendi
                            </span>
                          )}
                        </div>

                        {/* Institution and Captain */}
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Building2 size={13} className="text-gray-500" />
                            <span className="text-gray-400">
                              {team.institution}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User size={13} className="text-gray-500" />
                            <span className="text-gray-400">
                              {team.captainName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Member Count and Progress */}
                      <div className="text-center">
                        <p style={{ color: 'white' }} className="font-mono text-sm">
                          {team.totalMembers}/15
                        </p>
                        <p className="text-gray-400 text-xs">üye</p>
                        <div className="w-16 h-1 bg-[#0d1f12] rounded-full mt-1 overflow-hidden">
                          <div
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: progressColor,
                            }}
                            className="h-full rounded-full transition-all"
                          />
                        </div>
                      </div>

                      {/* Chevron */}
                      <ChevronRight
                        size={20}
                        className="text-gray-600 group-hover:text-[#f0a500] transition-colors"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
