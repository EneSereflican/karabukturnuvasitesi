'use client';

import { useState } from 'react';
import { Key, Copy, Check } from 'lucide-react';

interface TeamKeyDisplayProps {
  teamKey: string;
}

export default function TeamKeyDisplay({ teamKey }: TeamKeyDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(teamKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#0d1f12',
        borderColor: 'rgba(240, 165, 0, 0.3)',
      }}
      className="border rounded-xl p-3 mt-3 flex items-center gap-3"
    >
      <Key size={16} style={{ color: '#f0a500' }} className="shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-gray-400 text-xs">Takım Anahtarı</p>
        <p
          className="font-mono font-bold text-xl tracking-widest mt-0.5"
          style={{ color: '#f0a500' }}
        >
          {teamKey}
        </p>
      </div>

      <button
        onClick={handleCopy}
        style={{
          backgroundColor: '#2d4a32',
          borderColor: '#2d4a32',
        }}
        className="border rounded-lg px-3 py-1.5 text-xs text-white hover:bg-[#f0a500]/20 transition-colors shrink-0 flex items-center gap-1.5"
      >
        {copied ? (
          <>
            <Check size={13} />
            Kopyalandı!
          </>
        ) : (
          <>
            <Copy size={13} />
            Kopyala
          </>
        )}
      </button>
    </div>
  );
}
