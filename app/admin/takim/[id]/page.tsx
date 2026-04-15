import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import PlayerCard from '@/components/PlayerCard';
import AdminKarar from '@/components/AdminKarar';
import BelgeButonlari from '@/components/BelgeButonlari';
import TeamKeyDisplay from '@/components/TeamKeyDisplay';
import {
  Shield,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  RefreshCw,
  UserX,
  Building2,
  User,
  File,
  ChevronLeft,
  Palette,
} from 'lucide-react';

interface AdminTeamPageProps {
  params: Promise<{
    id: string;
  }>;
}

function getDocumentTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    tc_front: 'TC Kimlik Ön Yüz',
    tc_back: 'TC Kimlik Arka Yüz',
    work_certificate: 'Çalışma Belgesi',
    sgk_certificate: 'SGK Belgesi',
    passport_photo: 'Vesikalık Fotoğraf',
    bank_receipt: 'Banka Dekontu',
    other: 'Diğer Belge',
  };
  return typeMap[type] || type;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function AdminTeamPage({ params }: AdminTeamPageProps) {
  const { id } = await params;

  const supabase = createServiceClient();

  // Fetch team
  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select(
      'id, name, institution, team_key, jersey_color, status, rejection_note, update_count, created_at'
    )
    .eq('id', id)
    .single();

  if (teamError || !teamData) {
    notFound();
  }

  // Fetch captain
  const { data: captainDataRaw } = await supabase
    .from('captains')
    .select(
      'id, first_name, last_name, tc_no, phone, email, institution, jersey_number'
    )
    .eq('team_id', teamData.id)
    .single();

  const captainData = captainDataRaw ?? null;

  // Fetch players
  const { data: playersDataRaw } = await supabase
    .from('players')
    .select(
      'id, first_name, last_name, tc_no, phone, email, institution, jersey_number, created_at'
    )
    .eq('team_id', teamData.id)
    .order('created_at', { ascending: true });

  const playersData = playersDataRaw ?? [];

  // Fetch documents
  const { data: documentsDataRaw } = await supabase
    .from('documents')
    .select(
      'id, owner_type, owner_id, document_type, file_path, file_name, file_size, mime_type'
    )
    .eq('team_id', teamData.id);

  const documentsData = documentsDataRaw ?? [];

  const totalMembers = 1 + playersData.length;
  const captainDocuments = documentsData.filter(
    (d) => d.owner_type === 'captain' && d.owner_id === captainData.id
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Beklemede',
          bgColor: 'rgba(234, 179, 8, 0.2)',
          borderColor: 'rgba(234, 179, 8, 0.3)',
          textColor: '#facc15',
        };
      case 'approved':
        return {
          icon: CheckCircle2,
          label: 'Onaylandı',
          bgColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgba(34, 197, 94, 0.3)',
          textColor: '#4ade80',
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Reddedildi',
          bgColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          textColor: '#f87171',
        };
      default:
        return {
          icon: Clock,
          label: status,
          bgColor: 'rgba(107, 114, 128, 0.2)',
          borderColor: 'rgba(107, 114, 128, 0.3)',
          textColor: '#d1d5db',
        };
    }
  };

  const statusBadge = getStatusBadge(teamData.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div style={{ backgroundColor: '#0d1f12' }} className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/admin"
              className="flex items-center gap-1 text-gray-400 hover:text-gray-300 text-sm mb-4 transition-colors"
            >
              <ChevronLeft size={16} />
              Tüm Başvurular
            </Link>
            <h1 className="text-2xl font-bold text-white">{teamData.name}</h1>
            <p className="text-gray-400 text-sm mt-1">{teamData.institution}</p>
            <TeamKeyDisplay teamKey={teamData.team_key} />
          </div>

          {/* Status Badge */}
          <div
            style={{
              backgroundColor: statusBadge.bgColor,
              borderColor: statusBadge.borderColor,
              color: statusBadge.textColor,
            }}
            className="border rounded-full px-4 py-2 flex items-center gap-2"
          >
            <StatusIcon size={18} />
            <span className="text-sm font-medium">{statusBadge.label}</span>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Members */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: '#2d4a32',
            }}
            className="border rounded-xl p-4"
          >
            <Users size={18} style={{ color: '#f0a500' }} />
            <p style={{ color: 'white' }} className="text-xl font-bold mt-1">
              {totalMembers}/15
            </p>
            <p className="text-gray-400 text-xs mt-1">Kayıtlı Üye</p>
            {totalMembers < 10 && (
              <p className="text-red-400 text-xs mt-2">Min. 10 gerekli</p>
            )}
          </div>

          {/* Jersey Color */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: '#2d4a32',
            }}
            className="border rounded-xl p-4"
          >
            <Palette size={18} style={{ color: '#f0a500' }} />
            <p style={{ color: 'white' }} className="font-medium mt-1 text-sm">
              {teamData.jersey_color || 'Belirtilmemiş'}
            </p>
            <p className="text-gray-400 text-xs mt-1">Forma Rengi</p>
          </div>

          {/* Application Date */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: '#2d4a32',
            }}
            className="border rounded-xl p-4"
          >
            <Calendar size={18} style={{ color: '#f0a500' }} />
            <p style={{ color: 'white' }} className="font-medium mt-1 text-sm">
              {formatDate(teamData.created_at)}
            </p>
            <p className="text-gray-400 text-xs mt-1">Başvuru Tarihi</p>
          </div>

          {/* Remaining Updates */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: '#2d4a32',
            }}
            className="border rounded-xl p-4"
          >
            <RefreshCw size={18} style={{ color: '#f0a500' }} />
            <p style={{ color: 'white' }} className="text-xl font-bold mt-1">
              {2 - teamData.update_count}/2
            </p>
            <p className="text-gray-400 text-xs mt-1">Kalan Güncelleme</p>
          </div>
        </div>

        {/* Updated Alert */}
        {teamData.status === 'rejected' && teamData.update_count > 0 && (
          <div
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderColor: 'rgba(59, 130, 246, 0.3)',
            }}
            className="border rounded-xl p-4 mb-6 flex items-start gap-3"
          >
            <RefreshCw size={18} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-400 font-semibold">Başvuru Güncellendi</p>
              <p className="text-blue-400/70 text-sm mt-1">
                Kaptan belgelerini güncelleyerek yeniden incelemeye sundu.
              </p>
            </div>
          </div>
        )}

        {/* Captain Card */}
        {captainData ? (
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: '#2d4a32',
            }}
            className="border rounded-2xl p-6 mb-6"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield size={20} style={{ color: '#f0a500' }} />
                <h2 className="text-white font-semibold text-lg">Takım Kaptanı</h2>
              </div>

              {/* Avatar Circle */}
              <div
                style={{
                  backgroundColor: '#f0a500/20',
                  borderColor: '#f0a500/30',
                }}
                className="w-12 h-12 rounded-full border flex items-center justify-center"
              >
                <p style={{ color: '#f0a500' }} className="font-bold text-lg">
                  {captainData.first_name?.charAt(0).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Separator */}
            <div style={{ borderColor: '#2d4a32' }} className="border-t my-4" />

            {/* Captain Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-xs mb-1">Ad Soyad</p>
                <p className="text-white font-medium">
                  {captainData.first_name} {captainData.last_name}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">TC Kimlik No</p>
                <p className="text-white font-medium">{captainData.tc_no}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Forma Numarası</p>
                <p className="text-white font-medium">{captainData.jersey_number}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Telefon</p>
                <p className="text-white font-medium">{captainData.phone}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">E-posta</p>
                <p className="text-white font-medium text-sm break-all">
                  {captainData.email}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Kurum</p>
                <p className="text-white font-medium">{captainData.institution}</p>
              </div>
            </div>

            {/* Documents Section */}
            {captainDocuments.length > 0 && (
            <>
              <div style={{ borderColor: '#2d4a32' }} className="border-t my-4" />

              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} style={{ color: '#f0a500' }} />
                <p className="text-white font-medium">Yüklenen Belgeler</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {captainDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      backgroundColor: '#0d1f12',
                      borderColor: '#2d4a32',
                    }}
                    className="border rounded-xl p-4 hover:border-[#f0a500]/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <File
                          size={18}
                          style={{ color: '#f0a500' }}
                          className="shrink-0 mt-0.5"
                        />
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium">
                            {getDocumentTypeName(doc.document_type)}
                          </p>
                          <p className="text-gray-400 text-xs truncate mt-0.5">
                            {doc.file_name}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {Math.round(doc.file_size / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <BelgeButonlari
                          filePath={doc.file_path}
                          fileName={doc.file_name}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#0d1f12',
              borderColor: '#2d4a32',
            }}
            className="border border-[#2d4a32] rounded-xl p-4 mb-6 text-center"
          >
            <p className="text-gray-400 text-sm">
              Bu takım için henüz kaptan kaydı bulunmamaktadır.
            </p>
          </div>
        )}

        {/* Players List */}
        {playersData.length > 0 ? (
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: '#2d4a32',
            }}
            className="border rounded-2xl p-6 mb-6"
          >
            {/* Card Header */}
            <div className="flex items-center gap-3 mb-4">
              <Users size={20} style={{ color: '#f0a500' }} />
              <h2 className="text-white font-semibold text-lg">Oyuncular</h2>
              <span
                style={{
                  backgroundColor: '#f0a500/20',
                  color: '#f0a500',
                }}
                className="text-xs px-2 py-0.5 rounded-full"
              >
                {playersData.length} kişi
              </span>
            </div>

            {/* Players */}
            <div className="space-y-2">
              {playersData.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  documents={documentsData.filter(
                    (d) =>
                      d.owner_type === 'player' && d.owner_id === player.id
                  )}
                />
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: '#2d4a32',
            }}
            className="border rounded-2xl p-16 text-center mb-6"
          >
            <UserX size={32} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mt-2">
              Henüz oyuncu başvurusu yapılmamıştır.
            </p>
          </div>
        )}

        {/* Decision Card */}
        <AdminKarar
          teamId={teamData.id}
          currentStatus={teamData.status}
          totalMembers={totalMembers}
        />
      </div>
    </div>
  );
}
