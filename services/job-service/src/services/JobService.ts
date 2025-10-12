import { Repository, SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { Job } from '@/models/Job';
import { JobApplication, ApplicationStatus } from '@/models/JobApplication';
import { SavedJob } from '@/models/SavedJob';
import { JobAlert } from '@/models/JobAlert';
import { logger } from '@/utils/logger';
import { 
  JobType, 
  WorkLocation, 
  ExperienceLevel, 
  JobCategory 
} from '@startup-platform/types';

export interface JobFilters {
  search?: string;
  category?: JobCategory;
  type?: JobType;
  locationType?: WorkLocation;
  experienceLevel?: ExperienceLevel;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  startupIds?: string[];
  isRemote?: boolean;
  isFeatured?: boolean;
  postedSince?: Date;
}

export interface JobCreateData {
  startupId: string;
  postedBy: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  type: JobType;
  locationType: WorkLocation;
  experienceLevel: ExperienceLevel;
  category: JobCategory;
  locationCountry?: string;
  locationCountryCode?: string;
  locationCity?: string;
  locationState?: string;
  locationAddress?: string;
  isRemoteAllowed?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryEquityMin?: number;
  salaryEquityMax?: number;
  salaryIsDisclosed?: boolean;
  skills: string[];
  tags: string[];
  yearsExperienceMin?: number;
  yearsExperienceMax?: number;
  educationLevel?: string;
  howToApply?: string;
  externalUrl?: string;
  applicationEmail?: string;
  applicationDeadline?: Date;
  isFeatured?: boolean;
  isUrgent?: boolean;
  expiresAt?: Date;
  contactInfo?: any;
  metadata?: Record<string, any>;
}

export interface ApplicationCreateData {
  jobId: string;
  applicantId: string;
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  phoneNumber?: string;
  emailAddress: string;
  fullName: string;
  yearsOfExperience?: number;
  currentCompany?: string;
  currentTitle?: string;
  salaryExpectation?: number;
  noticePeriodDays?: number;
  availableStartDate?: Date;
  requiresVisaSponsorship?: boolean;
  willingToRelocate?: boolean;
  customResponses?: Record<string, any>;
  source?: string;
  referrerId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class JobService {
  private jobRepository: Repository<Job>;
  private applicationRepository: Repository<JobApplication>;
  private savedJobRepository: Repository<SavedJob>;
  private alertRepository: Repository<JobAlert>;

  constructor() {
    this.jobRepository = AppDataSource.getRepository(Job);
    this.applicationRepository = AppDataSource.getRepository(JobApplication);
    this.savedJobRepository = AppDataSource.getRepository(SavedJob);
    this.alertRepository = AppDataSource.getRepository(JobAlert);
  }

  async createJob(data: JobCreateData): Promise<Job> {
    // Generate slug from title
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (await this.jobRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const job = this.jobRepository.create({
      ...data,
      slug,
      expiresAt: data.expiresAt || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days default
    });

    const savedJob = await this.jobRepository.save(job);
    logger.info(`Job created: ${savedJob.id} - ${savedJob.title}`);
    
    return savedJob;
  }

  async updateJob(id: string, data: Partial<JobCreateData>, updatedBy: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    
    if (!job) {
      throw new Error('Job not found');
    }

    // Check permission (only job poster or admin can update)
    if (job.postedBy !== updatedBy) {
      throw new Error('Unauthorized to update this job');
    }

    Object.assign(job, data);
    
    const updatedJob = await this.jobRepository.save(job);
    logger.info(`Job updated: ${updatedJob.id} - ${updatedJob.title}`);
    
    return updatedJob;
  }

  async getJobById(id: string): Promise<Job | null> {
    return await this.jobRepository.findOne({
      where: { id },
    });
  }

  async getJobBySlug(slug: string): Promise<Job | null> {
    const job = await this.jobRepository.findOne({
      where: { slug },
    });

    if (job) {
      // Increment view count
      job.incrementViewCount();
      await this.jobRepository.save(job);
    }

    return job;
  }

  async getJobs(filters: JobFilters, page: number = 1, limit: number = 20): Promise<{ jobs: Job[], total: number }> {
    const queryBuilder = this.createJobQueryBuilder(filters);
    
    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Default sorting by created date (newest first), then by featured status
    queryBuilder.orderBy('job.isFeatured', 'DESC')
               .addOrderBy('job.createdAt', 'DESC');

    const [jobs, total] = await queryBuilder.getManyAndCount();
    return { jobs, total };
  }

  async getFeaturedJobs(limit: number = 10): Promise<Job[]> {
    return await this.jobRepository.find({
      where: { 
        isActive: true,
        isFeatured: true 
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getJobsByStartup(startupId: string, includeInactive: boolean = false): Promise<Job[]> {
    const where: any = { startupId };
    if (!includeInactive) {
      where.isActive = true;
    }

    return await this.jobRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async searchJobs(query: string, filters: JobFilters, page: number = 1, limit: number = 20): Promise<{ jobs: Job[], total: number }> {
    const searchFilters = { ...filters, search: query };
    return await this.getJobs(searchFilters, page, limit);
  }

  async applyToJob(data: ApplicationCreateData): Promise<JobApplication> {
    const job = await this.jobRepository.findOne({
      where: { id: data.jobId }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (!job.canUserApply()) {
      throw new Error('This job is no longer accepting applications');
    }

    // Check if user has already applied
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        jobId: data.jobId,
        applicantId: data.applicantId
      }
    });

    if (existingApplication) {
      throw new Error('You have already applied to this job');
    }

    const application = this.applicationRepository.create(data);
    const savedApplication = await this.applicationRepository.save(application);

    // Update job application count
    job.incrementApplicationCount();
    await this.jobRepository.save(job);

    logger.info(`Job application submitted: ${savedApplication.id} for job ${job.id}`);
    return savedApplication;
  }

  async getJobApplications(jobId: string, startupId?: string): Promise<JobApplication[]> {
    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .where('application.jobId = :jobId', { jobId });

    // Verify startup ownership if provided
    if (startupId) {
      queryBuilder.andWhere('job.startupId = :startupId', { startupId });
    }

    return await queryBuilder
      .orderBy('application.createdAt', 'DESC')
      .getMany();
  }

  async getUserApplications(userId: string, page: number = 1, limit: number = 20): Promise<{ applications: JobApplication[], total: number }> {
    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .where('application.applicantId = :userId', { userId })
      .orderBy('application.createdAt', 'DESC');

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [applications, total] = await queryBuilder.getManyAndCount();
    return { applications, total };
  }

  async updateApplicationStatus(
    applicationId: string, 
    status: ApplicationStatus, 
    updatedBy: string, 
    notes?: string
  ): Promise<JobApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['job']
    });

    if (!application) {
      throw new Error('Application not found');
    }

    application.updateStatus(status, updatedBy, notes);
    const updatedApplication = await this.applicationRepository.save(application);

    logger.info(`Application status updated: ${applicationId} to ${status}`);
    return updatedApplication;
  }

  async saveJob(userId: string, jobId: string, notes?: string): Promise<SavedJob> {
    // Check if already saved
    const existingSave = await this.savedJobRepository.findOne({
      where: { userId, jobId }
    });

    if (existingSave) {
      // Update notes if provided
      if (notes) {
        existingSave.notes = notes;
        return await this.savedJobRepository.save(existingSave);
      }
      return existingSave;
    }

    const savedJob = this.savedJobRepository.create({
      userId,
      jobId,
      notes
    });

    return await this.savedJobRepository.save(savedJob);
  }

  async unsaveJob(userId: string, jobId: string): Promise<void> {
    await this.savedJobRepository.delete({ userId, jobId });
  }

  async getUserSavedJobs(userId: string, page: number = 1, limit: number = 20): Promise<{ savedJobs: SavedJob[], total: number }> {
    const queryBuilder = this.savedJobRepository
      .createQueryBuilder('savedJob')
      .leftJoinAndSelect('savedJob.job', 'job')
      .where('savedJob.userId = :userId', { userId })
      .andWhere('job.isActive = :isActive', { isActive: true })
      .orderBy('savedJob.createdAt', 'DESC');

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [savedJobs, total] = await queryBuilder.getManyAndCount();
    return { savedJobs, total };
  }

  async createJobAlert(userId: string, alertData: any): Promise<JobAlert> {
    const alert = this.alertRepository.create({
      userId,
      ...alertData
    });

    return await this.alertRepository.save(alert);
  }

  async getUserJobAlerts(userId: string): Promise<JobAlert[]> {
    return await this.alertRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async updateJobAlert(alertId: string, userId: string, updateData: any): Promise<JobAlert> {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId, userId }
    });

    if (!alert) {
      throw new Error('Job alert not found');
    }

    Object.assign(alert, updateData);
    return await this.alertRepository.save(alert);
  }

  async deleteJobAlert(alertId: string, userId: string): Promise<void> {
    const result = await this.alertRepository.delete({
      id: alertId,
      userId
    });

    if (result.affected === 0) {
      throw new Error('Job alert not found');
    }
  }

  async getJobStats(startupId?: string): Promise<any> {
    const queryBuilder = this.jobRepository.createQueryBuilder('job');

    if (startupId) {
      queryBuilder.where('job.startupId = :startupId', { startupId });
    }

    const [
      totalJobs,
      activeJobs,
      totalApplications,
      featuredJobs
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('job.isActive = :isActive', { isActive: true }).getCount(),
      this.applicationRepository.count(startupId ? {
        where: { job: { startupId } }
      } : {}),
      queryBuilder.clone().andWhere('job.isFeatured = :isFeatured', { isFeatured: true }).getCount()
    ]);

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      featuredJobs,
      averageApplicationsPerJob: totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0
    };
  }

  private createJobQueryBuilder(filters: JobFilters): SelectQueryBuilder<Job> {
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .where('job.isActive = :isActive', { isActive: true });

    // Search in title, description, and skills
    if (filters.search) {
      queryBuilder.andWhere(
        '(job.title ILIKE :search OR job.description ILIKE :search OR job.skills && :searchArray)',
        { 
          search: `%${filters.search}%`,
          searchArray: [filters.search]
        }
      );
    }

    if (filters.category) {
      queryBuilder.andWhere('job.category = :category', { category: filters.category });
    }

    if (filters.type) {
      queryBuilder.andWhere('job.type = :type', { type: filters.type });
    }

    if (filters.locationType) {
      queryBuilder.andWhere('job.locationType = :locationType', { locationType: filters.locationType });
    }

    if (filters.experienceLevel) {
      queryBuilder.andWhere('job.experienceLevel = :experienceLevel', { experienceLevel: filters.experienceLevel });
    }

    if (filters.location) {
      queryBuilder.andWhere(
        '(job.locationCity ILIKE :location OR job.locationState ILIKE :location OR job.locationCountry ILIKE :location)',
        { location: `%${filters.location}%` }
      );
    }

    if (filters.salaryMin) {
      queryBuilder.andWhere('job.salaryMax >= :salaryMin', { salaryMin: filters.salaryMin });
    }

    if (filters.salaryMax) {
      queryBuilder.andWhere('job.salaryMin <= :salaryMax', { salaryMax: filters.salaryMax });
    }

    if (filters.skills && filters.skills.length > 0) {
      queryBuilder.andWhere('job.skills && :skills', { skills: filters.skills });
    }

    if (filters.startupIds && filters.startupIds.length > 0) {
      queryBuilder.andWhere('job.startupId IN (:...startupIds)', { startupIds: filters.startupIds });
    }

    if (filters.isRemote) {
      queryBuilder.andWhere('job.locationType = :remote', { remote: WorkLocation.REMOTE });
    }

    if (filters.isFeatured) {
      queryBuilder.andWhere('job.isFeatured = :isFeatured', { isFeatured: true });
    }

    if (filters.postedSince) {
      queryBuilder.andWhere('job.createdAt >= :postedSince', { postedSince: filters.postedSince });
    }

    return queryBuilder;
  }

  async deleteJob(id: string, deletedBy: string): Promise<void> {
    const job = await this.jobRepository.findOne({ where: { id } });
    
    if (!job) {
      throw new Error('Job not found');
    }

    // Check permission
    if (job.postedBy !== deletedBy) {
      throw new Error('Unauthorized to delete this job');
    }

    // Soft delete by marking as inactive
    job.isActive = false;
    await this.jobRepository.save(job);

    logger.info(`Job soft deleted: ${id} by ${deletedBy}`);
  }

  async expireOldJobs(): Promise<number> {
    const result = await this.jobRepository
      .createQueryBuilder()
      .update(Job)
      .set({ isActive: false })
      .where('expiresAt < :now', { now: new Date() })
      .andWhere('isActive = :isActive', { isActive: true })
      .execute();

    const expiredCount = result.affected || 0;
    if (expiredCount > 0) {
      logger.info(`Expired ${expiredCount} old jobs`);
    }

    return expiredCount;
  }
}