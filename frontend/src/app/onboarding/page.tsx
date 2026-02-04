'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks';
import { OnboardingStep1 } from './components/OnboardingStep1';
import { OnboardingStep2 } from './components/OnboardingStep2';
import { OnboardingStep3 } from './components/OnboardingStep3';
import { Loading } from '@/components/ui/loading';
import { UserPreferences } from '@/features/auth/types';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    jobCategories: [],
    industries: [],
    locations: [],
    emailNotifications: true,
    pushNotifications: true
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
    if (user?.onboardingCompleted) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!user) {
    return <Loading />;
  }

  const handleNext = (newPreferences?: Partial<UserPreferences>) => {
    if (newPreferences) {
      setPreferences(prev => ({ ...prev, ...newPreferences }));
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleComplete = async () => {
    try {
      // Call API to update preferences and mark onboarding as complete
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-300 text-slate-600'
                }`}>
                  {step}
                </div>
              </div>
            ))}
          </div>
          <div className="w-full bg-slate-300 h-1 rounded-full">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Steps */}
        {currentStep === 1 && (
          <OnboardingStep1 user={user} onNext={handleNext} />
        )}
        {currentStep === 2 && (
          <OnboardingStep2 
            preferences={preferences} 
            onNext={handleNext} 
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && (
          <OnboardingStep3
            preferences={preferences}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
