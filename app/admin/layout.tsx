import AdminLogoutButton from '@/components/AdminLogoutButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0d1f12]">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-[#1a2e1d] border-b border-[#2d4a32] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-3">
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
            <h1 className="text-white font-bold">Karabük Turnuvası</h1>
            <div className="bg-[#f0a500]/20 text-[#f0a500] text-xs px-2 py-0.5 rounded font-medium">
              Admin Paneli
            </div>
          </div>

          {/* Right Side - Logout Button */}
          <AdminLogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
