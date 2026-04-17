'use client';

import { useState } from 'react';
import {
  Gavel,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface AdminKararProps {
  teamId: string;
  currentStatus: string;
  totalMembers: number;
  players: { id: string; first_name: string; last_name: string }[];
}

export default function AdminKarar({
  teamId,
  currentStatus,
  totalMembers,
  players,
}: AdminKararProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [rejectedPlayerIds, setRejectedPlayerIds] = useState<string[]>([]);

  const canApprove = totalMembers >= 10;
  const isApproved = currentStatus === 'approved';

  const handleApprove = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/karar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          action: 'approve',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'İşlem sırasında hata oluştu');
        return;
      }

      window.location.reload();
    } catch (err) {
      setError('İşlem sırasında hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (rejectionNote.length < 10) {
      setError('Red gerekçesi en az 10 karakter olmalıdır');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/karar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          action: 'reject',
          rejectionNote,
          rejectedPlayerIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'İşlem sırasında hata oluştu');
        return;
      }

      window.location.reload();
    } catch (err) {
      setError('İşlem sırasında hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnreject = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/karar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          action: 'unreject',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'İşlem sırasında hata oluştu');
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch (err) {
      setError('İşlem sırasında hata oluştu');
      console.error(err);
      setLoading(false);
    }
  };

  if (isApproved) {
    return (
      <div
        style={{
          backgroundColor: '#1a2e1d',
          borderColor: '#2d4a32',
        }}
        className="border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Gavel size={20} style={{ color: '#f0a500' }} />
          <h2 className="text-white font-semibold text-lg">Başvuru Kararı</h2>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderColor: 'rgba(34, 197, 94, 0.3)',
          }}
          className="border rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle2 size={20} className="text-green-400 shrink-0" />
          <p className="text-green-400 font-medium">
            Bu başvuru onaylanmıştır.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#1a2e1d',
        borderColor: '#2d4a32',
      }}
      className="border rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Gavel size={20} style={{ color: '#f0a500' }} />
        <h2 className="text-white font-semibold text-lg">Başvuru Kararı</h2>
      </div>

      {/* Member Warning */}
      {totalMembers < 10 && (
        <div
          style={{
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            borderColor: 'rgba(234, 179, 8, 0.3)',
          }}
          className="border rounded-xl p-4 mb-4 flex items-start gap-3"
        >
          <AlertTriangle
            size={18}
            className="text-yellow-400 shrink-0 mt-0.5"
          />
          <div>
            <p className="text-yellow-400 text-sm">
              Onay için en az 10 üye gereklidir.
            </p>
            <p className="text-yellow-400/70 text-sm">
              Mevcut: {totalMembers} üye
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
          className="border rounded-lg p-3 mb-4 text-red-400 text-sm"
        >
          {error}
        </div>
      )}

      {!showRejectForm ? (
        // Decision Buttons
        <div className={`mt-4 ${currentStatus === 'rejected' ? 'grid grid-cols-1 sm:grid-cols-3 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}`}>
          {/* Approve Button */}
          <button
            onClick={handleApprove}
            disabled={!canApprove || loading}
            style={{
              backgroundColor: canApprove ? '#22c55e' : '#4b5563',
              color: 'white',
            }}
            className="h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                İşlem Yapılıyor
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Onayla
              </>
            )}
          </button>

          {/* Reject Button */}
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={loading}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: '#f87171',
            }}
            className="h-12 rounded-xl font-bold border flex items-center justify-center gap-2 transition-all enabled:hover:bg-red-500/30"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                İşlem Yapılıyor
              </>
            ) : (
              <>
                <XCircle size={18} />
                Reddet
              </>
            )}
          </button>

          {/* Unreject Button (only when status is rejected) */}
          {currentStatus === 'rejected' && (
            <button
              onClick={handleUnreject}
              disabled={loading}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
              }}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 h-12 rounded-xl font-bold w-full sm:w-auto flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  İşlem Yapılıyor
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Reddi Kaldır
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        // Reject Form
        <div className="mt-4">
          <div
            style={{
              backgroundColor: '#0d1f12',
              borderColor: 'rgba(239, 68, 68, 0.3)',
            }}
            className="border rounded-xl p-4"
          >
            {/* Sorunlu Oyuncular Section */}
            <div className="mb-6">
              <label className="text-red-400 text-xs font-medium block mb-2">
                Sorunlu Oyuncular (opsiyonel)
              </label>
              <p className="text-gray-400 text-xs mb-3">
                Belgeleri eksik veya hatalı olan oyuncuları seçin.
              </p>

              <div className="space-y-2">
                {players.map((player) => (
                  <label
                    key={player.id}
                    style={{
                      backgroundColor: '#0d1f12',
                      borderColor: '#2d4a32',
                    }}
                    className="border rounded-lg p-2 flex items-center gap-3 cursor-pointer hover:border-[#f0a500]/30 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={rejectedPlayerIds.includes(player.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRejectedPlayerIds([...rejectedPlayerIds, player.id]);
                        } else {
                          setRejectedPlayerIds(
                            rejectedPlayerIds.filter((id) => id !== player.id)
                          );
                        }
                      }}
                      style={{
                        accentColor: '#f0a500',
                      }}
                      className="cursor-pointer"
                    />
                    <span className="text-white text-sm">
                      {player.first_name} {player.last_name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <label className="text-red-400 text-sm font-medium block mb-2">
              Red Gerekçesi
            </label>
            <textarea
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="Başvurunun neden reddedildiğini açıklayın (zorunlu, min. 10 karakter)"
              style={{
                backgroundColor: 'transparent',
                borderColor: '#2d4a32',
                color: 'white',
              }}
              className="w-full border rounded-lg p-3 mt-2 focus:outline-none focus:border-red-500/50 transition-colors resize-none"
              rows={4}
            />
            <p className="text-gray-500 text-xs mt-2">
              {rejectionNote.length} / 10 karakter (minimum)
            </p>

            {/* Form Buttons */}
            <button
              onClick={handleReject}
              disabled={rejectionNote.length < 10 || loading}
              style={{
                backgroundColor:
                  rejectionNote.length < 10 ? '#4b5563' : '#ef4444',
              }}
              className="w-full h-11 rounded-xl font-bold text-white mt-3 flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  İşlem Yapılıyor
                </>
              ) : (
                'Reddi Onayla'
              )}
            </button>

            <button
              onClick={() => {
                setShowRejectForm(false);
                setRejectionNote('');
                setRejectedPlayerIds([]);
                setError(null);
              }}
              disabled={loading}
              style={{
                backgroundColor: '#2d4a32',
                color: '#9ca3af',
              }}
              className="w-full h-11 rounded-xl font-bold mt-2 transition-all hover:bg-opacity-80 disabled:cursor-not-allowed"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
