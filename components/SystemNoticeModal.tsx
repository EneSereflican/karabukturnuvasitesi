"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SystemNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Component yüklendiğinde modalı aç
    // İsterseniz localStorage kullanarak kullanıcının sadece 1 kere görmesini sağlayabilirsiniz:
    // const hasSeen = localStorage.getItem('systemNoticeSeen');
    // if (!hasSeen) { setIsOpen(true); }
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // localStorage.setItem('systemNoticeSeen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl border border-[#f0a500]/30 bg-[#1a2e1d] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Kapat Butonu */}
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* İkon ve Başlık */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0a500]/20 mb-4">
            <AlertTriangle className="h-6 w-6 text-[#f0a500]" />
          </div>
          <h2 className="text-xl font-bold text-white">Turnuva Sona Erdi</h2>
        </div>

        {/* Mesaj İçeriği */}
        <div className="space-y-4 text-gray-300 text-sm leading-relaxed text-center">
          <p>
            2025-2026 Karabük Üniversitesi Futbol Turnuvası tamamlanmıştır. Tüm takımlara ve oyunculara katılımları için teşekkür ederiz.
          </p>
        </div>

        {/* Alt Butonlar */}
        <div className="mt-8 flex justify-center">
          <Button 
            onClick={handleClose}
            className="w-full sm:w-auto bg-[#f0a500] text-[#0d1f12] hover:bg-[#e09500] font-bold px-8"
          >
            Anladım
          </Button>
        </div>

      </div>
    </div>
  );
}
