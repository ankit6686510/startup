'use client';

import { 
  NewspaperIcon,
  ExternalLinkIcon,
  CalendarIcon,
  ClockIcon,
  TrendingUpIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedDate: string;
  imageUrl?: string;
}

interface NewsUpdatesProps {
  news: NewsItem[];
}

export function NewsUpdates({ news }: NewsUpdatesProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - published.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getSourceColor = (source: string) => {
    const colors = {
      'TechCrunch': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'Forbes': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'VentureBeat': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'Wired': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'The Verge': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
    };
    return colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  // Sort news by date (most recent first)
  const sortedNews = [...news].sort((a, b) => 
    new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );

  const featuredNews = sortedNews[0];
  const otherNews = sortedNews.slice(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Latest News & Updates
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Stay updated with the latest news about this startup
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => window.open('/news', '_blank')}
          >
            <NewspaperIcon className="h-4 w-4 mr-2" />
            View All News
          </Button>
        </div>

        {/* News Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {news.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Articles
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              {new Set(news.map(item => item.source)).size}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              News Sources
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {getTimeAgo(sortedNews[0]?.publishedDate || '')}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Latest Update
            </div>
          </div>
        </div>
      </div>

      {/* Featured News */}
      {featuredNews && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUpIcon className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Featured Story
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {featuredNews.imageUrl && (
              <div className="lg:w-1/3">
                <img
                  src={featuredNews.imageUrl}
                  alt={featuredNews.title}
                  className="w-full h-48 lg:h-full object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className={featuredNews.imageUrl ? 'lg:w-2/3' : 'w-full'}>
              <div className="flex items-center space-x-3 mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSourceColor(featuredNews.source)}`}>
                  {featuredNews.source}
                </span>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {formatDate(featuredNews.publishedDate)}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {featuredNews.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                {featuredNews.summary}
              </p>

              <Button 
                onClick={() => window.open(featuredNews.url, '_blank')}
                className="inline-flex items-center"
              >
                Read Full Article
                <ExternalLinkIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Other News */}
      {otherNews.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            More News
          </h3>
          
          <div className="space-y-6">
            {otherNews.map((item) => (
              <article 
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => window.open(item.url, '_blank')}
              >
                {item.imageUrl && (
                  <div className="sm:w-32 sm:h-24 flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-32 sm:h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(item.source)}`}>
                      {item.source}
                    </span>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {getTimeAgo(item.publishedDate)}
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {item.title}
                  </h4>

                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                    {item.summary}
                  </p>
                </div>

                <div className="flex-shrink-0 self-start">
                  <ExternalLinkIcon className="h-5 w-5 text-gray-400" />
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* News Sources */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          News Sources
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from(new Set(news.map(item => item.source))).map((source) => {
            const sourceNews = news.filter(item => item.source === source);
            return (
              <div key={source} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img
                  src={`https://ui-avatars.com/api/?name=${source}&background=6366f1&color=fff&size=40`}
                  alt={source}
                  className="w-10 h-10 rounded-lg mx-auto mb-3"
                />
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  {source}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {sourceNews.length} article{sourceNews.length !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {news.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          <NewspaperIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No news articles found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            We'll update this section as soon as news about this startup becomes available.
          </p>
        </div>
      )}
    </div>
  );
}
