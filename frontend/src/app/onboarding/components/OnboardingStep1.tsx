'use client';

import { User } from '@/features/auth/types';

interface OnboardingStep1Props {
  user: User;
  onNext: () => void;
}

export function OnboardingStep1({ user, onNext }: OnboardingStep1Props) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome to StartupCompass, {user.firstName}! 👋</h1>
        <p className="text-slate-600">Let's set up your account in just a few steps</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900">Discover Amazing Startups</h3>
            <p className="mt-1 text-slate-600">Browse and explore thousands of innovative startups</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900">Find Your Next Opportunity</h3>
            <p className="mt-1 text-slate-600">Search job openings and track companies you're interested in</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900">Stay Updated</h3>
            <p className="mt-1 text-slate-600">Get real-time updates on funding rounds and industry news</p>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          onClick={onNext}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition text-lg"
        >
          Get Started →
        </button>
      </div>

      <p className="text-center text-xs text-slate-500">
        You can always update your preferences later in settings
      </p>
    </div>
  );
}
