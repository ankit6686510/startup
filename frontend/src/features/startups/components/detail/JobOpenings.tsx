'use client';

import { 
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  DollarSignIcon,
  UsersIcon,
  ExternalLinkIcon,
  FilterIcon
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote: boolean;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  postedDate: string;
  description: string;
}

interface JobOpeningsProps {
  jobs: Job[];
  companyName: string;
}

export function JobOpenings({ jobs, companyName }: JobOpeningsProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const formatSalary = (salary: Job['salary']) => {
    if (!salary) return 'Competitive';
    const { min, max, currency } = salary;
    return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getJobTypeColor = (type: string) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'part-time': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'contract': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'internship': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  // Get unique departments
  const departments = ['all', ...Array.from(new Set(jobs.map(job => job.department)))];
  const jobTypes = ['all', 'full-time', 'part-time', 'contract', 'internship'];

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const departmentMatch = selectedDepartment === 'all' || job.department === selectedDepartment;
    const typeMatch = selectedType === 'all' || job.type === selectedType;
    return departmentMatch && typeMatch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Open Positions at {companyName}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {filteredJobs.length} open position{filteredJobs.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <Button 
            className="mt-4 sm:mt-0"
            onClick={() => window.open('/jobs', '_blank')}
          >
            <ExternalLinkIcon className="h-4 w-4 mr-2" />
            View All Jobs
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {jobTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No positions found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your filters to see more results.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div 
              key={job.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  {/* Job Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-1" />
                          {job.department}
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {job.location}
                          {job.remote && <span className="ml-1 text-green-600 dark:text-green-400">(Remote)</span>}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatDate(job.postedDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', getJobTypeColor(job.type))}>
                        {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
                      </span>
                      {job.remote && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          Remote
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="flex items-center mb-4">
                    <DollarSignIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatSalary(job.salary)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {job.description}
                  </p>
                </div>

                {/* Apply Button */}
                <div className="flex-shrink-0">
                  <Button 
                    className="w-full lg:w-auto"
                    onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Company Benefits */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Why Work at {companyName}?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BriefcaseIcon className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Competitive Benefits</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Health, dental, vision insurance plus equity packages
            </p>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Amazing Team</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Work with world-class engineers and designers
            </p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MapPinIcon className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Flexible Work</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Remote-first culture with flexible hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
