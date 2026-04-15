import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import AdminEkleForm from '@/components/AdminEkleForm';
import { ChevronLeft } from 'lucide-react';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function AdminUsersPage() {
  const supabase = createServiceClient();

  const { data: admins } = await supabase
    .from('admins')
    .select('id, email, name, created_at')
    .order('created_at', { ascending: true });

  return (
    <div style={{ backgroundColor: '#0d1f12' }} className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="flex items-center gap-1 text-gray-400 hover:text-gray-300 text-sm mb-4 transition-colors"
          >
            <ChevronLeft size={16} />
            Admin Paneli
          </Link>
          <h1 className="text-2xl font-bold text-white">Admin Kullanıcıları</h1>
          <p className="text-gray-400 text-sm mt-1">
            Sisteme erişimi olan yöneticiler
          </p>
        </div>

        {/* Admins List */}
        <div className="space-y-3 mb-8">
          {admins && admins.length > 0 ? (
            admins.map((admin) => (
              <div
                key={admin.id}
                style={{
                  backgroundColor: '#1a2e1d',
                  borderColor: '#2d4a32',
                }}
                className="border border-[#2d4a32] rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-medium">{admin.name}</p>
                  <p className="text-gray-400 text-sm">{admin.email}</p>
                </div>
                <p className="text-gray-400 text-sm">
                  {formatDate(admin.created_at)}
                </p>
              </div>
            ))
          ) : (
            <div
              style={{
                backgroundColor: '#1a2e1d',
                borderColor: '#2d4a32',
              }}
              className="border border-[#2d4a32] rounded-xl p-8 text-center"
            >
              <p className="text-gray-400">Henüz admin kullanıcısı yok</p>
            </div>
          )}
        </div>

        {/* Add Admin Form */}
        <AdminEkleForm />
      </div>
    </div>
  );
}
