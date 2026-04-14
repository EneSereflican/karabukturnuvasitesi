'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GuncelleFormProps {
  captainToken: string;
  teamName: string;
  rejectionNote: string | null;
  updateCount: number;
}

const DOCUMENTS = [
  { key: 'tc_front', label: 'TC Kimlik Ön Yüz' },
  { key: 'tc_back', label: 'TC Kimlik Arka Yüz' },
  { key: 'work_certificate', label: 'Çalışma Belgesi' },
  { key: 'sgk_certificate', label: 'SGK Belgesi' },
  { key: 'passport_photo', label: 'Vesikalık Fotoğraf' },
  { key: 'bank_receipt', label: 'Banka Dekontu' },
  { key: 'other_document', label: 'Diğer Belge' },
];

export default function GuncelleForm({
  captainToken,
  teamName,
  rejectionNote,
  updateCount,
}: GuncelleFormProps) {
  const [checkedFields, setCheckedFields] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCheckChange = (key: string) => {
    setCheckedFields((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    // Reset file when unchecking
    if (checkedFields[key]) {
      setFiles((prev) => ({
        ...prev,
        [key]: null,
      }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const file = e.target.files?.[0] || null;
    setFiles((prev) => ({
      ...prev,
      [key]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    const checkedCount = Object.values(checkedFields).filter(Boolean).length;
    if (checkedCount === 0) {
      setError(
        'Lütfen güncellenecek belgeyi seçin ve dosyasını yükleyin.'
      );
      return;
    }

    // Check all checked fields have files
    for (const [key, checked] of Object.entries(checkedFields)) {
      if (checked && !files[key]) {
        setError(
          'Lütfen güncellenecek belgeyi seçin ve dosyasını yükleyin.'
        );
        return;
      }
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append('captain_token', captainToken);

      // Only append files for checked fields
      for (const [key, checked] of Object.entries(checkedFields)) {
        if (checked && files[key]) {
          form.append(key, files[key]!);
        }
      }

      const response = await fetch('/api/guncelle', {
        method: 'POST',
        body: form,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Güncelleme sırasında hata oluştu');
        return;
      }

      setSuccess(true);
      setCheckedFields({});
      setFiles({});
    } catch (err) {
      setError('Güncelleme sırasında hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Başvuru Güncellendi</h1>
          <p className="text-gray-600 mb-6">
            Başvurunuz güncellendi! Belgeleriniz tekrar incelemeye alınmıştır.
          </p>
          <Link
            href={`/takim/${captainToken}`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Takip Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Başvuruyu Güncelle
        </h1>

        {/* Team Info Card */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg space-y-3">
          <div>
            <p className="text-sm text-gray-600">Takım Adı</p>
            <p className="text-lg font-semibold text-gray-900">{teamName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Kalan Güncelleme Hakkı</p>
            <p className="text-lg font-semibold text-gray-900">
              {2 - updateCount} / 2
            </p>
          </div>
        </div>

        {/* Rejection Note */}
        {rejectionNote && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-semibold text-yellow-800 mb-2">
              Red Gerekçesi:
            </p>
            <p className="text-sm text-yellow-700">{rejectionNote}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Document Selection */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Güncellenecek Belgeleri Seçin
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Yalnızca değiştirmek istediğiniz belgeleri seçin ve yeni dosyayı yükleyin.
            </p>

            <div className="space-y-4">
              {DOCUMENTS.map((doc) => (
                <div key={doc.key}>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={doc.key}
                      checked={checkedFields[doc.key] || false}
                      onChange={() => handleCheckChange(doc.key)}
                      className="w-4 h-4 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={doc.key}
                      className="ml-3 text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      {doc.label}
                    </label>
                  </div>

                  {checkedFields[doc.key] && (
                    <div className="ml-7">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, doc.key)}
                        required
                        className="block w-full text-sm text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG veya PNG — maks. 5 MB
                      </p>
                      {files[doc.key] && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ {files[doc.key]!.name} seçildi
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Gönderiliyor...' : 'Güncellemeyi Gönder'}
          </button>
        </form>
      </div>
    </div>
  );
}
