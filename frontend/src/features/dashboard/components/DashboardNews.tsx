'use client';

import Link from 'next/link';
import { DashboardNews } from '../types';

interface DashboardNewsProps {
  news: DashboardNews[];
  isLoading?: boolean;
}

const NewsCard = ({ article }: { article: DashboardNews }) => {
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer">
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden h-full flex flex-col">
        {article.imageUrl && (
          <div className="w-full h-40 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover hover:scale-105 transition"
            />
          </div>
        )}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
              {article.category}
            </span>
            <span className="text-xs text-slate-500 flex-shrink-0">
              {new Date(article.publishedAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="font-bold text-slate-900 line-clamp-2 mb-2">{article.title}</h3>
          <p className="text-sm text-slate-600 line-clamp-2 mb-3 flex-1">{article.summary}</p>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="font-medium">{article.source}</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </a>
  );
};

const NewsCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="w-full h-40 bg-slate-200 animate-pulse"></div>
    <div className="p-4">
      <div className="h-3 bg-slate-200 rounded w-1/4 mb-2 animate-pulse"></div>
      <div className="h-4 bg-slate-200 rounded w-full mb-2 animate-pulse"></div>
      <div className="h-3 bg-slate-200 rounded w-full animate-pulse"></div>
    </div>
  </div>
);

export function DashboardNewsSection({ news, isLoading = false }: DashboardNewsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Latest News</h2>
        <Link href="/startups">
          <p className="text-sm text-blue-600 hover:text-blue-500 font-medium">See All</p>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NewsCardSkeleton />
          <NewsCardSkeleton />
          <NewsCardSkeleton />
        </div>
      ) : news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-600">No news available</p>
        </div>
      )}
    </div>
  );
}
