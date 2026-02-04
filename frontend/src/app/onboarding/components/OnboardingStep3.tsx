'use client';

import { useState } from 'react';
import { UserPreferences } from '@/features/auth/types';

interface OnboardingStep3Props {
  preferences: UserPreferences;
  onBack: () => void;
  onComplete: () => void;
}

export function OnboardingStep3({ preferences, onBack, onComplete }: OnboardingStep3Props) {
  const [emailNotifications, setEmailNotifications] = useState(preferences.emailNotifications);
  const [pushNotifications, setPushNotifications] = useState(preferences.pushNotifications);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Update preferences before completing
      await onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Choose your preferences</h1>
        <p className="text-slate-600">Control how you receive updates and notifications</p>
      </div>

      {/* Your Interests Summary */}
      <div className="bg-blue-50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-slate-900">Your Interests</h3>
        
        {preferences.industries.length > 0 && (
          <div>
            <p className="text-sm text-slate-600 mb-2">Industries:</p>
            <div className="flex flex-wrap gap-2">
              {preferences.industries.map((industry) => (
                <span key={industry} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
                  {industry}
                </span>
              ))}
            </div>
          </div>
        )}

        {preferences.jobCategories.length > 0 && (
          <div>
            <p className="text-sm text-slate-600 mb-2">Job Categories:</p>
            <div className="flex flex-wrap gap-2">
              {preferences.jobCategories.map((job) => (
                <span key={job} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
                  {job}
                </span>
              ))}
            </div>
          </div>
        )}

        {preferences.locations.length > 0 && (
          <div>
            <p className="text-sm text-slate-600 mb-2">Locations:</p>
            <div className="flex flex-wrap gap-2">
              {preferences.locations.map((location) => (
                <span key={location} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
                  {location}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Notification Preferences</h3>

        <label className="flex items-center gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="w-5 h-5 accent-blue-600"
          />
          <div>
            <p className="font-medium text-slate-900">Email Notifications</p>
            <p className="text-sm text-slate-600">Receive emails about job opportunities and funding news</p>
          </div>
        </label>

        <label className="flex items-center gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={pushNotifications}
            onChange={(e) => setPushNotifications(e.target.checked)}
            className="w-5 h-5 accent-blue-600"
          />
          <div>
            <p className="font-medium text-slate-900">Push Notifications</p>
            <p className="text-sm text-slate-600">Get instant notifications on your device</p>
          </div>
        </label>
      </div>

      {/* Privacy Note */}
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-sm text-slate-600">
          We respect your privacy. Your data will be kept secure and you can change these settings anytime in your profile.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-6">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
        >
          ← Back
        </button>
        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {isLoading ? 'Finishing...' : 'Get Started! 🚀'}
        </button>
      </div>
    </div>
  );
}
