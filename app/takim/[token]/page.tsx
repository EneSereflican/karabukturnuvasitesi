import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import InviteCard from '@/components/InviteCard';
import { CheckCircle2, XCircle } from 'lucide-react';

interface TeamPageProps {
  params: Promise<{
    token: string;
  }>;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { token } = await params;
  const supabase = createServiceClient();

  // Fetch team data
  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select(
      'id, name, institution, jersey_color, status, rejection_note, update_count, captain_token, player_invite_token, created_at'
    )
    .eq('captain_token', token)
    .single();

  if (teamError || !teamData) {
    notFound();
  }

  const teamId = teamData.id;

  // Fetch captain data
  const { data: captainData, error: captainError } = await supabase
    .from('captains')
    .select('first_name, last_name, email, jersey_number')
    .eq('team_id', teamId)
    .limit(1)
    .single();

  if (captainError || !captainData) {
    notFound();
  }

  // Fetch players data
  const { data: playersData, error: playersError } = await supabase
    .from('players')
    .select('id, first_name, last_name, institution, jersey_number, created_at')
    .eq('team_id', teamId)
    .order('created_at', { ascending: true });

  if (playersError) {
    notFound();
  }

  const players = playersData || [];
  const totalMembers = 1 + players.length;
  const spotsLeft = 15 - totalMembers;

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/oyuncu-basvuru/${teamData.player_invite_token}`;

  const showInviteCard =
    teamData.status === 'pending' ||
    (teamData.status === 'rejected' && teamData.update_count < 2);

  const canUpdateApplication =
    teamData.status === 'rejected' && teamData.update_count < 2;

  return (
    <div className="min-h-screen bg-[#0d1f12] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 1) ÜST BAŞLIK KARTI */}
        <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-8">
          <Link href="/">
            <p className="text-gray-400 text-sm hover:text-gray-300 transition-colors mb-4">
              ← Ana Sayfa
            </p>
          </Link>

          <div className="inline-block bg-[#f0a500]/20 border border-[#f0a500]/30 rounded-full px-4 py-2 mb-4">
            <span className="text-[#f0a500] text-sm font-semibold">Takım Takip Sayfası</span>
          </div>

          <h1 className="text-white text-3xl font-bold mt-2 mb-2">{teamData.name}</h1>
          <p className="text-gray-400 text-lg mb-4">{teamData.institution}</p>

          {teamData.jersey_color && (
            <div className="inline-block bg-[#2d4a32] text-gray-300 text-sm px-3 py-1 rounded-full mb-4">
              Forma Rengi: {teamData.jersey_color}
            </div>
          )}

          <p className="text-gray-500 text-sm">
            Başvuru tarihi: {formatDate(teamData.created_at)}
          </p>
        </div>

        {/* 2) DURUM KARTI */}
        {teamData.status === 'pending' && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <p className="text-yellow-400 font-semibold">Başvurunuz İnceleniyor</p>
            </div>
            <p className="text-gray-300 text-sm">
              Yetkililer belgelerinizi incelemektedir. Sonuç e-posta ile bildirilecektir.
            </p>
          </div>
        )}

        {teamData.status === 'approved' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 size={24} className="text-green-400" />
              <p className="text-green-400 font-semibold">Başvurunuz Onaylandı!</p>
            </div>
            <p className="text-gray-300 text-sm">
              Tebrikler! Takımınız turnuvaya katılmaya hak kazanmıştır.
            </p>
          </div>
        )}

        {teamData.status === 'rejected' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <XCircle size={24} className="text-red-400" />
              <p className="text-red-400 font-semibold">Başvurunuz Reddedildi</p>
            </div>

            {teamData.rejection_note && (
              <div className="bg-[#0d1f12] border border-red-500/20 rounded-lg p-4 mt-3">
                <p className="text-red-400 text-xs font-medium">Red Gerekçesi:</p>
                <p className="text-gray-300 text-sm mt-1">{teamData.rejection_note}</p>
              </div>
            )}

            {canUpdateApplication ? (
              <Link href={`/takim/${token}/guncelle`}>
                <button className="w-full mt-4 bg-[#f0a500] text-[#0d1f12] font-bold rounded-xl h-11 hover:bg-[#e09500] transition-colors">
                  Başvuruyu Güncelle →
                </button>
              </Link>
            ) : (
              <div className="bg-[#0d1f12] border border-[#2d4a32] rounded-lg p-3 mt-3">
                <p className="text-gray-400 text-sm text-center">
                  Maksimum güncelleme hakkınız doldu. Organizasyon ile iletişime geçin.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3) ÜYE SAYACI KARTI */}
        <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Kayıtlı Üyeler</h2>
            <div className="flex items-baseline gap-1">
              <p className="text-[#f0a500] text-4xl font-bold">{totalMembers}</p>
              <p className="text-gray-400 text-2xl">/15</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-[#0d1f12] rounded-full h-3 mt-4 overflow-hidden">
            <div
              className="bg-[#f0a500] h-full rounded-full transition-all duration-500"
              style={{ width: `${(totalMembers / 15) * 100}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-gray-400 text-sm">{spotsLeft} boş yer kaldı</p>
            {totalMembers < 10 ? (
              <p className="text-yellow-400 text-sm">Onay için en az 10 üye gerekli</p>
            ) : (
              <p className="text-green-400 text-sm">Onay için yeterli üye var</p>
            )}
          </div>
        </div>

        {/* 4) KAPTAN BİLGİLERİ KARTI */}
        <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Takım Kaptanı</h2>
            <div className="w-10 h-10 rounded-full bg-[#f0a500] flex items-center justify-center">
              <p className="text-[#0d1f12] font-bold text-center">K</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-xs mb-1">Ad Soyad</p>
              <p className="text-white font-medium">
                {captainData.first_name} {captainData.last_name}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Forma Numarası</p>
              <p className="text-white font-medium">#{captainData.jersey_number}</p>
            </div>
          </div>
        </div>

        {/* 5) OYUNCU LİSTESİ KARTI */}
        <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Takım Üyeleri</h2>

          <div className="space-y-2">
            {/* Kaptan Satırı */}
            <div className="bg-[#f0a500]/10 border border-[#f0a500]/20 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <p className="text-[#f0a500] font-bold text-lg w-8 text-center">
                  {captainData.jersey_number}
                </p>
                <div>
                  <p className="text-white font-medium">
                    {captainData.first_name} {captainData.last_name}
                  </p>
                </div>
              </div>
              <div className="bg-[#f0a500] text-[#0d1f12] text-xs font-bold px-2 py-1 rounded">
                Kaptan
              </div>
            </div>

            {/* Oyuncu Satırları */}
            {players.length > 0 ? (
              players.map((player) => (
                <div
                  key={player.id}
                  className="bg-[#0d1f12] border border-[#2d4a32] rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <p className="text-gray-400 font-bold text-lg w-8 text-center">
                      {player.jersey_number}
                    </p>
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {player.first_name} {player.last_name}
                      </p>
                      <p className="text-gray-500 text-xs">{player.institution}</p>
                    </div>
                  </div>
                  <div className="bg-[#2d4a32] text-gray-300 text-xs px-2 py-1 rounded">
                    Oyuncu
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                Henüz oyuncu başvurusu yapılmamıştır. Davet linkini paylaşın.
              </p>
            )}
          </div>
        </div>

        {/* 6) DAVET LİNKİ KARTI */}
        {showInviteCard && <InviteCard inviteUrl={inviteUrl} />}
      </div>
    </div>
  );
}
