'use client';

import { useState } from 'react';
import { 
  ShareIcon, 
  HeartIcon, 
  ExternalLinkIcon,
  TwitterIcon,
  LinkedinIcon,
  LinkIcon,
  CheckIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ShareBookmarkProps {
  startup: {
    id: string;
    name: string;
    website: string;
    tagline: string;
  };
  isFavorited: boolean;
}

export function ShareBookmark({ startup, isFavorited }: ShareBookmarkProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFavoriteClick = () => {
    // This will be implemented when we connect to the store
    console.log('Toggle favorite:', startup.id);
  };

  const handleWebsiteClick = () => {
    window.open(startup.website, '_blank');
  };

  const shareUrl = `${window.location.origin}/startups/${startup.id}`;
  const shareText = `Check out ${startup.name} - ${startup.tagline}`;

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    let shareLink = '';
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        return;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Visit Website */}
      <Button
        variant="outline"
        onClick={handleWebsiteClick}
        className="flex items-center"
      >
        <ExternalLinkIcon className="h-4 w-4 mr-2" />
        Visit Website
      </Button>

      {/* Favorite Button */}
      <Button
        variant={isFavorited ? "default" : "outline"}
        onClick={handleFavoriteClick}
        className={cn(
          'flex items-center',
          isFavorited && 'bg-red-600 hover:bg-red-700 text-white'
        )}
      >
        <HeartIcon className={cn('h-4 w-4 mr-2', isFavorited && 'fill-current')} />
        {isFavorited ? 'Favorited' : 'Add to Favorites'}
      </Button>

      {/* Share Button */}
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex items-center"
        >
          <ShareIcon className="h-4 w-4 mr-2" />
          Share
        </Button>

        {/* Share Menu */}
        {showShareMenu && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowShareMenu(false)}
            />
            
            {/* Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
              <div className="py-2">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <TwitterIcon className="h-4 w-4 mr-3 text-blue-400" />
                  Share on Twitter
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LinkedinIcon className="h-4 w-4 mr-3 text-blue-600" />
                  Share on LinkedIn
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-4 w-4 mr-3 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-3" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
