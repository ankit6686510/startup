'use client';

import { useRouter } from 'next/navigation';
import { authAPI } from '@/features/auth/api';
import { Button } from '@/components/ui/button';

interface OAuthButtonsProps {
  isRegister?: boolean;
}

export function OAuthButtons({ isRegister = false }: OAuthButtonsProps) {
  const router = useRouter();

  const handleOAuthClick = async (provider: 'github' | 'google' | 'linkedin') => {
    try {
      const { url } = await authAPI.getOAuthUrl(provider);
      window.location.href = url;
    } catch (error) {
      console.error(`OAuth redirect failed for ${provider}:`, error);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={() => handleOAuthClick('github')}
        className="w-full relative h-11"
      >
        <svg className="absolute left-4 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.19.092-.926.35-1.556.636-1.913-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.578 9.578 0 0110 4.812c.852.004 1.71.114 2.513.334 1.9-1.294 2.747-1.025 2.747-1.025.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C17.137 18.194 20 14.44 20 10.017 20 4.484 15.522 0 10 0z" clipRule="evenodd" />
        </svg>
        Continue with GitHub
      </Button>

      <Button
        variant="outline"
        onClick={() => handleOAuthClick('google')}
        className="w-full relative h-11"
      >
        <svg className="absolute left-4 h-5 w-5" viewBox="0 0 24 24">
          <image href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E" width="20" height="20" />
        </svg>
        Continue with Google
      </Button>

      <Button
        variant="outline"
        onClick={() => handleOAuthClick('linkedin')}
        className="w-full relative h-11"
      >
        <svg className="absolute left-4 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.292-1.194-2.292-1.195 0-1.38.932-1.38 1.893v4.038h-2.57V9h2.469v.979h.037c.345-.654 1.191-1.344 2.454-1.344 2.623 0 3.11 1.728 3.11 3.979v4.724zM5.337 7.433c-.588 0-1.063-.483-1.063-1.079 0-.595.475-1.079 1.063-1.079.583 0 1.062.484 1.062 1.079 0 .596-.479 1.079-1.062 1.079zm.945 8.905H3.692v-7.346h2.59v7.346zM17.7 4.5c0 .973-.784 1.757-1.76 1.757-.975 0-1.76-.784-1.76-1.757s.785-1.757 1.76-1.757 1.76.784 1.76 1.757z" clipRule="evenodd" />
        </svg>
        Continue with LinkedIn
      </Button>
    </div>
  );
}
