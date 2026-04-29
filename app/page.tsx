import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Calendar,
  BarChart2,
  Lock,
  Users,
} from 'lucide-react';

interface Match {
  id: string;
  week: number;
  match_date: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team: { id: string; name: string } | null;
  away_team: { id: string; name: string } | null;
}

async function getHomePageData() {
  const supabase = createServiceClient();

  try {
    // Get teams count
    const { count: teamsCount, error: teamsError } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true });

    // Get players count
    const { count: playersCount, error: playersError } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });

    // Get all matches with team info
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        week,
        match_date,
        status,
        home_score,
        away_score,
        home_team:teams!home_team_id(id, name),
        away_team:teams!away_team_id(id, name)
      `)
      .order('match_date', { ascending: true });

    // Get match events count
    const { count: eventsCount, error: eventsError } = await supabase
      .from('match_events')
      .select('*', { count: 'exact', head: true });

    const matches = (matchesData as unknown as Match[]) || [];

    // Get last 3 completed matches
    const completedMatches = matches
      .filter((m) => m.status === 'completed' && m.home_score !== null && m.away_score !== null)
      .reverse()
      .slice(0, 3);

    // Get next 3 scheduled matches
    const now = new Date();
    const upcomingMatches = matches
      .filter((m) => m.status === 'scheduled' && new Date(m.match_date) > now)
      .slice(0, 3);

    return {
      teamsCount: teamsCount || 0,
      playersCount: playersCount || 0,
      eventsCount: eventsCount || 0,
      completedMatches,
      upcomingMatches,
      allMatches: matches,
    };
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return {
      teamsCount: 0,
      playersCount: 0,
      eventsCount: 0,
      completedMatches: [],
      upcomingMatches: [],
      allMatches: [],
    };
  }
}

function formatMatchDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function Home() {
  const data = await getHomePageData();
  const completedMatchesCount = data.allMatches.filter((m) => m.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[#0d1f12] text-white">
      {/* NAVBAR */}
      <nav
        className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-[#2d4a32]"
        style={{ backgroundColor: 'rgba(13, 31, 18, 0.9)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-[#f0a500]">
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="16" r="4" fill="currentColor" />
                <path d="M16 2 L16 8 M16 24 L16 30" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 16 L8 16 M24 16 L30 16" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <h1 className="text-lg font-bold hidden sm:block">Karabük Turnuvası</h1>
            </div>
          </Link>

          {/* Middle: Navigation Links (desktop only) */}
          <div className="hidden md:flex gap-6">
            <Link href="/fikstir" className="text-gray-400 hover:text-[#f0a500] text-sm transition-colors">
              Fikstür
            </Link>
            <Link href="/puan-durumu" className="text-gray-400 hover:text-[#f0a500] text-sm transition-colors">
              Puan Durumu
            </Link>
            <Link href="/istatistikler" className="text-gray-400 hover:text-[#f0a500] text-sm transition-colors">
              İstatistikler
            </Link>
            <Link href="/basvuru-durumlari" className="text-gray-400 hover:text-[#f0a500] text-sm transition-colors">
              Başvuru Durumları
            </Link>
          </div>

          {/* Right: Buttons */}
          <div className="flex gap-2 items-center">
            <Link href="/basvuru/kaptan">
              <Button className="bg-[#f0a500] text-[#0d1f12] hover:bg-[#e09500] px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium">
                Takım Oluştur
              </Button>
            </Link>
            <Link href="/oyuncu-basvuru">
              <Button
                variant="outline"
                className="bg-transparent border border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500]/10 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium"
              >
                Takıma Katıl
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center px-4 py-12 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(13,31,18,0.75) 0%, rgba(13,31,18,0.88) 100%), url('/saha.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div
              className="px-4 py-2 rounded-full border border-[#f0a500]/40 flex items-center gap-2"
              style={{ backgroundColor: 'rgba(240, 165, 0, 0.1)' }}
            >
              <span className="text-[#f0a500] text-sm font-medium">⚽ Turnuva Devam Ediyor</span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
            <span className="text-white">Karabük Kamu Kurumları</span>
            <br />
            <span className="text-[#f0a500]">Bahar Futbol Turnuvası 2026</span>
          </h1>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 my-8 text-gray-300">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#f0a500]">{data.teamsCount}</p>
              <p className="text-sm">Takım</p>
            </div>
            <p className="self-center text-gray-500">•</p>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#f0a500]">{data.playersCount}</p>
              <p className="text-sm">Oyuncu</p>
            </div>
            <p className="self-center text-gray-500">•</p>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#f0a500]">{completedMatchesCount}</p>
              <p className="text-sm">Maç Tamamlandı</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link href="/puan-durumu">
              <Button className="bg-[#f0a500] text-[#0d1f12] hover:bg-[#e09500] font-medium gap-2">
                <Trophy size={18} />
                Puan Durumu
              </Button>
            </Link>
            <Link href="/fikstir">
              <Button
                variant="outline"
                className="border border-white text-white hover:bg-white/10 font-medium gap-2"
              >
                <Calendar size={18} />
                Fikstür
              </Button>
            </Link>
            <Link href="/istatistikler">
              <Button
                variant="outline"
                className="border border-white text-white hover:bg-white/10 font-medium gap-2"
              >
                <BarChart2 size={18} />
                İstatistikler
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* MATCHES SECTION */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Last Matches */}
            <div
              className="rounded-lg p-6 sm:p-8 border border-[#2d4a32]"
              style={{ backgroundColor: '#1a2e1d' }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy size={24} className="text-[#f0a500]" />
                Son Maçlar
              </h2>

              {data.completedMatches.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {data.completedMatches.map((match) => {
                    const homeWin = (match.home_score ?? 0) > (match.away_score ?? 0);
                    const awayWin = (match.away_score ?? 0) > (match.home_score ?? 0);
                    return (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-[#2d4a32]/50 hover:border-[#f0a500]/30 transition-colors"
                      >
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${homeWin ? 'text-[#f0a500]' : 'text-white'}`}>
                            {match.home_team?.name || 'Team'}
                          </p>
                        </div>
                        <div className="px-4 text-center">
                          <p className="text-lg font-bold text-white">
                            {match.home_score} - {match.away_score}
                          </p>
                        </div>
                        <div className="flex-1 text-right">
                          <p className={`text-sm font-semibold ${awayWin ? 'text-[#f0a500]' : 'text-white'}`}>
                            {match.away_team?.name || 'Team'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 mb-6">Henüz maç bilgisi yok</p>
              )}

              <Link href="/fikstir" className="text-[#f0a500] hover:text-[#e09500] text-sm font-medium">
                Tüm Fikstür →
              </Link>
            </div>

            {/* Upcoming Matches */}
            <div
              className="rounded-lg p-6 sm:p-8 border border-[#2d4a32]"
              style={{ backgroundColor: '#1a2e1d' }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar size={24} className="text-[#f0a500]" />
                Yaklaşan Maçlar
              </h2>

              {data.upcomingMatches.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {data.upcomingMatches.map((match) => (
                    <div
                      key={match.id}
                      className="p-4 rounded-lg border border-[#2d4a32]/50 hover:border-[#f0a500]/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-white">{match.home_team?.name || 'Team'}</p>
                        <span className="text-xs text-gray-400">vs</span>
                        <p className="text-sm font-semibold text-white">{match.away_team?.name || 'Team'}</p>
                      </div>
                      <p className="text-xs text-gray-400">{formatMatchDate(match.match_date)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 mb-6">Henüz maç bilgisi yok</p>
              )}

              <Link href="/fikstir" className="text-[#f0a500] hover:text-[#e09500] text-sm font-medium">
                Fikstüre Git →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PHOTO GALLERY */}
      <section className="py-16 px-4" style={{ backgroundColor: '#1a2e1d' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Turnuva Atmosferi</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo 1 */}
            <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src="/top.jpeg"
                alt="Sahada Mücadele"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <h3 className="text-white font-semibold text-lg">Sahada Mücadele</h3>
              </div>
            </div>

            {/* Photo 2 */}
            <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src="/karabukOyuncu.jpg"
                alt="Turnuva Ruhu"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <h3 className="text-white font-semibold text-lg">Turnuva Ruhu</h3>
              </div>
            </div>

            {/* Photo 3 */}
            <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src="/saha.jpg"
                alt="Taraftarlarımız"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <h3 className="text-white font-semibold text-lg">Taraftarlarımız</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REGISTRATION INFO */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-lg p-8 border border-[#2d4a32]"
            style={{ backgroundColor: '#1a2e1d' }}
          >
            <h2 className="text-2xl font-bold text-white mb-3">Takımınız Kayıtlı mı?</h2>
            <p className="text-gray-400 mb-6">Başvuru durumunuzu takip edin veya belge güncellemesi yapın.</p>

            <div className="flex flex-wrap gap-3">
              <Link href="/basvuru-durumlari">
                <Button
                  variant="outline"
                  className="border border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500]/10"
                >
                  Başvuru Durumları
                </Button>
              </Link>
              <Link href="/belge-guncelle">
                <Button
                  variant="outline"
                  className="border border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500]/10"
                >
                  Belge Güncelle
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#2d4a32] mt-16 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">Turnuva</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/fikstir" className="hover:text-[#f0a500] transition-colors">
                    Fikstür
                  </Link>
                </li>
                <li>
                  <Link href="/puan-durumu" className="hover:text-[#f0a500] transition-colors">
                    Puan Durumu
                  </Link>
                </li>
                <li>
                  <Link href="/istatistikler" className="hover:text-[#f0a500] transition-colors">
                    İstatistikler
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Başvuru</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/basvuru/kaptan" className="hover:text-[#f0a500] transition-colors">
                    Takım Oluştur
                  </Link>
                </li>
                <li>
                  <Link href="/oyuncu-basvuru" className="hover:text-[#f0a500] transition-colors">
                    Takıma Katıl
                  </Link>
                </li>
                <li>
                  <Link href="/basvuru-durumlari" className="hover:text-[#f0a500] transition-colors">
                    Başvuru Durumları
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Yönetim</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/admin/giris" className="hover:text-[#f0a500] transition-colors flex items-center gap-2">
                    <Lock size={14} />
                    Admin Paneli
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Hakkında</h3>
              <p className="text-sm text-gray-400">
                Karabük Kamu Kurumları Bahar Futbol Turnuvası 2026
              </p>
            </div>
          </div>

          <div className="border-t border-[#2d4a32] pt-8">
            <p className="text-center text-sm text-gray-500">
              © 2026 Karabük Turnuvası. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
