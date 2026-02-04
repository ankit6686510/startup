import { Repository, In, Between } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { JobApplication, ApplicationStatus } from '@/models/JobApplication';
import { ApplicationStatusHistory } from '@/models/ApplicationStatusHistory';
import { ApplicationDocument } from '@/models/ApplicationDocument';
import { ApplicationAnalytics } from '@/models/ApplicationAnalytics';
import { Job } from '@/models/Job';
import { logger } from '@/utils/logger';

export interface UploadedFile {
  originalName: string;
  mimetype: string;
  size: number;
  path?: string;
  buffer?: Buffer;
}

export interface BulkApplicationData {
  jobIds: string[];
  applicantId: string;
  commonData?: any; // Data shared across all applications
}

export interface ApplicationFilters {
  status?: ApplicationStatus;
  jobId?: string;
  startupId?: string;
  applicantId?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  sortBy?: 'newest' | 'oldest' | 'status' | 'quality';
}

export class ApplicationManagementService {
  private applicationRepository: Repository<JobApplication>;
  private statusHistoryRepository: Repository<ApplicationStatusHistory>;
  private documentRepository: Repository<ApplicationDocument>;
  private analyticsRepository: Repository<ApplicationAnalytics>;
  private jobRepository: Repository<Job>;

  constructor() {
    this.applicationRepository = AppDataSource.getRepository(JobApplication);
    this.statusHistoryRepository = AppDataSource.getRepository(ApplicationStatusHistory);
    this.documentRepository = AppDataSource.getRepository(ApplicationDocument);
    this.analyticsRepository = AppDataSource.getRepository(ApplicationAnalytics);
    this.jobRepository = AppDataSource.getRepository(Job);
  }

  // ==================== DOCUMENT MANAGEMENT ====================

  /**
   * Upload document for application
   */
  async uploadApplicationDocument(
    applicationId: string,
    documentType: string,
    file: UploadedFile,
    isPrimary: boolean = false
  ): Promise<ApplicationDocument> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // If this is primary, unmark other primary documents
    if (isPrimary) {
      await this.documentRepository.update(
        { applicationId, documentType },
        { isPrimary: false }
      );
    }

    // Generate storage key
    const timestamp = Date.now();
    const storageKey = `applications/${applicationId}/${documentType}/${timestamp}-${file.originalName}`;

    // TODO: Upload to S3/Cloud Storage
    // const fileUrl = await this.uploadToStorage(file, storageKey);

    const document = this.documentRepository.create({
      applicationId,
      documentType,
      fileName: file.originalName,
      fileSize: file.size,
      fileMimeType: file.mimetype,
      fileUrl: `https://storage.example.com/${storageKey}`, // Placeholder
      storageKey,
      isPrimary,
      uploadedBy: application.applicantId,
      metadata: {
        uploadedVia: 'web'
      }
    });

    const saved = await this.documentRepository.save(document);

    // Update application with document URL if primary resume
    if (documentType === 'resume' && isPrimary) {
      application.resumeUrl = saved.fileUrl;
      await this.applicationRepository.save(application);
    }

    logger.info(`Document uploaded: ${documentType} for application ${applicationId}`);
    return saved;
  }

  /**
   * Get application documents
   */
  async getApplicationDocuments(applicationId: string): Promise<ApplicationDocument[]> {
    return await this.documentRepository.find({
      where: { applicationId },
      order: { isPrimary: 'DESC', createdAt: 'DESC' }
    });
  }

  /**
   * Delete application document
   */
  async deleteApplicationDocument(documentId: string, applicationId: string): Promise<void> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId, applicationId }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // TODO: Delete from storage
    // await this.deleteFromStorage(document.storageKey);

    await this.documentRepository.remove(document);
    logger.info(`Document deleted: ${documentId}`);
  }

  // ==================== STATUS & HISTORY TRACKING ====================

  /**
   * Update application status with history tracking
   */
  async updateApplicationStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
    changedBy?: string,
    changeReason?: string,
    notes?: string
  ): Promise<{ application: JobApplication; history: ApplicationStatusHistory }> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const previousStatus = application.status;

    // Record status history
    const history = this.statusHistoryRepository.create({
      applicationId,
      status: newStatus as any,
      previousStatus,
      changedBy,
      changeReason,
      notes,
      metadata: {
        timestamp: new Date().toISOString(),
        changedVia: 'api'
      }
    });

    const savedHistory = await this.statusHistoryRepository.save(history);

    // Update application status
    application.status = newStatus;
    
    // Update relevant timestamp fields
    const now = new Date();
    if (newStatus === ApplicationStatus.UNDER_REVIEW) {
      application.reviewedAt = now;
      application.reviewedBy = changedBy;
    } else if (newStatus === ApplicationStatus.INTERVIEW_SCHEDULED) {
      application.interviewScheduledAt = now;
    } else if (newStatus === ApplicationStatus.REJECTED) {
      application.rejectionReason = changeReason;
    }

    const updatedApplication = await this.applicationRepository.save(application);

    // Update analytics
    await this.updateApplicationAnalytics(applicationId, {
      statusChange: true,
      newStatus
    });

    // Trigger notification (integrate with notification service)
    await this.triggerStatusNotification(applicationId, newStatus, previousStatus);

    logger.info(`Application ${applicationId} status updated: ${previousStatus} -> ${newStatus}`);

    return { application: updatedApplication, history: savedHistory };
  }

  /**
   * Get application status history
   */
  async getApplicationStatusHistory(applicationId: string): Promise<ApplicationStatusHistory[]> {
    return await this.statusHistoryRepository.find({
      where: { applicationId },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get application timeline
   */
  async getApplicationTimeline(applicationId: string): Promise<any[]> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const history = await this.getApplicationStatusHistory(applicationId);
    const documents = await this.getApplicationDocuments(applicationId);

    // Merge history and documents into timeline
    const timeline: any[] = [];

    // Add submission event
    timeline.push({
      type: 'submission',
      timestamp: application.createdAt,
      data: { status: application.status }
    });

    // Add status changes
    history.forEach(h => {
      timeline.push({
        type: 'status_change',
        timestamp: h.createdAt,
        data: {
          from: h.previousStatus,
          to: h.status,
          reason: h.changeReason,
          notes: h.notes
        }
      });
    });

    // Add document uploads
    documents.forEach(d => {
      timeline.push({
        type: 'document_upload',
        timestamp: d.createdAt,
        data: {
          documentType: d.documentType,
          fileName: d.fileName
        }
      });
    });

    // Sort by timestamp
    return timeline.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Apply to multiple jobs in bulk
   */
  async bulkApplyToJobs(bulkData: BulkApplicationData): Promise<{
    successful: JobApplication[];
    failed: Array<{ jobId: string; error: string }>;
  }> {
    const { jobIds, applicantId, commonData } = bulkData;

    const successful: JobApplication[] = [];
    const failed: Array<{ jobId: string; error: string }> = [];

    // Fetch all jobs
    const jobs = await this.jobRepository.find({
      where: { id: In(jobIds) }
    });

    const jobMap = new Map(jobs.map(j => [j.id, j]));

    for (const jobId of jobIds) {
      try {
        const job = jobMap.get(jobId);

        if (!job) {
          failed.push({ jobId, error: 'Job not found' });
          continue;
        }

        if (!job.canUserApply()) {
          failed.push({ jobId, error: 'Job no longer accepting applications' });
          continue;
        }

        // Check for duplicate application
        const existing = await this.applicationRepository.findOne({
          where: { jobId, applicantId }
        });

        if (existing) {
          failed.push({ jobId, error: 'Already applied to this job' });
          continue;
        }

        // Create application
        const application = this.applicationRepository.create({
          jobId,
          applicantId,
          ...commonData,
          emailAddress: commonData.emailAddress,
          fullName: commonData.fullName
        });

        const saved = await this.applicationRepository.save(application);
        
        // Create analytics record
        await this.createApplicationAnalytics(saved);
        
        // Increment job application count
        job.incrementApplicationCount();
        await this.jobRepository.save(job);

        successful.push(saved);
      } catch (error) {
        failed.push({
          jobId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    logger.info(`Bulk apply: ${successful.length} successful, ${failed.length} failed`);

    return { successful, failed };
  }

  /**
   * Bulk update application statuses
   */
  async bulkUpdateStatus(
    applicationIds: string[],
    newStatus: ApplicationStatus,
    changedBy?: string,
    reason?: string
  ): Promise<{
    updated: number;
    failed: Array<{ id: string; error: string }>;
  }> {
    const updated = 0;
    const failed: Array<{ id: string; error: string }> = [];

    for (const id of applicationIds) {
      try {
        await this.updateApplicationStatus(id, newStatus, changedBy, reason);
      } catch (error) {
        failed.push({
          id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    logger.info(`Bulk status update: ${applicationIds.length - failed.length} updated`);

    return {
      updated: applicationIds.length - failed.length,
      failed
    };
  }

  /**
   * Bulk get applications with advanced filtering
   */
  async getApplicationsByFilter(
    filters: ApplicationFilters,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    applications: JobApplication[];
    total: number;
    facets: any;
  }> {
    let queryBuilder = this.applicationRepository.createQueryBuilder('app');

    if (filters.status) {
      queryBuilder.andWhere('app.status = :status', { status: filters.status });
    }

    if (filters.jobId) {
      queryBuilder.andWhere('app.jobId = :jobId', { jobId: filters.jobId });
    }

    if (filters.applicantId) {
      queryBuilder.andWhere('app.applicantId = :applicantId', { 
        applicantId: filters.applicantId 
      });
    }

    if (filters.startupId) {
      queryBuilder.innerJoin('jobs', 'j', 'j.id = app.jobId')
                 .andWhere('j.startupId = :startupId', { 
                   startupId: filters.startupId 
                 });
    }

    if (filters.createdAfter || filters.createdBefore) {
      queryBuilder.andWhere('app.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.createdAfter || new Date('2000-01-01'),
        endDate: filters.createdBefore || new Date()
      });
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'oldest':
        queryBuilder.orderBy('app.createdAt', 'ASC');
        break;
      case 'status':
        queryBuilder.orderBy('app.status', 'ASC');
        break;
      case 'quality':
        queryBuilder.orderBy('app.resumeScore', 'DESC', 'NULLS LAST');
        break;
      case 'newest':
      default:
        queryBuilder.orderBy('app.createdAt', 'DESC');
    }

    // Get facets before pagination
    const statusFacets = await this.applicationRepository
      .createQueryBuilder('app')
      .select('app.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('app.status IS NOT NULL')
      .groupBy('app.status')
      .getRawMany();

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [applications, total] = await queryBuilder.getManyAndCount();

    return {
      applications,
      total,
      facets: {
        statuses: statusFacets.map(f => ({
          status: f.status,
          count: parseInt(f.count)
        }))
      }
    };
  }

  // ==================== ANALYTICS ====================

  /**
   * Create analytics record for application
   */
  private async createApplicationAnalytics(application: JobApplication): Promise<ApplicationAnalytics> {
    const job = await this.jobRepository.findOne({
      where: { id: application.jobId }
    });

    const analytics = this.analyticsRepository.create({
      applicationId: application.id,
      jobId: application.jobId,
      applicantId: application.applicantId,
      startupId: job?.startupId || '',
      funnelStage: 'applied',
      submissionTimeMs: 0
    });

    return await this.analyticsRepository.save(analytics);
  }

  /**
   * Update application analytics
   */
  private async updateApplicationAnalytics(
    applicationId: string,
    data: any
  ): Promise<void> {
    const analytics = await this.analyticsRepository.findOne({
      where: { applicationId }
    });

    if (!analytics) {
      return;
    }

    if (data.statusChange && data.newStatus) {
      analytics.updateFunnelStage(data.newStatus);
    }

    await this.analyticsRepository.save(analytics);
  }

  /**
   * Get application analytics
   */
  async getApplicationAnalytics(applicationId: string): Promise<ApplicationAnalytics | null> {
    return await this.analyticsRepository.findOne({
      where: { applicationId },
      relations: ['application']
    });
  }

  /**
   * Get recruiting pipeline analytics
   */
  async getPipelineAnalytics(startupId: string, jobId?: string): Promise<any> {
    let queryBuilder = this.analyticsRepository
      .createQueryBuilder('analytics')
      .where('analytics.startupId = :startupId', { startupId });

    if (jobId) {
      queryBuilder.andWhere('analytics.jobId = :jobId', { jobId });
    }

    const analytics = await queryBuilder.getMany();

    // Calculate funnel metrics
    const stages = {
      applied: 0,
      reviewed: 0,
      shortlisted: 0,
      interviewed: 0,
      offered: 0,
      hired: 0,
      rejected: 0
    };

    const timings = {
      avgTimeToFirstResponse: 0,
      avgTimeToDecision: 0,
      avgDaysInReview: 0
    };

    analytics.forEach(a => {
      const stage = a.funnelStage.toLowerCase();
      if (stage in stages) {
        stages[stage as keyof typeof stages]++;
      }
    });

    // Calculate conversion rates
    const total = analytics.length;
    const conversions = {
      appliedToReviewed: total > 0 ? (stages.reviewed / total) * 100 : 0,
      reviewedToShortlisted: stages.reviewed > 0 ? (stages.shortlisted / stages.reviewed) * 100 : 0,
      shortlistedToInterviewed: stages.shortlisted > 0 ? (stages.interviewed / stages.shortlisted) * 100 : 0,
      interviewedToOffered: stages.interviewed > 0 ? (stages.offered / stages.interviewed) * 100 : 0,
      offeredToHired: stages.offered > 0 ? (stages.hired / stages.offered) * 100 : 0
    };

    // Calculate average timings
    const nonNullTimings = analytics.filter(a => a.daysToDecision !== null);
    if (nonNullTimings.length > 0) {
      timings.avgTimeToDecision = 
        nonNullTimings.reduce((sum, a) => sum + (a.daysToDecision || 0), 0) / nonNullTimings.length;
    }

    return {
      totalApplications: total,
      funnelStages: stages,
      conversionRates: conversions,
      timings,
      topDropOffReason: await this.getTopDropOffReason(startupId, jobId)
    };
  }

  /**
   * Get application quality metrics
   */
  async getQualityMetrics(startupId: string, jobId?: string): Promise<any> {
    let queryBuilder = this.analyticsRepository
      .createQueryBuilder('analytics')
      .where('analytics.startupId = :startupId', { startupId });

    if (jobId) {
      queryBuilder.andWhere('analytics.jobId = :jobId', { jobId });
    }

    const analytics = await queryBuilder.getMany();

    const scores = analytics
      .filter(a => a.matchScore !== null)
      .map(a => parseFloat(a.matchScore?.toString() || '0'));

    const avgMatchScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : 0;

    const topApplicants = analytics
      .filter(a => a.matchScore !== null)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 10);

    return {
      totalApplications: analytics.length,
      avgMatchScore: parseFloat(avgMatchScore.toFixed(2)),
      avgResponseRate: this.calculateAvgResponseRate(analytics),
      topApplicants,
      qualityDistribution: this.getQualityDistribution(analytics)
    };
  }

  private async getTopDropOffReason(startupId: string, jobId?: string): Promise<string | null> {
    let queryBuilder = this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.funnelDropReason', 'reason')
      .addSelect('COUNT(*)', 'count')
      .where('analytics.startupId = :startupId', { startupId })
      .andWhere('analytics.funnelDropReason IS NOT NULL')
      .groupBy('analytics.funnelDropReason')
      .orderBy('count', 'DESC')
      .limit(1);

    if (jobId) {
      queryBuilder.andWhere('analytics.jobId = :jobId', { jobId });
    }

    const result = await queryBuilder.getRawOne();
    return result?.reason || null;
  }

  private calculateAvgResponseRate(analytics: ApplicationAnalytics[]): number {
    const withResponse = analytics.filter(a => a.responseRate !== null);
    if (withResponse.length === 0) return 0;

    const total = withResponse.reduce((sum, a) => sum + (parseFloat(a.responseRate?.toString() || '0')), 0);
    return parseFloat((total / withResponse.length).toFixed(2));
  }

  private getQualityDistribution(analytics: ApplicationAnalytics[]): any {
    const distribution = {
      excellent: 0,    // 80-100
      good: 0,         // 60-79
      average: 0,      // 40-59
      poor: 0          // 0-39
    };

    analytics.forEach(a => {
      const score = a.matchScore || 0;
      if (score >= 80) distribution.excellent++;
      else if (score >= 60) distribution.good++;
      else if (score >= 40) distribution.average++;
      else distribution.poor++;
    });

    return distribution;
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Trigger notification on status change
   */
  private async triggerStatusNotification(
    applicationId: string,
    newStatus: ApplicationStatus,
    previousStatus: ApplicationStatus
  ): Promise<void> {
    // TODO: Integrate with notification service
    // This will send emails/push notifications to:
    // - Applicant (if status is REJECTED, OFFER_EXTENDED, etc.)
    // - Recruiter (if they should be notified)

    const notificationMap = {
      [ApplicationStatus.UNDER_REVIEW]: 'Application under review',
      [ApplicationStatus.SHORTLISTED]: 'Congratulations! You\'ve been shortlisted',
      [ApplicationStatus.INTERVIEW_SCHEDULED]: 'Interview scheduled',
      [ApplicationStatus.REJECTED]: 'Application update',
      [ApplicationStatus.OFFER_EXTENDED]: 'Job offer received!',
      [ApplicationStatus.ACCEPTED]: 'Offer accepted!',
    };

    const message = notificationMap[newStatus as keyof typeof notificationMap];

    logger.info(`Notification triggered for application ${applicationId}: ${message}`);

    // Example: Send to notification service
    // await fetch('http://notification-service:3005/api/v1/notifications', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     applicationId,
    //     type: 'APPLICATION_STATUS_CHANGE',
    //     status: newStatus,
    //     message
    //   })
    // });
  }
}
