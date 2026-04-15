'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  XCircle,
  Loader2,
  Info,
  AlertCircle,
} from 'lucide-react';

export default function CaptainRegistrationPage() {
  const [formData, setFormData] = useState({
    team_name: '',
    institution: '',
    jersey_color: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [teamKey, setTeamKey] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/kaptan-basvuru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Bir hata oluştu');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTeamKey(data.team_key);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(teamKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  if (success) {
    return (
      <main className="bg-[#0d1f12] min-h-screen py-12 px-4">
        <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-8 max-w-lg mx-auto text-center">
          <CheckCircle2
            size={64}
            className="text-green-400 mx-auto"
            strokeWidth={1.5}
          />

          <h1 className="text-white text-2xl font-bold mt-4">
            Takımınız Oluşturuldu!
          </h1>

          {/* Team Key Box */}
          <div className="mt-8 bg-[#0d1f12] border-2 border-[#f0a500] rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-3">Takım Anahtarınız</p>
            <p className="text-[#f0a500] text-5xl font-bold font-mono tracking-widest">
              {teamKey}
            </p>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="mt-4 bg-[#2d4a32] hover:bg-[#f0a500]/20 border border-[#2d4a32] text-white rounded-lg px-4 py-2 text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  Kopyalandı!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Kopyala
                </>
              )}
            </button>
          </div>

          {/* Warning Box */}
          <div className="mt-6 bg-[#f0a500]/10 border border-[#f0a500]/30 rounded-xl p-4 text-left flex gap-3">
            <AlertTriangle
              size={18}
              className="text-[#f0a500] mt-0.5 shrink-0"
            />
            <p className="text-[#f0a500]/80 text-sm">
              Bu anahtarı mutlaka kaydedin! Takım üyeleriniz bu anahtar ile
              sisteme kayıt olacak. Kaybedilmesi durumunda yönetici ile
              iletişime geçin.
            </p>
          </div>

          {/* Home Button */}
          <Link
            href="/"
            className="mt-6 inline-block border border-[#2d4a32] text-gray-400 rounded-xl px-6 py-3 hover:text-white transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#0d1f12] min-h-screen py-12 px-4">
      <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-8 max-w-lg mx-auto">
        {/* Header */}
        <Link
          href="/"
          className="text-gray-400 hover:text-white text-sm transition-colors inline-block mb-4"
        >
          ← Ana Sayfa
        </Link>

        <div className="mb-6">
          <span className="inline-block bg-[#f0a500] text-[#0d1f12] text-xs font-bold px-3 py-1 rounded-full mb-3">
            Takım Kaydı
          </span>
          <h1 className="text-white text-2xl font-bold">Takım Oluştur</h1>
          <p className="text-gray-400 text-sm mt-2">
            Takımınızı oluşturun, üyelerinizi davet edin.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4 flex gap-3">
            <XCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Information Box */}
        <div
          style={{
            backgroundColor: '#0d1f12',
            borderColor: '#2d4a32',
          }}
          className="border rounded-xl p-5 mb-6 space-y-3"
        >
          {/* Info Item 1 */}
          <div className="flex items-start gap-3">
            <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-gray-300 text-sm leading-relaxed">
              Takımınızı oluşturarak takım sorumlusu sıfatını üstlenmiş
              olursunuz. Takım sorumlusu aynı zamanda takımda oyuncu olarak da
              yer alabilir; bunun için takım anahtarı ile normal oyuncu kaydı
              oluşturmanız yeterlidir.
            </p>
          </div>

          {/* Info Item 2 */}
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-gray-300 text-sm leading-relaxed">
              Kurumunuzda daha önce takım oluşturulmuş olabilir. Yeni bir takım
              oluşturmadan önce kurumunuzdaki kişilerle iletişime geçerek
              mevcut bir takım olup olmadığını teyit edin.
            </p>
          </div>

          {/* Info Item 3 */}
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-gray-300 text-sm leading-relaxed">
              Takım oluşturulduktan sonra size verilen anahtarı kesinlikle
              kaybetmeyin. Bu anahtar, takım üyelerinizin sisteme kayıt
              olabilmesi için zorunludur. Anahtar kaybolması durumunda yönetici
              ile iletişime geçmeniz gerekecektir.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Institution */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Kurum Adı
            </label>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleInputChange}
              placeholder="Üniversite/Spor Kulübü Adı"
              required
              className="bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-11 w-full px-4 placeholder-gray-500 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] transition-colors"
            />
          </div>

          {/* Team Name */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Takım Adı
            </label>
            <input
              type="text"
              name="team_name"
              value={formData.team_name}
              onChange={handleInputChange}
              placeholder="Takımınızın Adı"
              required
              className="bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-11 w-full px-4 placeholder-gray-500 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] transition-colors"
            />
          </div>

          {/* Jersey Color */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Forma Rengi
            </label>
            <input
              type="text"
              name="jersey_color"
              value={formData.jersey_color}
              onChange={handleInputChange}
              placeholder="Örn: Kırmızı-Beyaz"
              className="bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-11 w-full px-4 placeholder-gray-500 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#f0a500] text-[#0d1f12] font-bold h-12 w-full rounded-xl hover:bg-[#f0a500]/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              'Takımı Oluştur'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
