'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';

interface TakimSilProps {
  teamId: string;
  teamName: string;
}

export default function TakimSil({ teamId, teamName }: TakimSilProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/takim-sil', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Silme işlemi başarısız');
        setLoading(false);
        return;
      }

      // Redirect to admin page on success
      window.location.href = '/admin';
    } catch (err) {
      console.error('Error:', err);
      setError('Silme işlemi sırasında hata oluştu');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Delete Button */}
      <button
        onClick={() => setShowConfirm(true)}
        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-2 flex items-center gap-2 transition-colors"
      >
        <Trash2 size={16} />
        Takımı Sil
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
          className="border border-red-500/30 rounded-2xl p-6 mt-4"
        >
          <h3 className="text-white font-bold text-lg">
            Takımı Silmek İstediğinize Emin Misiniz?
          </h3>

          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            <strong>{teamName}</strong> takımı ve tüm oyuncu kayıtları, belgeler
            kalıcı olarak silinecektir. Bu işlem geri alınamaz.
          </p>

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
              }}
              className="border border-red-500/30 rounded-lg p-3 mt-4 text-red-400 text-sm"
            >
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setShowConfirm(false);
                setError(null);
              }}
              disabled={loading}
              className="bg-[#2d4a32] text-white rounded-xl px-4 py-2 hover:bg-[#3d5a42] transition-colors disabled:opacity-50"
            >
              Vazgeç
            </button>

            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl px-4 py-2 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Evet, Sil
            </button>
          </div>
        </div>
      )}
    </>
  );
}
