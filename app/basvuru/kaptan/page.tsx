'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  XCircle,
  Loader2,
  Info,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function CaptainRegistrationPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    team_name: '',
    institution: '',
    jersey_color: '',
  });

  const [responsible1Name, setResponsible1Name] = useState('');
  const [responsible1Phone, setResponsible1Phone] = useState('');
  const [responsible1Email, setResponsible1Email] = useState('');
  const [hasSecondResponsible, setHasSecondResponsible] = useState(false);
  const [responsible2Name, setResponsible2Name] = useState('');
  const [responsible2Phone, setResponsible2Phone] = useState('');
  const [responsible2Email, setResponsible2Email] = useState('');
  const [bankReceipt, setBankReceipt] = useState<File | null>(null);
  const [bankReceiptName, setBankReceiptName] = useState('');

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBankReceipt(file);
    setBankReceiptName(file?.name || '');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append('team_name', formData.team_name);
      fd.append('institution', formData.institution);
      if (formData.jersey_color) {
        fd.append('jersey_color', formData.jersey_color);
      }
      fd.append('responsible1_name', responsible1Name);
      fd.append('responsible1_phone', responsible1Phone);
      fd.append('responsible1_email', responsible1Email);
      if (hasSecondResponsible) {
        fd.append('responsible2_name', responsible2Name);
        fd.append('responsible2_phone', responsible2Phone);
        fd.append('responsible2_email', responsible2Email);
      }
      if (bankReceipt) {
        fd.append('bank_receipt', bankReceipt);
      }

      const response = await fetch('/api/kaptan-basvuru', {
        method: 'POST',
        body: fd,
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
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6"
        >
          ← Ana Sayfaya Dön
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
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
          }}
          className="border rounded-xl p-4 mb-6 flex items-start gap-3"
        >
          <Info size={18} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-blue-200 text-sm leading-relaxed">
            Takım sorumlusu olarak takımı siz oluşturuyorsunuz. Eğer takımda oyuncu olarak da oynamak istiyorsanız, takım oluşturulduktan sonra size verilen anahtar ile normal oyuncu kaydı oluşturmanız gerekmektedir. Takım sorumlusu olmak oyuncu kontenjanı tüketmez.
          </p>
        </div>

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

          {/* Birinci Sorumlu Bilgileri */}
          <div className="mt-8 pt-6 border-t border-[#2d4a32]">
            <div className="mb-6 flex items-start gap-3 border-l-4 border-[#f0a500] pl-3">
              <div>
                <h3 className="text-white font-semibold">Birinci Sorumlu Bilgileri</h3>
                <p className="text-gray-400 text-sm mt-1">Zorunludur</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Ad Soyad */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={responsible1Name}
                  onChange={(e) => setResponsible1Name(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  required
                  className="bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-11 w-full px-4 placeholder-gray-500 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] transition-colors"
                />
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={responsible1Phone}
                  onChange={(e) => setResponsible1Phone(e.target.value)}
                  placeholder="5XX XXX XX XX"
                  required
                  className="bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-11 w-full px-4 placeholder-gray-500 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] transition-colors"
                />
              </div>
            </div>

            {/* E-posta */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={responsible1Email}
                onChange={(e) => setResponsible1Email(e.target.value)}
                placeholder="eposta@example.com"
                required
                className="bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-11 w-full px-4 placeholder-gray-500 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] transition-colors"
              />
            </div>
          </div>

          {/* İkinci Sorumlu Checkbox */}
          <div className="mt-8 pt-6 border-t border-[#2d4a32]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSecondResponsible}
                onChange={(e) => setHasSecondResponsible(e.target.checked)}
                style={{
                  accentColor: '#f0a500',
                }}
                className="w-5 h-5 cursor-pointer"
              />
              <span className="text-gray-300 text-sm font-medium">
                İkinci takım sorumlusu eklenecek mi?
              </span>
            </label>
          </div>

          {/* İkinci Sorumlu Bilgileri (Conditional) */}
          {hasSecondResponsible && (
            <div className="mt-6">
              <div className="mb-6 flex items-start gap-3 border-l-4 border-[#f0a500] pl-3">
                <div>
                  <h3 className="text-white font-semibold">İkinci Sorumlu Bilgileri</h3>
                  <p className="text-gray-400 text-sm mt-1">Opsiyonel</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Ad Soyad */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={responsible2Name}
                    onChange={(e) => setResponsible2Name(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-11 w-full px-4 placeholder-gray-500 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] transition-colors"
                  />
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={responsible2Phone}
                    onChange={(e) => setResponsible2Phone(e.target.value)}
                    placeholder="5XX XXX XX XX"
                    className="bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-11 w-full px-4 placeholder-gray-500 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] transition-colors"
                  />
                </div>
              </div>

              {/* E-posta */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  value={responsible2Email}
                  onChange={(e) => setResponsible2Email(e.target.value)}
                  placeholder="eposta@example.com"
                  className="bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-11 w-full px-4 placeholder-gray-500 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Ödeme Belgesi */}
          <div className="mt-8 pt-6 border-t border-[#2d4a32]">
            <div className="mb-4 flex items-start gap-3 border-l-4 border-[#f0a500] pl-3">
              <div>
                <h3 className="text-white font-semibold">Ödeme Belgesi</h3>
              </div>
            </div>

            {/* Info Box */}
            <div
              style={{
                backgroundColor: 'rgba(240, 165, 0, 0.1)',
                borderColor: 'rgba(240, 165, 0, 0.3)',
              }}
              className="border rounded-lg p-3 mb-4 flex items-start gap-3"
            >
              <Info size={18} className="text-[#f0a500] mt-0 shrink-0" />
              <p className="text-gray-300 text-sm">
                Katılım ücretine ait banka dekontunu yükleyin. PDF, JPG veya PNG — maks. 5 MB
              </p>
            </div>

            {/* File Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                backgroundColor: '#0d1f12',
                borderColor: '#2d4a32',
              }}
              className="border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-[#f0a500]/50 transition-colors flex items-center gap-4"
            >
              <FileText size={24} className="text-[#f0a500] shrink-0" />
              <div className="flex-1">
                <p className="text-white font-medium">
                  Banka Dekontu
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  PDF, JPG veya PNG — maks. 5 MB
                </p>
              </div>
              {bankReceipt ? (
                <div className="flex items-center gap-2 text-green-400">
                  <Check size={20} />
                  <span className="text-sm">{bankReceiptName}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="bg-[#2d4a32] text-white rounded px-3 py-1.5 text-sm hover:bg-[#3d5a42] transition-colors shrink-0"
                >
                  Dosya Seç
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Info Box */}
            <div
              style={{
                backgroundColor: '#0d1f12',
                borderColor: '#2d4a32',
              }}
              className="border rounded-xl p-4 mt-3 text-gray-400 text-sm"
            >
              Nakit ödeme yaptıysanız bu adımı atlayabilirsiniz. Havale veya EFT yapacaksanız lütfen başvurunuz onaylanmadan önce dekontunuzu yükleyin. Tüm takım adına tek dekont yüklenmelidir.
            </div>
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
