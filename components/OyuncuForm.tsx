'use client';

import { useState, useRef } from 'react';
import { FileText, Info, XCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface OyuncuFormProps {
  inviteToken: string;
  teamName: string;
  teamInstitution: string;
  spotsLeft: number;
  totalMembers: number;
}

export default function OyuncuForm({
  inviteToken,
  teamName,
  teamInstitution,
  spotsLeft,
  totalMembers,
}: OyuncuFormProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    tc_no: '',
    phone: '',
    email: '',
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

    if (!files['other_document']) {
      setError('Lütfen taahhütname belgesini yükleyin.');
      setLoading(false);
      return;
    }

    try {
      const form = new FormData();

      // Append form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          form.append(key, value);
        }
      });

      // Append invite token
      form.append('invite_token', inviteToken);

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
        jersey_number: '',
      });
      setFiles({
        tc_front: null,
        tc_back: null,
        work_certificate: null,
        sgk_certificate: null,
        passport_photo: null,
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
          <CheckCircle2 size={64} className="text-green-400 mx-auto" />
          <h1 className="text-3xl font-bold text-white">Başvurunuz Alındı!</h1>
          <p className="text-gray-300">
            Belgeleriniz yetkili tarafından incelendikten sonra başvurunuz değerlendirilecektir.
          </p>
          <div className="bg-[#f0a500]/10 border border-[#f0a500]/30 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              Başvurunuzun durumunu takip etmek için takım sorumlusundan takip linkini isteyin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1f12] py-12 px-4 sm:px-6 lg:px-8">
      {/* Team Info Card */}
      <div className="max-w-2xl mx-auto bg-[#1a2e1d] rounded-2xl border border-[#f0a500]/30 p-6 mb-6">
        <div className="inline-block bg-[#f0a500]/20 border border-[#f0a500]/30 rounded-full px-4 py-2 mb-4">
          <span className="text-[#f0a500] text-sm font-semibold">Oyuncu Kaydı</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left Side - Team Info */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Takım</p>
            <p className="text-lg font-bold text-white mb-3">{teamName}</p>
            <p className="text-xs text-gray-400 mb-1">Kurum</p>
            <p className="text-white">{teamInstitution}</p>
          </div>

          {/* Right Side - Capacity Indicator */}
          <div className="w-full sm:w-auto text-right">
            <div className="mb-4">
              <p className="text-3xl font-bold text-[#f0a500]">
                {totalMembers}/15
              </p>
              <p className="text-xs text-gray-400">kayıtlı üye</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-3 w-full sm:w-32">
              <div className="bg-[#0d1f12] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#f0a500] h-full transition-all duration-300"
                  style={{ width: `${(totalMembers / 15) * 100}%` }}
                ></div>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              {spotsLeft} boş yer kaldı
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto bg-[#1a2e1d] rounded-2xl border border-[#2d4a32] p-8">
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

            {/* Forma Numarası */}
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

          {/* Divider */}
          <div className="border-t border-[#2d4a32]"></div>

          {/* SECTION 2: Belgeler */}
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

              {/* Row 3: Vesikalık (full width) */}
              <FileUploadField
                label="Vesikalık Fotoğraf"
                fieldName="passport_photo"
                required={true}
                fileName={fileNames.passport_photo}
                onChange={(e) => handleFileChange(e, 'passport_photo')}
              />

              {/* Row 4: Taahhütname (full width) */}
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
            <p className="text-xs text-gray-500">PDF, JPG veya PNG — maks. 5 MB<br />(Dosya adında Türkçe karakter ve boşluk olmamasına dikkat edin)</p>
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
