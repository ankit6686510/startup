'use client';

import { StartupNews } from '../types';

interface NewsTimelineProps {
  news: StartupNews[];
  isLoading?: boolean;
}

export function NewsTimeline({ news, isLoading = false }: NewsTimelineProps) {
  const categoryColors: Record<string, string> = {
    FUNDING: 'bg-green-100 text-green-800',
    PRODUCT: 'bg-blue-100 text-blue-800',
    PARTNERSHIP: 'bg-purple-100 text-purple-800',
    HIRING: 'bg-yellow-100 text-yellow-800',
    AWARD: 'bg-pink-100 text-pink-800',
    OTHER: 'bg-slate-100 text-slate-800',
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">News & Updates</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="pb-4 border-b last:border-b-0 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-full mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">News & Updates</h2>
        <p className="text-slate-600">No news articles available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">News & Updates</h2>
      <div className="space-y-4">
        {news.map((article) => (
          <a
            key={article.id}
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pb-4 border-b last:border-b-0 block hover:bg-slate-50 -mx-6 -my-3 px-6 py-3 rounded-lg transition"
          >
            <div className="flex items-start gap-4">
              {article.image && (
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${categoryColors[article.category]}`}>
                    {article.category}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 line-clamp-2">{article.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 mt-1">{article.summary}</p>
                <p className="text-xs text-slate-500 mt-2">Source: {article.source}</p>
              </div>
              <div className="text-blue-600 flex-shrink-0">→</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
