'use client';

import { 
  LinkedinIcon,
  TwitterIcon,
  MailIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Founder {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  linkedinUrl?: string;
  twitterUrl?: string;
}

interface FounderProfilesProps {
  founders: Founder[];
}

export function FounderProfiles({ founders }: FounderProfilesProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Meet the Founders
        </h2>
        
        <div className="space-y-8">
          {founders.map((founder, index) => (
            <div 
              key={founder.id}
              className={`flex flex-col lg:flex-row lg:items-start gap-6 ${index !== founders.length - 1 ? 'pb-8 border-b border-gray-200 dark:border-gray-700' : ''}`}
            >
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <img
                  src={founder.imageUrl}
                  alt={founder.name}
                  className="w-24 h-24 lg:w-32 lg:h-32 rounded-xl object-cover"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {founder.name}
                    </h3>
                    <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                      {founder.title}
                    </p>
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center space-x-3">
                    {founder.linkedinUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(founder.linkedinUrl, '_blank')}
                        className="flex items-center"
                      >
                        <LinkedinIcon className="h-4 w-4 mr-2 text-blue-600" />
                        LinkedIn
                      </Button>
                    )}
                    {founder.twitterUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(founder.twitterUrl, '_blank')}
                        className="flex items-center"
                      >
                        <TwitterIcon className="h-4 w-4 mr-2 text-blue-400" />
                        Twitter
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {founder.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Founder Stats/Highlights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Founder Highlights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {founders.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Co-founders
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              15+
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Years Combined Experience
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              2
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Previous Startups
            </div>
          </div>
        </div>
      </div>

      {/* Previous Experience */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Previous Experience
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <img
              src="https://ui-avatars.com/api/?name=Google&background=4285f4&color=fff&size=40"
              alt="Google"
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Google</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">VP of AI • Sarah Chen</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <img
              src="https://ui-avatars.com/api/?name=Netflix&background=e50914&color=fff&size=40"
              alt="Netflix"
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Netflix</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Principal Engineer • Marcus Rodriguez</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <img
              src="https://ui-avatars.com/api/?name=Stanford&background=8c1515&color=fff&size=40"
              alt="Stanford"
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Stanford University</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">PhD Computer Science • Sarah Chen</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <img
              src="https://ui-avatars.com/api/?name=MIT&background=750014&color=fff&size=40"
              alt="MIT"
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">MIT</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">MS Computer Science • Marcus Rodriguez</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
