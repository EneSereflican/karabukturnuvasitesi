'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, XCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Giris başarısız');
        return;
      }

      window.location.href = '/admin';
    } catch (err) {
      setError('Giris sırasında bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1f12] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-10">
        {/* Icon Circle */}
        <div className="w-16 h-16 rounded-full bg-[#f0a500]/10 border border-[#f0a500]/30 mx-auto mb-4 flex items-center justify-center">
          <Lock size={28} className="text-[#f0a500]" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Admin Girişi</h1>
          <p className="text-gray-400 text-sm">Karabük Turnuvası Yönetim Paneli</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm flex items-center gap-2">
            <XCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm text-gray-400 mb-1">
              E-posta
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@kurum.gov.tr"
                className="w-full h-11 bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg pl-10 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder:text-gray-600 transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm text-gray-400 mb-1 mt-4">
              Şifre
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full h-11 bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg pl-10 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder:text-gray-600 transition-colors"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#f0a500] text-[#0d1f12] font-bold rounded-xl hover:bg-[#f0a500]/90 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Giriş Yapılıyor...</span>
              </>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <Link href="/">
            <p className="text-gray-400 hover:text-gray-300 transition-colors text-sm">
              ← Ana Sayfaya Dön
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
