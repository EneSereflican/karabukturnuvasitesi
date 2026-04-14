'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, File } from 'lucide-react';
import BelgeButonlari from '@/components/BelgeButonlari';

interface Document {
  id: string;
  document_type: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  tc_no: string;
  phone: string;
  email: string;
  institution: string;
  jersey_number: number;
}

interface PlayerCardProps {
  player: Player;
  documents: Document[];
}

function getDocumentTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    tc_front: 'TC Kimlik Ön Yüz',
    tc_back: 'TC Kimlik Arka Yüz',
    work_certificate: 'Çalışma Belgesi',
    sgk_certificate: 'SGK Belgesi',
    passport_photo: 'Vesikalık Fotoğraf',
    bank_receipt: 'Banka Dekontu',
    other: 'Diğer Belge',
  };
  return typeMap[type] || type;
}

export default function PlayerCard({ player, documents }: PlayerCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div
      style={{
        backgroundColor: '#0d1f12',
        borderColor: isOpen ? 'rgba(240, 165, 0, 0.2)' : '#2d4a32',
      }}
      className={`border rounded-xl p-4 mb-3 hover:border-[#f0a500]/30 transition-all cursor-pointer group`}
    >
      {/* Collapsed View */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex items-center gap-4"
      >
        {/* Jersey Number Circle */}
        <div
          style={{
            backgroundColor: '#1a2e1d',
            borderColor: '#2d4a32',
            color: '#f0a500',
          }}
          className="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-center shrink-0"
        >
          {player.jersey_number}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium">
            {player.first_name} {player.last_name}
          </p>
          <p className="text-gray-400 text-sm">
            {player.institution}
          </p>
        </div>

        {/* Chevron */}
        <div className="text-gray-600 group-hover:text-[#f0a500] transition-colors shrink-0">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded View */}
      {isOpen && (
        <>
          <div
            style={{ borderColor: '#2d4a32' }}
            className="border-t my-3"
          />

          {/* Player Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-gray-400 text-xs mb-1">TC No</p>
              <p className="text-white font-medium text-sm">{player.tc_no}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Telefon</p>
              <p className="text-white font-medium text-sm">{player.phone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 text-xs mb-1">E-posta</p>
              <p className="text-white font-medium text-sm">{player.email}</p>
            </div>
          </div>

          {/* Documents Section */}
          {documents.length > 0 && (
            <>
              <p className="text-gray-400 text-sm font-medium mt-4 mb-2">
                Yüklenen Belgeler
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      backgroundColor: '#0d1f12',
                      borderColor: '#2d4a32',
                    }}
                    className="border rounded-xl p-4 hover:border-[#f0a500]/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <File
                          size={18}
                          style={{ color: '#f0a500' }}
                          className="shrink-0 mt-0.5"
                        />
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium">
                            {getDocumentTypeName(doc.document_type)}
                          </p>
                          <p className="text-gray-400 text-xs truncate mt-0.5">
                            {doc.file_name}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {Math.round(doc.file_size / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <BelgeButonlari
                          filePath={doc.file_path}
                          fileName={doc.file_name}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
