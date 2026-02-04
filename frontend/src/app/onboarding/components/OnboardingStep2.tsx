'use client';

import { useState } from 'react';
import { UserPreferences } from '@/features/auth/types';

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 'SaaS',
  'AI/ML', 'Blockchain', 'Renewable Energy', 'Education', 'Real Estate'
];

const JOB_CATEGORIES = [
  'Engineering', 'Product Management', 'Design', 'Sales', 'Marketing',
  'Operations', 'Finance', 'HR', 'Customer Success', 'Data Science'
];

const LOCATIONS = [
  'San Francisco', 'New York', 'Los Angeles', 'Boston', 'Austin',
  'Seattle', 'Toronto', 'London', 'Berlin', 'Singapore'
];

interface OnboardingStep2Props {
  preferences: UserPreferences;
  onNext: (preferences: Partial<UserPreferences>) => void;
  onBack: () => void;
}

export function OnboardingStep2({ preferences, onNext, onBack }: OnboardingStep2Props) {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(preferences.industries);
  const [selectedJobs, setSelectedJobs] = useState<string[]>(preferences.jobCategories);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(preferences.locations);

  const toggleSelection = (
    item: string,
    selected: string[],
    setSeleced: (items: string[]) => void
  ) => {
    if (selected.includes(item)) {
      setSeleced(selected.filter(i => i !== item));
    } else {
      setSeleced([...selected, item]);
    }
  };

  const handleNext = () => {
    onNext({
      industries: selectedIndustries,
      jobCategories: selectedJobs,
      locations: selectedLocations
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tell us what interests you</h1>
        <p className="text-slate-600">Select at least 3 industries and locations to get started</p>
      </div>

      {/* Industries */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Industries of Interest</h3>
        <div className="grid grid-cols-2 gap-3">
          {INDUSTRIES.map((industry) => (
            <button
              key={industry}
              onClick={() => toggleSelection(industry, selectedIndustries, setSelectedIndustries)}
              className={`px-4 py-2 rounded-lg border-2 transition font-medium ${
                selectedIndustries.includes(industry)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-blue-300'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>

      {/* Job Categories */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Job Categories</h3>
        <div className="grid grid-cols-2 gap-3">
          {JOB_CATEGORIES.map((job) => (
            <button
              key={job}
              onClick={() => toggleSelection(job, selectedJobs, setSelectedJobs)}
              className={`px-4 py-2 rounded-lg border-2 transition font-medium ${
                selectedJobs.includes(job)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-blue-300'
              }`}
            >
              {job}
            </button>
          ))}
        </div>
      </div>

      {/* Locations */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Preferred Locations</h3>
        <div className="grid grid-cols-2 gap-3">
          {LOCATIONS.map((location) => (
            <button
              key={location}
              onClick={() => toggleSelection(location, selectedLocations, setSelectedLocations)}
              className={`px-4 py-2 rounded-lg border-2 transition font-medium ${
                selectedLocations.includes(location)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-blue-300'
              }`}
            >
              {location}
            </button>
          ))}
        </div>
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
          onClick={handleNext}
          disabled={selectedIndustries.length === 0 || selectedLocations.length === 0}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
