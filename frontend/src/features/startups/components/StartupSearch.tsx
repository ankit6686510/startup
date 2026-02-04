'use client';

import { useState, useCallback } from 'react';
import { useStartupSearch } from '../hooks';

interface StartupSearchProps {
  onSearch: (query: string) => void;
  onSelectResult?: (result: any) => void;
}

export function StartupSearch({ onSearch, onSelectResult }: StartupSearchProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { data: results, isLoading } = useStartupSearch(query);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      if (value.length >= 2) {
        setShowResults(true);
        onSearch(value);
      } else {
        setShowResults(false);
      }
    },
    [onSearch]
  );

  const handleSelectResult = (result: any) => {
    setQuery(result.name);
    setShowResults(false);
    onSelectResult?.(result);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search startups by name..."
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute right-3 top-3 text-slate-400">🔍</div>
      </div>

      {showResults && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-slate-600">Searching...</div>
          ) : results && results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectResult(result)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition"
                >
                  <div className="flex items-center gap-3">
                    {result.logo && (
                      <img
                        src={result.logo}
                        alt={result.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{result.name}</p>
                      <p className="text-xs text-slate-500">
                        {result.industry} • {result.location.city}, {result.location.country}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-slate-600">No startups found</div>
          )}
        </div>
      )}
    </div>
  );
}
