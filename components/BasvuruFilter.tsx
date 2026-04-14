'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface BasvuruFilterProps {
  active: string;
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function BasvuruFilter({ active, counts }: BasvuruFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (status: string | null) => {
    if (status === 'all' || status === null) {
      router.push('/basvuru-durumlari');
    } else {
      router.push(`/basvuru-durumlari?durum=${status}`);
    }
  };

  const filters = [
    { key: 'all', label: 'Tümü', count: counts.all },
    { key: 'pending', label: 'Beklemede', count: counts.pending },
    { key: 'approved', label: 'Onaylandı', count: counts.approved },
    { key: 'rejected', label: 'Reddedildi', count: counts.rejected },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => handleFilterChange(filter.key === 'all' ? null : filter.key)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            active === filter.key
              ? 'bg-[#f0a500] text-[#0d1f12] font-bold'
              : 'bg-[#1a2e1d] text-gray-400 border border-[#2d4a32] hover:border-[#f0a500]/50'
          }`}
        >
          {filter.label}
        </button>
      ))}
      <div className="flex-1"></div>
      <p className="text-gray-400 text-sm whitespace-nowrap">
        {filters.find((f) => f.key === active)?.count || counts.all} takım
      </p>
    </div>
  );
}
