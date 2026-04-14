'use client';

import { useSearchParams, useRouter } from 'next/navigation';

interface AdminFilterProps {
  teams: any[];
}

export default function AdminFilter({ teams }: AdminFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentFilter = searchParams.get('durum') || 'all';

  const stats = {
    all: teams.length,
    pending: teams.filter((t) => t.status === 'pending').length,
    approved: teams.filter((t) => t.status === 'approved').length,
    rejected: teams.filter((t) => t.status === 'rejected').length,
    updated: teams.filter((t) => t.status === 'rejected' && t.update_count > 0)
      .length,
  };

  const filters = [
    { label: 'Tümü', value: 'all'},
    { label: 'Beklemede', value: 'pending'},
    { label: 'Onaylandı', value: 'approved'},
    { label: 'Reddedildi', value: 'rejected'},
    { label: 'Güncellendi', value: 'updated'},
  ];

  const handleFilter = (value: string) => {
    if (value === 'all') {
      router.push('/admin');
    } else {
      router.push(`/admin?durum=${value}`);
    }
  };

  const hasUpdates = stats.updated > 0;

  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {filters.map((filter) => {
        const isActive = currentFilter === filter.value;
        const showUpdateIndicator = filter.value === 'updated' && hasUpdates;

        return (
          <button
            key={filter.value}
            onClick={() => handleFilter(filter.value)}
            className="relative px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all"
            style={
              isActive
                ? {
                    backgroundColor: '#f0a500',
                    color: '#0d1f12',
                  }
                : {
                    backgroundColor: '#1a2e1d',
                    color: '#9ca3af',
                    borderColor: '#2d4a32',
                  }
            }
          >
            {filter.value === 'all' && `Tümü (${stats.all})`}
            {filter.value === 'pending' && `Beklemede (${stats.pending})`}
            {filter.value === 'approved' && `Onaylandı (${stats.approved})`}
            {filter.value === 'rejected' && `Reddedildi (${stats.rejected})`}
            {filter.value === 'updated' && `Güncellendi (${stats.updated})`}
            
            {showUpdateIndicator && (
              <span
                className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
