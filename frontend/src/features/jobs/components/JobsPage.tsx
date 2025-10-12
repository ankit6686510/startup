'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  SearchIcon,
  FilterIcon,
  XIcon,
  MapPinIcon,
  BriefcaseIcon,
  DollarSignIcon,
  ClockIcon,
  BuildingIcon,
  UsersIcon,
  TrendingUpIcon,
  StarIcon,
  BookmarkIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  HomeIcon,
  WifiIcon,
  CoffeeIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingGrid } from '@/components/ui/loading';
import { useUrlState } from '@/hooks/useUrlState';
import { useFavorites } from '@/stores/application';
import { cn } from '@/lib/utils';

interface JobsPageProps {
  searchParams: {
    q?: string;
    type?: string;
    location?: string;
    remote?: string;
    salaryMin?: string;
    salaryMax?: string;
    experience?: string;
    company?: string;
    page?: string;
  };
}

interface JobFilters {
  q: string;
  type: string;
  location: string;
  remote: string;
  salaryMin: string;
  salaryMax: string;
  experience: string;
  company: string;
  page: number;
}

interface Job {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    logo: string;
    size: string;
    industry: string;
    stage: string;
    verified: boolean;
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  workType: 'remote' | 'hybrid' | 'onsite';
  salaryRange: {
    min: number;
    max: number;
    currency: string;
    equity?: boolean;
  };
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  jobType: 'fulltime' | 'parttime' | 'contract' | 'internship';
  department: string;
  skills: string[];
  benefits: string[];
  postedDate: string;
  applicationDeadline?: string;
  applicationCount: number;
  featured: boolean;
  urgent: boolean;
  applyUrl: string;
}

interface AppliedJob {
  jobId: string;
  appliedDate: string;
  status: 'applied' | 'reviewing' | 'interviewed' | 'offered' | 'rejected';
}

const defaultFilters: JobFilters = {
  q: '',
  type: 'all',
  location: '',
  remote: 'all',
  salaryMin: '',
  salaryMax: '',
  experience: 'all',
  company: '',
  page: 1,
};

export function JobsPage({ searchParams }: JobsPageProps) {
  const [searchInput, setSearchInput] = useState(searchParams.q || '');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const { urlState: filters, setUrlState: setFilters } = useUrlState<JobFilters>(defaultFilters);
  const favorites = useFavorites();

  // Mock jobs data
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Senior Frontend Engineer',
      company: {
        id: '1',
        name: 'NeuralFlow AI',
        logo: 'https://ui-avatars.com/api/?name=NeuralFlow+AI&background=6366f1&color=fff&size=128',
        size: '50-200',
        industry: 'AI & Machine Learning',
        stage: 'Series A',
        verified: true
      },
      description: 'Join our frontend team to build beautiful, responsive user interfaces for our AI platform. You\'ll work with React, TypeScript, and modern web technologies to create intuitive experiences for data scientists and business users.',
      requirements: [
        '5+ years of React development experience',
        'Expert knowledge of TypeScript and modern JavaScript',
        'Experience with state management (Redux, Zustand)',
        'Strong CSS skills and design system experience',
        'API integration and data visualization experience'
      ],
      responsibilities: [
        'Build and maintain responsive web applications',
        'Collaborate with designers to implement pixel-perfect UIs',
        'Optimize applications for performance and accessibility',
        'Mentor junior developers and conduct code reviews',
        'Work closely with backend teams on API design'
      ],
      location: 'San Francisco, CA',
      workType: 'hybrid',
      salaryRange: {
        min: 140000,
        max: 180000,
        currency: 'USD',
        equity: true
      },
      experienceLevel: 'senior',
      jobType: 'fulltime',
      department: 'Engineering',
      skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'Node.js'],
      benefits: ['Health Insurance', 'Stock Options', 'Flexible PTO', 'Learning Budget'],
      postedDate: '2024-01-15',
      applicationCount: 45,
      featured: true,
      urgent: false,
      applyUrl: 'https://jobs.neuralflow.ai/senior-frontend-engineer'
    },
    {
      id: '2',
      title: 'Product Manager',
      company: {
        id: '2',
        name: 'GreenTech Solutions',
        logo: 'https://ui-avatars.com/api/?name=GreenTech&background=10b981&color=fff&size=128',
        size: '10-50',
        industry: 'CleanTech',
        stage: 'Seed',
        verified: true
      },
      description: 'Lead product strategy for our sustainable energy platform. Drive product roadmap, work with engineering and design teams, and help shape the future of clean energy technology.',
      requirements: [
        '3+ years of product management experience',
        'Experience with B2B SaaS products',
        'Strong analytical and data-driven mindset',
        'Excellent communication and leadership skills',
        'Interest in sustainability and clean energy'
      ],
      responsibilities: [
        'Define and execute product roadmap',
        'Conduct user research and market analysis',
        'Work with engineering teams on feature development',
        'Analyze product metrics and user feedback',
        'Coordinate with sales and marketing teams'
      ],
      location: 'Austin, TX',
      workType: 'remote',
      salaryRange: {
        min: 120000,
        max: 150000,
        currency: 'USD',
        equity: true
      },
      experienceLevel: 'mid',
      jobType: 'fulltime',
      department: 'Product',
      skills: ['Product Strategy', 'Analytics', 'User Research', 'Agile', 'SQL'],
      benefits: ['Health Insurance', 'Stock Options', 'Remote Work', 'Conference Budget'],
      postedDate: '2024-01-12',
      applicationCount: 32,
      featured: false,
      urgent: true,
      applyUrl: 'https://jobs.greentech.com/product-manager'
    },
    // Add more mock jobs...
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `job-${i + 3}`,
      title: `${['Backend Engineer', 'Data Scientist', 'Marketing Manager', 'Sales Rep', 'DevOps Engineer'][i % 5]}`,
      company: {
        id: `company-${i + 3}`,
        name: `Startup ${i + 3}`,
        logo: `https://ui-avatars.com/api/?name=Startup+${i + 3}&background=${['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6'][i % 5]}&color=fff&size=128`,
        size: ['1-10', '10-50', '50-200', '200+'][i % 4],
        industry: ['Tech', 'Fintech', 'HealthTech', 'EdTech', 'CleanTech'][i % 5],
        stage: ['Seed', 'Series A', 'Series B', 'Series C'][i % 4],
        verified: i % 3 === 0
      },
      description: `Join our ${['innovative', 'fast-growing', 'mission-driven', 'cutting-edge'][i % 4]} team to build the future of technology.`,
      requirements: ['3+ years experience', 'Strong technical skills', 'Team player'],
      responsibilities: ['Build features', 'Collaborate with team', 'Improve processes'],
      location: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA'][i % 4],
      workType: ['remote', 'hybrid', 'onsite'][i % 3] as 'remote' | 'hybrid' | 'onsite',
      salaryRange: {
        min: 80000 + i * 5000,
        max: 120000 + i * 5000,
        currency: 'USD',
        equity: true
      },
      experienceLevel: ['entry', 'mid', 'senior'][i % 3] as 'entry' | 'mid' | 'senior',
      jobType: 'fulltime' as const,
      department: ['Engineering', 'Product', 'Design', 'Marketing', 'Sales'][i % 5],
      skills: ['React', 'Python', 'JavaScript', 'SQL', 'AWS'],
      benefits: ['Health Insurance', 'Stock Options', 'PTO'],
      postedDate: '2024-01-08',
      applicationCount: 15 + i,
      featured: i % 5 === 0,
      urgent: i % 7 === 0,
      applyUrl: `https://jobs.startup${i + 3}.com/apply`
    }))
  ];

  // Filter jobs based on current filters
  const filteredJobs = useMemo(() => {
    let filtered = mockJobs;

    if (filters.q) {
      const query = filters.q.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.company.name.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(job => job.department.toLowerCase() === filters.type.toLowerCase());
    }

    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.remote && filters.remote !== 'all') {
      filtered = filtered.filter(job => job.workType === filters.remote);
    }

    if (filters.experience && filters.experience !== 'all') {
      filtered = filtered.filter(job => job.experienceLevel === filters.experience);
    }

    if (filters.salaryMin) {
      const minSalary = parseInt(filters.salaryMin);
      filtered = filtered.filter(job => job.salaryRange.min >= minSalary);
    }

    if (filters.salaryMax) {
      const maxSalary = parseInt(filters.salaryMax);
      filtered = filtered.filter(job => job.salaryRange.max <= maxSalary);
    }

    // Sort: featured first, then by posted date
    return filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    });
  }, [filters, mockJobs]);

  const handleSearch = (query: string) => {
    setLoading(true);
    setFilters({ ...filters, q: query, page: 1 });
    
    // Simulate API call
    setTimeout(() => {
      setJobs(filteredJobs);
      setLoading(false);
    }, 500);
  };

  const handleApply = (jobId: string) => {
    const existingApplication = appliedJobs.find(app => app.jobId === jobId);
    if (existingApplication) return;

    const newApplication: AppliedJob = {
      jobId,
      appliedDate: new Date().toISOString(),
      status: 'applied'
    };

    setAppliedJobs(prev => [...prev, newApplication]);
  };

  const isJobApplied = (jobId: string) => {
    return appliedJobs.some(app => app.jobId === jobId);
  };

  const getJobApplicationStatus = (jobId: string) => {
    const application = appliedJobs.find(app => app.jobId === jobId);
    return application?.status || null;
  };

  // Initialize with URL params
  useEffect(() => {
    if (searchParams.q) {
      setSearchInput(searchParams.q);
      handleSearch(searchParams.q);
    } else {
      setJobs(filteredJobs);
    }
  }, []);

  useEffect(() => {
    setJobs(filteredJobs);
  }, [filteredJobs]);

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => 
    key !== 'page' && value !== '' && value !== 'all' && value !== 1
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Find Your Dream Job at Top Startups
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover opportunities at innovative companies. From seed stage to unicorns.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchInput);
                    }
                  }}
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => handleSearch(searchInput)}
                  className="px-8 py-4 text-lg"
                >
                  Search Jobs
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative px-6 py-4"
                >
                  <FilterIcon className="h-5 w-5 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={cn(
            'w-80 space-y-6 transition-all duration-300',
            showFilters ? 'block' : 'hidden lg:block'
          )}>
            <JobFilters filters={filters} setFilters={setFilters} />
            <JobStats jobCount={filteredJobs.length} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filters.q ? `Jobs for "${filters.q}"` : 'All Jobs'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredJobs.length} jobs found
                </p>
              </div>
              
              <SortDropdown />
            </div>

            {/* Job Listings */}
            {loading ? (
              <LoadingGrid count={10} />
            ) : filteredJobs.length === 0 ? (
              <EmptyJobsState filters={filters} />
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    isApplied={isJobApplied(job.id)}
                    applicationStatus={getJobApplicationStatus(job.id)}
                    onApply={() => handleApply(job.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Job Filters Component
function JobFilters({ 
  filters, 
  setFilters 
}: { 
  filters: JobFilters; 
  setFilters: (filters: JobFilters) => void; 
}) {
  const jobTypes = [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'product', label: 'Product' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
  ];

  const workTypes = [
    { value: 'all', label: 'All Work Types', icon: <BriefcaseIcon className="h-4 w-4" /> },
    { value: 'remote', label: 'Remote', icon: <WifiIcon className="h-4 w-4" /> },
    { value: 'hybrid', label: 'Hybrid', icon: <CoffeeIcon className="h-4 w-4" /> },
    { value: 'onsite', label: 'On-site', icon: <HomeIcon className="h-4 w-4" /> },
  ];

  const experienceLevels = [
    { value: 'all', label: 'All Experience Levels' },
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior Level (6+ years)' },
    { value: 'lead', label: 'Lead Level (8+ years)' },
    { value: 'executive', label: 'Executive Level' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Job Type
        </h3>
        <div className="space-y-2">
          {jobTypes.map((type) => (
            <label key={type.value} className="flex items-center">
              <input
                type="radio"
                name="jobType"
                value={type.value}
                checked={filters.type === type.value}
                onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                className="mr-3"
              />
              <span className="text-gray-700 dark:text-gray-300">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Work Type
        </h3>
        <div className="space-y-2">
          {workTypes.map((type) => (
            <label key={type.value} className="flex items-center">
              <input
                type="radio"
                name="workType"
                value={type.value}
                checked={filters.remote === type.value}
                onChange={(e) => setFilters({ ...filters, remote: e.target.value, page: 1 })}
                className="mr-3"
              />
              <div className="flex items-center">
                {type.icon}
                <span className="ml-2 text-gray-700 dark:text-gray-300">{type.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Experience Level
        </h3>
        <div className="space-y-2">
          {experienceLevels.map((level) => (
            <label key={level.value} className="flex items-center">
              <input
                type="radio"
                name="experience"
                value={level.value}
                checked={filters.experience === level.value}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value, page: 1 })}
                className="mr-3"
              />
              <span className="text-gray-700 dark:text-gray-300">{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Salary Range
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Salary
            </label>
            <input
              type="number"
              placeholder="e.g. 80000"
              value={filters.salaryMin}
              onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum Salary
            </label>
            <input
              type="number"
              placeholder="e.g. 150000"
              value={filters.salaryMax}
              onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Location
        </h3>
        <input
          type="text"
          placeholder="City, State, or Country"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value, page: 1 })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
    </div>
  );
}

// Job Stats Component
function JobStats({ jobCount }: { jobCount: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Job Market Stats
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Total Jobs</span>
          <span className="font-bold text-gray-900 dark:text-white">{jobCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Remote Jobs</span>
          <span className="font-bold text-gray-900 dark:text-white">45%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">New This Week</span>
          <span className="font-bold text-gray-900 dark:text-white">24</span>
        </div>
      </div>
    </div>
  );
}

// Sort Dropdown Component
function SortDropdown() {
  return (
    <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
      <option value="relevance">Most Relevant</option>
      <option value="date">Most Recent</option>
      <option value="salary">Highest Salary</option>
      <option value="company">Company Name</option>
    </select>
  );
}

// Empty Jobs State Component
function EmptyJobsState({ filters }: { filters: JobFilters }) {
  return (
    <div className="text-center py-16">
      <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        No jobs found
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Try adjusting your search criteria or browse all available positions.
      </p>
      <Button variant="outline">
        Clear All Filters
      </Button>
    </div>
  );
}

// Job Card Component
function JobCard({ 
  job, 
  isApplied, 
  applicationStatus, 
  onApply 
}: { 
  job: Job; 
  isApplied: boolean; 
  applicationStatus: string | null;
  onApply: () => void; 
}) {
  const getWorkTypeIcon = (workType: string) => {
    switch (workType) {
      case 'remote': return <WifiIcon className="h-4 w-4" />;
      case 'hybrid': return <CoffeeIcon className="h-4 w-4" />;
      case 'onsite': return <HomeIcon className="h-4 w-4" />;
      default: return <MapPinIcon className="h-4 w-4" />;
    }
  };

  const getWorkTypeColor = (workType: string) => {
    switch (workType) {
      case 'remote': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'hybrid': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'onsite': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}k`;
      }
      return num.toString();
    };
    
    return `${currency === 'USD' ? '$' : ''}${formatNumber(min)}-${formatNumber(max)}${currency !== 'USD' ? ` ${currency}` : ''}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1">
          <img
            src={job.company.logo}
            alt={`${job.company.name} logo`}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                {job.title}
              </h3>
              {job.featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                  <StarIcon className="h-3 w-3 mr-1" />
                  Featured
                </span>
              )}
              {job.urgent && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                  Urgent
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <p className="text-blue-600 dark:text-blue-400 font-medium">
                {job.company.name}
              </p>
              {job.company.verified && (
                <StarIcon className="h-4 w-4 text-blue-500 fill-current" />
              )}
              <span className="text-gray-500 dark:text-gray-400">•</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {job.company.stage}
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {job.description}
            </p>
            
            {/* Job Details */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {job.location}
              </div>
              
              <div className="flex items-center">
                {getWorkTypeIcon(job.workType)}
                <span className={cn('ml-1 px-2 py-1 rounded-full text-xs font-medium', getWorkTypeColor(job.workType))}>
                  {job.workType.charAt(0).toUpperCase() + job.workType.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center">
                <DollarSignIcon className="h-4 w-4 mr-1" />
                {formatSalary(job.salaryRange.min, job.salaryRange.max, job.salaryRange.currency)}
                {job.salaryRange.equity && <span className="ml-1">+ equity</span>}
              </div>
              
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {formatDate(job.postedDate)}
              </div>
            </div>
            
            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  +{job.skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col items-end space-y-3 ml-6">
          {isApplied ? (
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Applied
              </span>
            </div>
          ) : (
            <Button
              onClick={onApply}
              className="px-6 py-2"
            >
              Apply Now
            </Button>
          )}
          
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <UsersIcon className="h-4 w-4" />
            <span>{job.applicationCount} applicants</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <BookmarkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Application Status */}
      {applicationStatus && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Application Status:
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(job.applyUrl, '_blank')}
            >
              <ExternalLinkIcon className="h-4 w-4 mr-2" />
              View Application
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
