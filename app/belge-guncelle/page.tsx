'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';

interface PlayerInfo {
  player_id: string;
  player_name: string;
  team_name: string;
  rejection_note?: string;
}

const documentConfig = [
  { key: 'tc_front', label: 'TC Kimlik Ön Yüz', required: true },
  { key: 'tc_back', label: 'TC Kimlik Arka Yüz', required: true },
  { key: 'work_certificate', label: 'Çalışma Belgesi', required: true },
  { key: 'sgk_certificate', label: 'SGK Belgesi', required: true },
  { key: 'passport_photo', label: 'Vesikalık Fotoğraf', required: true },
  { key: 'bank_receipt', label: 'Banka Dekontu', required: true },
  { key: 'other_document', label: 'Diğer Belge (opsiyonel)', required: false },
];

export default function BelgeGuncellePage() {
  const [step, setStep] = useState<'auth' | 'form' | 'success'>('auth');
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);

  // Auth form
  const [teamKey, setTeamKey] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Update form
  const [checkedFields, setCheckedFields] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const response = await fetch('/api/oyuncu-bul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_key: teamKey, identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.error || 'Bir hata oluştu');
        setAuthLoading(false);
        return;
      }

      setPlayerInfo(data);
      setStep('form');
    } catch (err) {
      setAuthError('Bir hata oluştu');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    // Validation
    const checkedCount = Object.values(checkedFields).filter(Boolean).length;
    if (checkedCount === 0) {
      setFormError('Lütfen güncellenecek belgeleri seçin');
      return;
    }

    for (const [key, checked] of Object.entries(checkedFields)) {
      if (checked && !files[key]) {
        setFormError('Lütfen seçili tüm belgeler için dosya seçin');
        return;
      }
    }

    setFormLoading(true);

    try {
      const formData = new FormData();
      formData.append('team_key', teamKey);
      formData.append('player_id', playerInfo!.player_id);

      for (const [key, checked] of Object.entries(checkedFields)) {
        if (checked && files[key]) {
          formData.append(key, files[key]);
        }
      }

      const response = await fetch('/api/guncelle', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error || 'Bir hata oluştu');
        setFormLoading(false);
        return;
      }

      setStep('success');
    } catch (err) {
      setFormError('Bir hata oluştu');
      setFormLoading(false);
    }
  }

  if (step === 'auth') {
    return (
      <div style={{ backgroundColor: '#0d1f12' }} className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          <Link href="/">
            <p className="text-gray-400 text-sm hover:text-white transition-colors mb-6 flex items-center gap-1">
              <ChevronLeft size={16} />
              Ana Sayfa
            </p>
          </Link>

          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: '#2d4a32',
            }}
            className="border border-[#2d4a32] rounded-2xl p-4 sm:p-8"
          >
            <div className="inline-block bg-[#f0a500]/20 border border-[#f0a500]/30 rounded-full px-4 py-2 mb-6">
              <span className="text-[#f0a500] text-sm font-semibold">Belge Güncelleme</span>
            </div>

            <h1 className="text-white text-2xl font-bold mb-2">Belgelerini Güncelle</h1>
            <p className="text-gray-400 text-sm mb-6">
              Takım anahtarınızı ve TC kimlik numaranızı veya e-posta adresinizi girin.
            </p>

            {authError && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                }}
                className="border border-red-500/30 rounded-lg p-4 mb-6 text-red-400 text-sm"
              >
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Takım Anahtarı</label>
                <input
                  type="text"
                  value={teamKey}
                  onChange={(e) => setTeamKey(e.target.value.toUpperCase())}
                  required
                  maxLength={8}
                  className="w-full bg-[#0d1f12] border border-[#2d4a32] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#f0a500] font-mono"
                  placeholder="XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">TC Kimlik No veya E-posta</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-12 w-full focus:border-[#f0a500] focus:outline-none px-4 placeholder-gray-500"
                  placeholder="TC kimlik no veya e-posta adresiniz"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Kayıt sırasında girdiğiniz TC kimlik numaranızı veya e-posta adresinizi girin.
                </p>
              </div>

              <Button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#f0a500] text-[#0d1f12] hover:bg-[#e09500] font-bold py-2"
              >
                {authLoading ? 'Kontrol ediliyor...' : 'Devam Et'}
              </Button>
            </form>
          </div>
        </div>        </div>      </div>
    );
  }

  if (step === 'form' && playerInfo) {
    return (
      <div style={{ backgroundColor: '#0d1f12' }} className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Bilgi Kartı */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: '#2d4a32',
            }}
            className="border border-[#2d4a32] rounded-2xl p-4 sm:p-6 mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-xs mb-1">Takım Adı</p>
                <p className="text-white font-medium">{playerInfo.team_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Oyuncu Adı</p>
                <p className="text-white font-medium">{playerInfo.player_name}</p>
              </div>
            </div>

            {playerInfo.rejection_note && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                }}
                className="border border-red-500/30 rounded-xl p-4 mt-4 flex items-start gap-3"
              >
                <AlertCircle
                  size={18}
                  className="text-red-400 mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-red-400 text-xs font-medium">Red Gerekçesi:</p>
                  <p className="text-red-300 text-sm mt-1">
                    {playerInfo.rejection_note}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Belge Güncelleme Formu */}
          <div
            style={{
              backgroundColor: '#1a2e1d',
              borderColor: '#2d4a32',
            }}
            className="border border-[#2d4a32] rounded-2xl p-4 sm:p-6"
          >
            <h2 className="text-white font-bold text-xl mb-2">
              Güncellenecek Belgeleri Seçin
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Yalnızca değiştirmek istediğiniz belgeleri seçin.
            </p>

            {formError && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                }}
                className="border border-red-500/30 rounded-lg p-4 mb-6 text-red-400 text-sm"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {documentConfig.map((doc) => (
                <div key={doc.key}>
                  <label className="flex items-center gap-3 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={checkedFields[doc.key] || false}
                      onChange={(e) => {
                        setCheckedFields({
                          ...checkedFields,
                          [doc.key]: e.target.checked,
                        });
                      }}
                      className="accent-[#f0a500]"
                    />
                    <span className="text-white text-sm font-medium">
                      {doc.label}
                      {doc.required && <span className="text-red-400 ml-1">*</span>}
                    </span>
                  </label>

                  {checkedFields[doc.key] && (
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        setFiles({
                          ...files,
                          [doc.key]: e.target.files?.[0] || null,
                        });
                      }}
                      className="w-full bg-[#0d1f12] border border-[#2d4a32] rounded-lg p-3 text-gray-400 text-sm focus:outline-none focus:border-[#f0a500]"
                    />
                  )}
                </div>
              ))}

              <Button
                type="submit"
                disabled={formLoading}
                className="w-full bg-[#f0a500] text-[#0d1f12] hover:bg-[#e09500] font-bold py-2 mt-6"
              >
                {formLoading ? 'Gönderiliyor...' : 'Belgeleri Güncelle'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div style={{ backgroundColor: '#0d1f12' }} className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <CheckCircle2 size={64} className="text-green-400 mx-auto mb-6" />
          <h1 className="text-white text-2xl font-bold mb-2">
            Belgeleriniz Güncellendi!
          </h1>
          <p className="text-gray-400 mb-6">
            Başvurunuz tekrar incelemeye alınmıştır.
          </p>
          <Link href="/basvuru-durumlari">
            <Button className="bg-[#f0a500] text-[#0d1f12] hover:bg-[#e09500] font-bold">
              Başvuru Durumlarına Git
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}
