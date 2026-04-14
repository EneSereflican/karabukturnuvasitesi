'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { FileText, Info, XCircle, CheckCircle2, Loader2, ChevronLeft } from 'lucide-react';

export default function CaptainApplicationPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    tc_no: '',
    phone: '',
    email: '',
    institution: '',
    team_name: '',
    jersey_number: '',
    jersey_color: '',
  });

  const [files, setFiles] = useState<Record<string, File | null>>({
    tc_front: null,
    tc_back: null,
    work_certificate: null,
    sgk_certificate: null,
    passport_photo: null,
    bank_receipt: null,
    other_document: null,
  });

  const [fileNames, setFileNames] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const form = new FormData();

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

      const response = await fetch('/api/kaptan-basvuru', {
        method: 'POST',
        body: form,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Başvuru sırasında bir hata oluştu');
        return;
      }

      setSuccess(true);
      setFormData({
        first_name: '',
        last_name: '',
        tc_no: '',
        phone: '',
        email: '',
        institution: '',
        team_name: '',
        jersey_number: '',
        jersey_color: '',
      });
      setFiles({
        tc_front: null,
        tc_back: null,
        work_certificate: null,
        sgk_certificate: null,
        passport_photo: null,
        bank_receipt: null,
        other_document: null,
      });
      setFileNames({});
    } catch (err) {
      setError('Başvuru sırasında bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0d1f12] flex items-center justify-center px-4 py-12">
        <div className="text-center space-y-6 max-w-md">
          <CheckCircle2 size={48} className="text-green-400 mx-auto" />
          <h1 className="text-3xl font-bold text-white">Başvurunuz Alındı!</h1>
          <p className="text-gray-300">
            Takip linkiniz e-posta adresinize gönderildi. Başvurunuz yetkili tarafından incelendikten sonra tarafınıza bilgi verilecektir.
          </p>
          <Link href="/">
            <button className="bg-[#f0a500] text-[#0d1f12] font-semibold px-6 py-3 rounded-lg hover:bg-[#e09500] transition-colors">
              Ana Sayfaya Dön
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1f12] py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <Link href="/">
          <button className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-8">
            <ChevronLeft size={20} />
            <span>Ana Sayfa</span>
          </button>
        </Link>

        <div className="text-center space-y-4 mb-12">
          <div className="inline-block bg-[#f0a500]/20 border border-[#f0a500]/30 rounded-full px-4 py-2">
            <span className="text-[#f0a500] text-sm font-semibold">Takım Kaydı</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Kaptan Başvuru Formu
          </h1>
          <p className="text-gray-400 text-lg">
            Takım sorumlusu olarak bilgilerinizi ve belgelerinizi eksiksiz doldurun.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto bg-[#1a2e1d] rounded-2xl border border-[#2d4a32] p-8 sm:p-10">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
            <XCircle size={20} className="text-red-400 shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: Kişisel Bilgiler */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#f0a500]"></div>
              <h2 className="text-lg font-semibold text-white">Kişisel Bilgiler</h2>
            </div>

            {/* Ad - Soyad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm text-gray-300 mb-2">
                  Ad <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ad"
                  className="w-full h-11 bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg px-3 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder:text-gray-600 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm text-gray-300 mb-2">
                  Soyad <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
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
                <label htmlFor="phone" className="block text-sm text-gray-300 mb-2">
                  Telefon <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Telefon"
                  className="w-full h-11 bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg px-3 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder:text-gray-600 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-gray-300 mb-2">
                  E-posta <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
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
              <label htmlFor="tc_no" className="block text-sm text-gray-300 mb-2">
                TC Kimlik No <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="tc_no"
                name="tc_no"
                value={formData.tc_no}
                onChange={handleInputChange}
                maxLength={11}
                required
                placeholder="TC Kimlik No"
                className="w-full h-11 bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg px-3 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder:text-gray-600 transition-colors"
              />
            </div>

            {/* Kurum Adı */}
            <div>
              <label htmlFor="institution" className="block text-sm text-gray-300 mb-2">
                Kurum Adı <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleInputChange}
                required
                placeholder="Kurum Adı"
                className="w-full h-11 bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg px-3 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder:text-gray-600 transition-colors"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#2d4a32]"></div>

          {/* SECTION 2: Takım Bilgileri */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#f0a500]"></div>
              <h2 className="text-lg font-semibold text-white">Takım Bilgileri</h2>
            </div>

            {/* Takım Adı - Forma Numarası */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="team_name" className="block text-sm text-gray-300 mb-2">
                  Takım Adı <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="team_name"
                  name="team_name"
                  value={formData.team_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Takım Adı"
                  className="w-full h-11 bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg px-3 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder:text-gray-600 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="jersey_number" className="block text-sm text-gray-300 mb-2">
                  Forma Numarası <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  id="jersey_number"
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

            {/* Forma Rengi */}
            <div>
              <label htmlFor="jersey_color" className="block text-sm text-gray-300 mb-2">
                Forma Rengi <span className="text-gray-500">(opsiyonel)</span>
              </label>
              <input
                type="text"
                id="jersey_color"
                name="jersey_color"
                value={formData.jersey_color}
                onChange={handleInputChange}
                placeholder="Örn: Kırmızı-Beyaz"
                className="w-full h-11 bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg px-3 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder:text-gray-600 transition-colors"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#2d4a32]"></div>

          {/* SECTION 3: Belgeler */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#f0a500]"></div>
              <h2 className="text-lg font-semibold text-white">Belgeler</h2>
            </div>

            {/* Info Box */}
            <div className="bg-[#f0a500]/10 border border-[#f0a500]/30 rounded-lg p-4 flex gap-3">
              <Info size={16} className="text-[#f0a500] shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                Tüm belgeler PDF, JPG veya PNG formatında, maksimum 5 MB olmalıdır.
              </p>
            </div>

            {/* File Uploads Grid */}
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

              {/* Row 3: Vesikalık - Banka Dekontu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileUploadField
                  label="Vesikalık Fotoğraf"
                  fieldName="passport_photo"
                  required={true}
                  fileName={fileNames.passport_photo}
                  onChange={(e) => handleFileChange(e, 'passport_photo')}
                />
                <FileUploadField
                  label="Banka Dekontu"
                  fieldName="bank_receipt"
                  required={true}
                  fileName={fileNames.bank_receipt}
                  onChange={(e) => handleFileChange(e, 'bank_receipt')}
                />
              </div>

              {/* Row 4: Diğer Belgeler (full width, optional) */}
              <FileUploadField
                label="Diğer Belgeler"
                fieldName="other_document"
                required={false}
                fileName={fileNames.other_document}
                onChange={(e) => handleFileChange(e, 'other_document')}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#f0a500] text-[#0d1f12] font-bold rounded-xl hover:bg-[#f0a500]/90 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Gönderiliyor...</span>
              </>
            ) : (
              'Başvuruyu Gönder'
            )}
          </button>
        </form>
      </div>
    </div>
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
        {label} {required ? <span className="text-red-400">*</span> : <span className="text-gray-500">(opsiyonel)</span>}
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
            <span className="text-xs text-green-400 max-w-20 truncate">{fileName}</span>
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
