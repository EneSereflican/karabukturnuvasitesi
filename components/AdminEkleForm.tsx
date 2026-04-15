'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminEkleForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Bir hata oluştu');
        setLoading(false);
        return;
      }

      // Success - reload page
      window.location.reload();
    } catch (err) {
      setError('Bir hata oluştu');
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#1a2e1d',
        borderColor: '#2d4a32',
      }}
      className="border border-[#2d4a32] rounded-2xl p-6 mt-8"
    >
      <h2 className="text-white font-bold text-xl mb-6">Yeni Admin Ekle</h2>

      {error && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
          className="border border-red-500/30 rounded-lg p-4 mb-6 text-red-400 text-sm"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm mb-2">Ad Soyad</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-[#0d1f12] border border-[#2d4a32] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#f0a500]"
            placeholder="İsim ve Soyadı"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#0d1f12] border border-[#2d4a32] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#f0a500]"
            placeholder="yönetici@example.com"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-[#0d1f12] border border-[#2d4a32] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#f0a500]"
            placeholder="Güçlü bir şifre girin"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#f0a500] text-[#0d1f12] hover:bg-[#e09500] font-bold py-2"
        >
          {loading ? 'Ekleniyor...' : 'Admin Ekle'}
        </Button>
      </form>
    </div>
  );
}
