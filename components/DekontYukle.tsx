'use client';

import { useState, useRef } from 'react';
import { CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';

interface DekontYukleProps {
  teamKey: string;
  hasReceipt: boolean;
}

export default function DekontYukle({
  teamKey,
  hasReceipt,
}: DekontYukleProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [enteredKey, setEnteredKey] = useState('');
  const [responsibleEmail, setResponsibleEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowKeyInput(true);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !enteredKey) {
      setError('Lütfen dosya ve takım anahtarı seçiniz');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('team_key', enteredKey.toUpperCase());
      formData.append('bank_receipt', selectedFile);
      formData.append('responsible_email', responsibleEmail);

      const response = await fetch('/api/dekont-yukle', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Yükleme başarısız oldu');
        setLoading(false);
        return;
      }

      // Success - reload page
      window.location.reload();
    } catch (err) {
      console.error('Error:', err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  if (hasReceipt) {
    return (
      <div
        className="rounded-xl p-4 mt-3 flex items-center gap-3 border"
        style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgba(34, 197, 94, 0.2)',
        }}
      >
        <CheckCircle size={16} className="text-green-400 shrink-0" />
        <div className="flex-1">
          <p className="text-green-400 text-sm font-medium">Dekont yüklendi</p>
          <p className="text-gray-400 text-xs mt-1">Güncelmek ister misiniz?</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#2d4a32] text-white text-xs rounded-lg px-3 py-1.5 hover:bg-[#3d5a42] transition-colors shrink-0"
        >
          Güncelle
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  // hasReceipt is false
  return (
    <>
      <div
        className="rounded-xl p-4 mt-3 flex items-start gap-3 border"
        style={{
          backgroundColor: 'rgba(240, 165, 0, 0.05)',
          borderColor: 'rgba(240, 165, 0, 0.2)',
        }}
      >
        <AlertCircle size={16} className="text-[#f0a500] mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-[#f0a500] text-sm font-medium">Dekont yüklenmedi</p>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Nakit ödeme yaptıysanız önemsemeyin. Havale/EFT yapacaksanız
            dekontunuzu yükleyin. Yalnızca takım sorumluları dekont yükleyebilir.
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#f0a500] text-[#0d1f12] text-xs font-bold rounded-lg px-3 py-1.5 hover:bg-[#f0a500]/90 transition-colors shrink-0"
        >
          Dekont Yükle
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Upload Dialog */}
      {showKeyInput && selectedFile && (
        <div 
          className="mt-3 border border-[#2d4a32] rounded-2xl p-6"
          style={{ backgroundColor: '#1a2e1d' }}
        >
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">Dekont Yükle</h3>
              <button
                onClick={() => {
                  setShowKeyInput(false);
                  setSelectedFile(null);
                  setEnteredKey('');
                  setResponsibleEmail('');
                  setError(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* File Info */}
            <div className="mb-6 p-3 bg-[#0d1f12] border border-[#2d4a32] rounded-lg">
              <p className="text-gray-400 text-sm">{selectedFile.name}</p>
              <p className="text-gray-500 text-xs mt-1">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>

            {/* Team Key Input */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Takım Anahtarı
              </label>
              <input
                type="text"
                value={enteredKey}
                onChange={(e) => setEnteredKey(e.target.value.toUpperCase())}
                placeholder="Örn: AB12CD34"
                maxLength={8}
                className="w-full bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-10 px-3 font-mono text-center tracking-widest placeholder-gray-600 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] transition-colors"
              />
            </div>

            {/* Responsible Email Input */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Sorumlu E-posta Adresi
              </label>
              <input
                type="email"
                value={responsibleEmail}
                onChange={(e) => setResponsibleEmail(e.target.value)}
                placeholder="Takım sorumlusunun e-posta adresi"
                className="bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-10 w-full mt-2 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] transition-colors px-3"
              />
              <p className="text-gray-400 text-xs mt-1">
                Takım oluşturulurken girilen sorumlu e-posta adresi ile doğrulama yapılır.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={loading || !enteredKey || !responsibleEmail || !selectedFile}
              className="w-full bg-[#f0a500] text-[#0d1f12] font-bold h-10 rounded-lg hover:bg-[#f0a500]/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                'Yükle'
              )}
            </button>
          </div>
      )}
    </>
  );
}
