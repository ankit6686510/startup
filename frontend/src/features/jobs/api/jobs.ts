import { ApiResponse, PaginatedResponse, ApiError } from '@/lib/api';

// Types
export interface JobFilters {
  q?: string; // Search query
  company?: string;
  industry?: string;
  department?: string;
  location?: string;
  workType?: 'remote' | 'hybrid' | 'onsite' | 'all';
  jobType?: 'fulltime' | 'parttime' | 'contract' | 'internship' | 'all';
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive' | 'all';
  salaryMin?: number;
  salaryMax?: number;
  equity?: boolean;
  benefits?: string[];
  skills?: string[];
  featured?: boolean;
  urgent?: boolean;
  datePosted?: 'today' | 'week' | 'month' | 'all';
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'salary' | 'company' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  
  // Company Information
  company: {
    id: string;
    name: string;
    slug: string;
    logo: string;
    size: string;
    industry: string;
    stage: string;
    verified: boolean;
    website?: string;
  };
  
  // Job Details
  department: string;
  location: string;
  workType: 'remote' | 'hybrid' | 'onsite';
  jobType: 'fulltime' | 'parttime' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  
  // Salary & Benefits
  salaryRange: {
    min: number;
    max: number;
    currency: string;
    equity?: boolean;
    disclosed: boolean;
  };
  benefits: string[];
  
  // Requirements & Skills
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  niceToHave?: string[];
  
  // Application Details
  applicationCount: number;
  applicationDeadline?: string;
  applyUrl: string;
  applicationProcess: string[];
  
  // Meta Information
  featured: boolean;
  urgent: boolean;
  postedDate: string;
  updatedDate: string;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
}

export interface JobDetail extends Omit<Job, 'requirements'> {
  // Extended information
  longDescription: string;
  
  // Company Extended Info
  company: Job['company'] & {
    description: string;
    employees: string;
    headquarters: string;
    founded: number;
    funding?: {
      stage: string;
      amount: string;
      lastRound?: string;
    };
    culture: string[];
    perks: string[];
    socialLinks: {
      website?: string;
      linkedin?: string;
      twitter?: string;
      github?: string;
    };
  };
  
  // Detailed Requirements
  requirements: Array<{
    type: 'required' | 'preferred';
    category: 'education' | 'experience' | 'skills' | 'other';
    description: string;
  }>;
  
  // Interview Process
  interviewProcess: Array<{
    step: number;
    title: string;
    description: string;
    duration?: string;
    type: 'phone' | 'video' | 'onsite' | 'technical' | 'presentation';
  }>;
  
  // Team Information
  team: {
    size: number;
    description: string;
    structure: string;
    reportingManager?: {
      name: string;
      title: string;
      avatar?: string;
    };
  };
  
  // Growth & Development
  growth: {
    careerPath: string[];
    learningOpportunities: string[];
    mentorship: boolean;
    conferences: boolean;
  };
  
  // Similar Jobs
  similarJobs: Job[];
  
  // Application Analytics
  analytics: {
    views: number;
    applications: number;
    responseRate: string;
    averageResponseTime: string;
  };
}

export interface JobApplication {
  id: string;
  jobId: string;
  job: {
    title: string;
    company: string;
    logo: string;
  };
  appliedDate: string;
  status: 'applied' | 'reviewing' | 'phone_screen' | 'interviewed' | 'offered' | 'rejected' | 'withdrawn';
  statusUpdatedDate: string;
  notes?: string;
  
  // Application Details
  applicationData: {
    resumeUrl?: string;
    coverLetter?: string;
    portfolio?: string;
    answers?: Record<string, string>; // Question ID to answer mapping
  };
  
  // Communication History
  communications: Array<{
    id: string;
    type: 'email' | 'call' | 'interview' | 'offer' | 'rejection';
    date: string;
    subject?: string;
    content?: string;
    fromCompany: boolean;
  }>;
  
  // Next Steps
  nextSteps?: {
    action: string;
    dueDate?: string;
    description?: string;
  };
}

export interface JobStats {
  totalJobs: number;
  activeJobs: number;
  newJobsThisWeek: number;
  averageSalary: string;
  topCompanies: Array<{
    name: string;
    jobCount: number;
    logo: string;
  }>;
  topLocations: Record<string, number>;
  topSkills: Record<string, number>;
  workTypeDistribution: Record<string, number>;
  experienceLevelDistribution: Record<string, number>;
  salaryRanges: Record<string, number>;
}

// API Service Class
export class JobsApi {
  private baseUrl = '/api/jobs';

  // Get paginated list of jobs
  async getJobs(filters: JobFilters = {}): Promise<PaginatedResponse<Job>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch jobs: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching jobs', 500);
    }
  }

  // Get job by ID or slug
  async getJob(identifier: string): Promise<ApiResponse<JobDetail>> {
    try {
      const response = await fetch(`${this.baseUrl}/${identifier}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new ApiError('Job not found', 404);
        }
        throw new ApiError(`Failed to fetch job: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching job details', 500);
    }
  }

  // Get featured jobs
  async getFeaturedJobs(): Promise<ApiResponse<Job[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/featured`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch featured jobs: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching featured jobs', 500);
    }
  }

  // Get urgent jobs
  async getUrgentJobs(): Promise<ApiResponse<Job[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/urgent`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch urgent jobs: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching urgent jobs', 500);
    }
  }

  // Get jobs by company
  async getJobsByCompany(companyId: string, filters: JobFilters = {}): Promise<PaginatedResponse<Job>> {
    const companyFilters = { ...filters, company: companyId };
    return this.getJobs(companyFilters);
  }

  // Search jobs
  async searchJobs(query: string, filters: JobFilters = {}): Promise<PaginatedResponse<Job>> {
    const searchFilters = { ...filters, q: query };
    return this.getJobs(searchFilters);
  }

  // Get similar jobs
  async getSimilarJobs(jobId: string): Promise<ApiResponse<Job[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/${jobId}/similar`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch similar jobs: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching similar jobs', 500);
    }
  }

  // Get job statistics
  async getJobStats(): Promise<ApiResponse<JobStats>> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch job stats: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching job statistics', 500);
    }
  }

  // Apply to job
  async applyToJob(jobId: string, applicationData: {
    resumeUrl?: string;
    coverLetter?: string;
    portfolio?: string;
    answers?: Record<string, string>;
  }): Promise<ApiResponse<{ applicationId: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to apply to job: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while applying to job', 500);
    }
  }

  // Get user's job applications
  async getMyApplications(): Promise<PaginatedResponse<JobApplication>> {
    try {
      const response = await fetch(`${this.baseUrl}/applications/me`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch applications: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching applications', 500);
    }
  }

  // Get specific application
  async getApplication(applicationId: string): Promise<ApiResponse<JobApplication>> {
    try {
      const response = await fetch(`${this.baseUrl}/applications/${applicationId}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch application: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching application', 500);
    }
  }

  // Withdraw application
  async withdrawApplication(applicationId: string): Promise<ApiResponse<{ withdrawn: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/applications/${applicationId}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to withdraw application: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while withdrawing application', 500);
    }
  }

  // Save/Unsave job
  async saveJob(jobId: string): Promise<ApiResponse<{ saved: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${jobId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to save job: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while saving job', 500);
    }
  }

  async unsaveJob(jobId: string): Promise<ApiResponse<{ saved: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${jobId}/save`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to unsave job: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while unsaving job', 500);
    }
  }

  // Get saved jobs
  async getSavedJobs(): Promise<PaginatedResponse<Job>> {
    try {
      const response = await fetch(`${this.baseUrl}/saved`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch saved jobs: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching saved jobs', 500);
    }
  }

  // Get job alerts/recommendations
  async getJobRecommendations(): Promise<ApiResponse<Job[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/recommendations`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch job recommendations: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching job recommendations', 500);
    }
  }

  // Set up job alert
  async createJobAlert(filters: JobFilters & { 
    name: string; 
    email?: string; 
    frequency: 'daily' | 'weekly' | 'immediate'; 
  }): Promise<ApiResponse<{ alertId: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to create job alert: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while creating job alert', 500);
    }
  }

  // Get available filter options
  async getFilterOptions(): Promise<ApiResponse<{
    industries: string[];
    departments: string[];
    locations: string[];
    companies: Array<{ id: string; name: string; logo: string }>;
    skills: string[];
    benefits: string[];
    workTypes: string[];
    jobTypes: string[];
    experienceLevels: string[];
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/filters`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch filter options: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching filter options', 500);
    }
  }

  // Report job
  async reportJob(jobId: string, reason: string, description?: string): Promise<ApiResponse<{ reported: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${jobId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, description }),
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to report job: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while reporting job', 500);
    }
  }

  // Get job application questions
  async getJobQuestions(jobId: string): Promise<ApiResponse<Array<{
    id: string;
    question: string;
    type: 'text' | 'textarea' | 'select' | 'multiselect' | 'file';
    required: boolean;
    options?: string[];
  }>>> {
    try {
      const response = await fetch(`${this.baseUrl}/${jobId}/questions`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch job questions: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching job questions', 500);
    }
  }
}

// Export singleton instance
export const jobsApi = new JobsApi();

// Export default
export default jobsApi;
