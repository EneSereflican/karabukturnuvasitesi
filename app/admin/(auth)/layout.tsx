import AdminLogoutButton from '@/components/AdminLogoutButton';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0d1f12]">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-[#1a2e1d] border-b border-[#2d4a32] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Side */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-6 h-6 text-[#f0a500]"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              <h1 className="text-white font-bold text-sm sm:text-base">Karabük Turnuvası</h1>
              <div className="bg-[#f0a500]/20 text-[#f0a500] text-xs px-2 py-0.5 rounded font-medium hidden sm:inline-block">
                Admin Paneli
              </div>
            </div>
          </Link>

          {/* Right Side - Nav Links + Logout Button */}
          <div className="flex items-center gap-4 mr-4">
            <Link 
              href="/admin" 
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Başvurular
            </Link>
            <Link 
              href="/admin/fikstir" 
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Fikstür Yönetimi
            </Link>
          </div>
          <AdminLogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
