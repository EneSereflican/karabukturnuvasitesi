'use client';

import { Eye, Download } from 'lucide-react';

interface BelgeButonlariProps {
  filePath: string;
  fileName: string;
}

export default function BelgeButonlari({
  filePath,
  fileName,
}: BelgeButonlariProps) {
  return (
    <div className="flex gap-2">
      <a
        href={`/api/admin/belge?path=${encodeURIComponent(filePath)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-all"
        style={{
          backgroundColor: '#1a2e1d',
          borderColor: '#2d4a32',
          color: '#d1d5db',
        }}
      >
        <Eye size={13} />
        Görüntüle
      </a>
      <a
        href={`/api/admin/belge?path=${encodeURIComponent(filePath)}&download=true`}
        download={fileName}
        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-all border"
        style={{
          backgroundColor: '#f0a500/10',
          borderColor: '#f0a500/30',
          color: '#f0a500',
        }}
      >
        <Download size={13} />
        İndir
      </a>
    </div>
  );
}
