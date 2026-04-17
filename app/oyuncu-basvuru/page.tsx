'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import {
  FileText,
  Info,
  XCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface TeamInfo {
  team_id: string;
  team_name: string;
  institution: string;
}

export default function PlayerApplicationPage() {
  const [step, setStep] = useState<'key' | 'form'>('key');
  const [teamKey, setTeamKey] = useState('');
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    tc_no: '',
    institution: '',
    jersey_number: '',
  });

  const [files, setFiles] = useState<Record<string, File | null>>({
    tc_front: null,
    tc_back: null,
    work_certificate: null,
    sgk_certificate: null,
    passport_photo: null,
    other_document: null,
  });

  const [fileNames, setFileNames] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  // ────────────────────────────────────────────────
  // AŞAMA 1: Anahtar doğrulama
  // ────────────────────────────────────────────────

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamKey(e.target.value.toUpperCase());
  };

  const handleKeySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/anahtar-dogrula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_key: teamKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Bir hata oluştu');
        setLoading(false);
        return;
      }

      setTeamInfo({
        team_id: data.team_id,
        team_name: data.team_name,
        institution: data.institution,
      });
      setStep('form');
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  // AŞAMA 2: Form
  // ────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const file = e.target.files?.[0] || null;
    setFiles((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
    if (file) {
      setFileNames((prev) => ({
        ...prev,
        [fieldName]: file.name,
      }));
    } else {
      setFileNames((prev) => ({
        ...prev,
        [fieldName]: '',
      }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!kvkkAccepted) {
      setError('Devam etmek için KVKK metnini onaylamanız gerekmektedir.');
      return;
    }

    if (!files['other_document']) {
      setError('Lütfen taahhütname belgesini yükleyin.');
      return;
    }

    if (!files['other_document'] && !fileNames['other_document']) {
      setError('Lütfen taahhütname belgesini yükleyin.');
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();

      // Append team_id
      form.append('team_id', teamInfo!.team_id);

      // Append form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          form.append(key, value);
        }
      });

      // Append files
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          form.append(key, file);
        }
      });

      const response = await fetch('/api/oyuncu-basvuru', {
        method: 'POST',
        body: form,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Bir hata oluştu');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  // Başarı ekranı
  // ────────────────────────────────────────────────

  if (success && teamInfo) {
    return (
      <main className="bg-[#0d1f12] min-h-screen py-12 px-4">
        <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-4 sm:p-8 max-w-lg mx-auto text-center">
          <CheckCircle2
            size={64}
            className="text-green-400 mx-auto"
            strokeWidth={1.5}
          />

          <h1 className="text-white text-2xl font-bold mt-4">
            Başvurunuz Alındı!
          </h1>

          <p className="text-gray-400 text-sm mt-3">
            Belgeleriniz yetkili tarafından incelendikten sonra başvurunuz
            değerlendirilecektir.
          </p>

          {/* Team Info Box */}
          <div className="mt-6 bg-[#1a2e1d] border border-[#2d4a32] rounded-xl p-4 text-left">
            <p className="text-xs text-gray-400 mb-1">Takım</p>
            <p className="text-white font-bold text-sm mb-3">
              {teamInfo.team_name}
            </p>
            <p className="text-xs text-gray-400 mb-1">Kurum</p>
            <p className="text-white text-sm">{teamInfo.institution}</p>
          </div>

          {/* Home Button */}
          <Link
            href="/"
            className="mt-6 inline-block bg-[#f0a500] text-[#0d1f12] font-bold px-6 py-3 rounded-xl hover:bg-[#f0a500]/90 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </main>
    );
  }

  // ────────────────────────────────────────────────
  // AŞAMA 1: Anahtar giriş
  // ────────────────────────────────────────────────

  if (step === 'key') {
    return (
      <main className="bg-[#0d1f12] min-h-screen py-12 px-4">
        <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-4 sm:p-8 max-w-lg mx-auto">
          {/* Header */}
          <Link
            href="/"
            className="text-gray-400 hover:text-white text-sm transition-colors inline-block mb-4"
          >
            ← Ana Sayfa
          </Link>

          <div className="mb-6">
            <span className="inline-block bg-[#f0a500] text-[#0d1f12] text-xs font-bold px-3 py-1 rounded-full mb-3">
              Oyuncu Kaydı
            </span>
            <h1 className="text-white text-2xl font-bold">Takıma Katıl</h1>
            <p className="text-gray-400 text-sm mt-2">
              Takım sorumlusundan aldığınız anahtarı girin.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4 flex gap-3">
              <XCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleKeySubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Takım Anahtarı
              </label>
              <input
                type="text"
                name="team_key"
                value={teamKey}
                onChange={handleKeyChange}
                placeholder="Örn: AB12CD34"
                required
                maxLength={8}
                className="bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-12 w-full px-4 placeholder-gray-500 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] transition-colors text-center font-mono text-lg tracking-widest"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-[#f0a500] text-[#0d1f12] font-bold h-12 w-full rounded-xl hover:bg-[#f0a500]/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Kontrol ediliyor...
                </>
              ) : (
                'Devam Et'
              )}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // ────────────────────────────────────────────────
  // AŞAMA 2: Oyuncu formu
  // ────────────────────────────────────────────────

  return (
    <main className="bg-[#0d1f12] min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto bg-[#1a2e1d] rounded-2xl border border-[#2d4a32] p-8">
        {/* Team Info Card */}
        <div className="bg-[#f0a500]/10 border border-[#f0a500]/30 rounded-xl p-4 mb-6 flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-400 mb-1">Takım</p>
            <p className="text-white font-bold mb-3">{teamInfo?.team_name}</p>
            <p className="text-xs text-gray-400 mb-1">Kurum</p>
            <p className="text-white">{teamInfo?.institution}</p>
          </div>
          <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full shrink-0">
            ✓ Anahtar Doğrulandı
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4 flex gap-3">
            <XCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Back Link */}
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6"
        >
          ← Ana Sayfaya Dön
        </Link>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-8">
          {/* SECTION 1: Kişisel Bilgiler */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white border-l-4 border-[#f0a500] pl-3">
              Kişisel Bilgiler
            </h2>

            {/* Ad - Soyad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Ad <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ad"
                  className="w-full h-11 bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg px-3 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder:text-gray-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Soyad <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Soyad"
                  className="w-full h-11 bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg px-3 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder:text-gray-600 transition-colors"
                />
              </div>
            </div>

            {/* Telefon - E-posta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Telefon <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Telefon"
                  className="w-full h-11 bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg px-3 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder:text-gray-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  E-posta <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="E-posta"
                  className="w-full h-11 bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg px-3 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder:text-gray-600 transition-colors"
                />
              </div>
            </div>

            {/* TC Kimlik No */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                TC Kimlik No{' '}
                <span className="text-gray-500 text-xs font-normal">
                  (opsiyonel)
                </span>
              </label>
              <input
                type="text"
                name="tc_no"
                value={formData.tc_no}
                onChange={handleInputChange}
                maxLength={11}
                placeholder="TC Kimlik No"
                className="w-full h-11 bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg px-3 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder:text-gray-600 transition-colors"
              />
            </div>

            {/* Kurum Adı */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Kurum Adı <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleInputChange}
                required
                placeholder="Kurum Adı"
                className="w-full h-11 bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg px-3 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder:text-gray-600 transition-colors"
              />
            </div>

            {/* Forma Numarası */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Forma Numarası <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="jersey_number"
                value={formData.jersey_number}
                onChange={handleInputChange}
                min="1"
                max="99"
                required
                placeholder="Forma Numarası"
                className="w-full h-11 bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg px-3 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder:text-gray-600 transition-colors"
              />
            </div>
          </div>

          {/* SECTION 2: Belgeler */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white border-l-4 border-[#f0a500] pl-3">
              Belgeler
            </h2>

            {/* Info Box */}
            <div className="bg-[#f0a500]/10 border border-[#f0a500]/30 rounded-lg p-4 flex gap-3">
              <Info size={16} className="text-[#f0a500] shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                Tüm belgeler PDF, JPG veya PNG formatında, maksimum 5 MB
                olmalıdır.
              </p>
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              {/* Row 1: TC Ön - TC Arka */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileUploadField
                  label="TC Kimlik Ön Yüz"
                  fieldName="tc_front"
                  required={true}
                  fileName={fileNames.tc_front}
                  onChange={(e) => handleFileChange(e, 'tc_front')}
                />
                <FileUploadField
                  label="TC Kimlik Arka Yüz"
                  fieldName="tc_back"
                  required={true}
                  fileName={fileNames.tc_back}
                  onChange={(e) => handleFileChange(e, 'tc_back')}
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-2 mb-4 flex items-start gap-3">
                <Info size={16} className="text-blue-400 mt-0.5 shrink-0" />
                <p className="text-blue-200 text-xs leading-relaxed">
                  • İş yerinize ait iş yeri kimlik kartınız varsa TC kimlik belgesi yerine onu da yükleyebilirsiniz.<br/>
                  • Kimlik bilgilerinizi paylaşmak istemiyorsanız yönetici ile iletişime geçerek bu durumu belirtebilirsiniz.<br/>
                  • Farklı bir belge yüklemek istiyorsanız lütfen önce yöneticiye bildiriniz.
                </p>
              </div>

              {/* Row 2: Çalışma Belgesi - SGK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileUploadField
                  label="Çalışma Belgesi"
                  fieldName="work_certificate"
                  required={true}
                  fileName={fileNames.work_certificate}
                  onChange={(e) => handleFileChange(e, 'work_certificate')}
                />
                <FileUploadField
                  label="SGK Belgesi"
                  fieldName="sgk_certificate"
                  required={true}
                  fileName={fileNames.sgk_certificate}
                  onChange={(e) => handleFileChange(e, 'sgk_certificate')}
                />
              </div>

              {/* Row 3: Vesikalık */}
              <FileUploadField
                label="Vesikalık Fotoğraf"
                fieldName="passport_photo"
                required={true}
                fileName={fileNames.passport_photo}
                onChange={(e) => handleFileChange(e, 'passport_photo')}
              />

              {/* Row 4: Taahhütname */}
              <FileUploadField
                label="Taahhütname"
                fieldName="other_document"
                required={true}
                fileName={fileNames.other_document}
                onChange={(e) => handleFileChange(e, 'other_document')}
              />
              <p className="text-xs text-gray-500 mt-1">
                Turnuva katılım taahhütnamesini imzalayıp taratarak yükleyiniz. PDF, JPG veya PNG
              </p>
            </div>
          </div>

          {/* KVKK Checkbox */}
          <div className="bg-[#0d1f12] border border-[#2d4a32] rounded-xl p-4 mb-4 flex items-start gap-3">
            <input
              type="checkbox"
              checked={kvkkAccepted}
              onChange={(e) => setKvkkAccepted(e.target.checked)}
              style={{
                accentColor: '#f0a500',
              }}
              className="mt-1 w-4 h-4 shrink-0 cursor-pointer"
            />
            <label className="text-gray-300 text-sm leading-relaxed cursor-pointer">
              Kişisel verilerimin 6698 sayılı KVKK kapsamında Karabük Kamu Kurumları Bahar Futbol Turnuvası organizasyonu tarafından işlenmesini, saklanmasını ve turnuva süreciyle sınırlı olarak kullanılmasını okudum ve onaylıyorum.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#f0a500] text-[#0d1f12] font-bold rounded-xl hover:bg-[#f0a500]/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              'Başvuruyu Gönder'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

interface FileUploadFieldProps {
  label: string;
  fieldName: string;
  required: boolean;
  fileName?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FileUploadField({
  label,
  fieldName,
  required,
  fileName,
  onChange,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-sm text-gray-300 mb-2">
        {label}{' '}
        {required ? (
          <span className="text-red-400">*</span>
        ) : (
          <span className="text-gray-500">(opsiyonel)</span>
        )}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        className="bg-[#0d1f12] border-2 border-dashed border-[#2d4a32] hover:border-[#f0a500]/50 rounded-lg p-4 cursor-pointer transition-colors flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FileText size={20} className="text-[#f0a500] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">{label}</p>
            <p className="text-xs text-gray-500">PDF, JPG veya PNG — maks. 5 MB</p>
          </div>
        </div>
        {fileName ? (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-green-400">✓</span>
            <span className="text-xs text-green-400 max-w-20 truncate">
              {fileName}
            </span>
          </div>
        ) : (
          <button
            type="button"
            className="bg-[#2d4a32] text-white rounded px-3 py-1 text-sm shrink-0 hover:bg-[#3d5a42] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Dosya Seç
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        id={fieldName}
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={onChange}
        required={required}
        className="hidden"
      />
    </div>
  );
}
