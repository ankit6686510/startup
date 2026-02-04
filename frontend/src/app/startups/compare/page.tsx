'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StartupCard, StartupCardSkeleton } from '@/features/startups/components/StartupCardComponent';
import { useStartups } from '@/features/startups/hooks';

interface ComparisonStartup {
  id: string;
  name: string;
}

export default function CompareStartupsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch startups to compare
  // Fetch startups to compare
  const { data, isLoading } = useStartups(currentPage, 12, {});

  const toggleStartup = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const canCompare = selectedIds.length >= 2;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Compare Startups</h1>
          <p className="text-slate-600">Select 2-4 startups to compare side-by-side</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selection Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="font-bold text-slate-900 mb-4">
                Selected ({selectedIds.length}/4)
              </h2>

              {selectedIds.length > 0 ? (
                <>
                  <div className="space-y-2 mb-4">
                    {selectedIds.map((id) => {
                      const startup = data?.items.find((s) => s.id === id);
                      return startup ? (
                        <div key={id} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                          <span className="text-sm font-medium text-slate-900">{startup.name}</span>
                          <button
                            onClick={() => toggleStartup(id)}
                            className="text-slate-500 hover:text-slate-900 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>

                  {canCompare && (
                    <Link
                      href={`/startups/compare/${selectedIds.join(',')}`}
                      className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Compare Selected →
                    </Link>
                  )}

                  <button
                    onClick={() => setSelectedIds([])}
                    className="w-full mt-2 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition font-medium text-sm"
                  >
                    Clear
                  </button>
                </>
              ) : (
                <p className="text-slate-600 text-sm">Select startups to begin comparing</p>
              )}
            </div>
          </aside>

          {/* Startups Grid */}
          <main className="lg:col-span-2">
            {/* Filter Tips */}
            {selectedIds.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
                💡 Click on startups below to select them for comparison
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <StartupCardSkeleton key={i} />
                ))}
              </div>
            ) : data && data.items.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.items.map((startup) => (
                    <div
                      key={startup.id}
                      onClick={() => toggleStartup(startup.id)}
                      className={`cursor-pointer transition transform hover:scale-102 ${selectedIds.includes(startup.id) ? 'ring-2 ring-blue-600' : ''}`}
                    >
                      <div className="relative">
                        <StartupCard startup={startup} variant="grid" />
                        {selectedIds.includes(startup.id) && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {data.total > data.pageSize && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      ← Previous
                    </button>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(Math.ceil(data.total / data.pageSize), p + 1))}
                      disabled={currentPage === Math.ceil(data.total / data.pageSize)}
                      className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-slate-600">No startups found</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
