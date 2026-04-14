'use client';

import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

interface InviteCardProps {
  inviteUrl: string;
}

export default function InviteCard({ inviteUrl }: InviteCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-[#1a2e1d] border border-[#f0a500]/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <Share2 size={20} className="text-[#f0a500]" />
        <h2 className="text-white font-semibold">Oyuncu Davet Linki</h2>
      </div>

      <p className="text-gray-400 text-sm mt-2 mb-4">
        Bu linki takım üyelerinizle paylaşın. Link sahibi olan herkes oyuncu
        olarak başvurabilir.
      </p>

      <div className="bg-[#0d1f12] border border-[#2d4a32] rounded-lg p-3 flex items-center justify-between gap-3">
        <p className="text-[#f0a500] text-sm font-mono truncate">{inviteUrl}</p>
        <button
          onClick={handleCopy}
          className="bg-[#2d4a32] hover:bg-[#f0a500]/20 text-white text-sm px-3 py-1 rounded-lg transition-colors flex items-center gap-2 shrink-0"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-400" />
              <span>Kopyalandı!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Kopyala</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
