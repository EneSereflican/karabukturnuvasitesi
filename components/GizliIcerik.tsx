'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';

interface GizliIcerikProps {
  children: React.ReactNode;
}

export default function GizliIcerik({ children }: GizliIcerikProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = () => {
    if (password === 'kasargerekmala') {
      setUnlocked(true);
      setError(null);
    } else {
      setError('Hatalı şifre');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div
      className="rounded-xl p-6 text-center border"
      style={{
        backgroundColor: '#0d1f12',
        borderColor: '#2d4a32',
      }}
    >
      <Lock
        size={32}
        style={{ color: '#f0a500' }}
        className="mx-auto"
      />
      <p className="text-white font-semibold mt-3">Bu bilgiler gizlidir</p>
      <p className="text-gray-400 text-sm mt-1">Görüntülemek için şifre giriniz.</p>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Şifre"
        className="bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-10 w-full px-3 mt-4 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] transition-colors placeholder-gray-600"
      />

      <button
        onClick={handleUnlock}
        className="bg-[#f0a500] text-[#0d1f12] font-bold rounded-lg px-4 py-2 mt-3 w-full hover:bg-[#f0a500]/90 transition-colors"
      >
        Görüntüle
      </button>

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
