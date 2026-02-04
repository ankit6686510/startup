import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryBuilder } from 'typeorm';
import { Startup } from '../models/Startup';
import { StartupTeam } from '../models/StartupTeam';
import { StartupPhoto } from '../models/StartupPhoto';
import { StartupVerification, VerificationStatus } from '../models/StartupVerification';
import { StartupFollow } from '../models/StartupFollow';

interface CreateTeamMemberDto {
  name: string;
  title: string;
  role: string;
  bio?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  profileImageUrl?: string;
  expertise?: string[];
  education?: string[];
}

interface UpdateTeamMemberDto extends Partial<CreateTeamMemberDto> {
  orderIndex?: number;
  isFeatured?: boolean;
}

interface CreatePhotoDto {
  title: string;
  caption?: string;
  category: string;
  imageUrl: string;
  thumbnailUrl: string;
  altText?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  fileSize?: number;
}

interface UpdatePhotoDto extends Partial<CreatePhotoDto> {
  orderIndex?: number;
  isFeatured?: boolean;
}

interface UpdateStartupProfileDto {
  description?: string;
  longDescription?: string;
  mission?: string;
  vision?: string;
  values?: string[];
  website?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  culture?: string;
  foundingDate?: Date;
  headquarters?: string;
  companySize?: string;
}

@Injectable()
export class StartupProfileService {
  private readonly logger = new Logger(StartupProfileService.name);

  constructor(
    @InjectRepository(Startup)
    private startupRepository: Repository<Startup>,
    @InjectRepository(StartupTeam)
    private teamRepository: Repository<StartupTeam>,
    @InjectRepository(StartupPhoto)
    private photoRepository: Repository<StartupPhoto>,
    @InjectRepository(StartupVerification)
    private verificationRepository: Repository<StartupVerification>,
    @InjectRepository(StartupFollow)
    private followRepository: Repository<StartupFollow>
  ) {}

  // ==================== PROFILE MANAGEMENT ====================

  /**
   * Get complete startup profile with all details
   */
  async getCompleteProfile(startupId: string) {
    const startup = await this.startupRepository.findOne({
      where: { id: startupId },
      relations: ['founders', 'metrics', 'verification', 'teamMembers', 'photos']
    });

    if (!startup) {
      throw new Error(`Startup with ID ${startupId} not found`);
    }

    const teamMembers = await this.teamRepository.find({
      where: { startup: { id: startupId } },
      order: { orderIndex: 'ASC' }
    });

    const photos = await this.photoRepository.find({
      where: { startup: { id: startupId }, deletedAt: null },
      order: { orderIndex: 'ASC' }
    });

    const followers = await this.followRepository.count({
      where: { startupId, unfollowedAt: null }
    });

    const profileCompleteness = this.calculateProfileCompleteness(startup, teamMembers, photos);

    return {
      startup,
      teamMembers,
      photos,
      followers,
      profileCompleteness,
      verification: startup.verification
    };
  }

  /**
   * Update startup profile information
   */
  async updateProfile(startupId: string, updateData: UpdateStartupProfileDto) {
    const startup = await this.startupRepository.findOne({
      where: { id: startupId }
    });

    if (!startup) {
      throw new Error(`Startup with ID ${startupId} not found`);
    }

    Object.assign(startup, updateData);
    const updated = await this.startupRepository.save(startup);

    this.logger.log(`Updated profile for startup ${startupId}`);
    return updated;
  }

  /**
   * Calculate profile completeness percentage
   */
  calculateProfileCompleteness(startup: Startup, teamMembers: StartupTeam[], photos: StartupPhoto[]): number {
    let completeness = 0;
    const checks = [];

    // Basic info (20%)
    if (startup.name) checks.push(true);
    if (startup.description) checks.push(true);
    if (startup.mission) checks.push(true);
    if (startup.vision) checks.push(true);
    if (startup.values && startup.values.length > 0) checks.push(true);

    const basicScore = (checks.filter(Boolean).length / 5) * 20;
    completeness += basicScore;

    // Team info (30%)
    const teamChecks = [];
    if (teamMembers.length >= 1) teamChecks.push(true);
    if (teamMembers.length >= 3) teamChecks.push(true);
    if (teamMembers.some(m => m.isFeatured)) teamChecks.push(true);

    const teamScore = (teamChecks.filter(Boolean).length / 3) * 30;
    completeness += teamScore;

    // Media (20%)
    const mediaChecks = [];
    if (photos.length >= 1) mediaChecks.push(true);
    if (photos.length >= 5) mediaChecks.push(true);
    if (photos.some(p => p.isFeatured)) mediaChecks.push(true);

    const mediaScore = (mediaChecks.filter(Boolean).length / 3) * 20;
    completeness += mediaScore;

    // Social & Links (15%)
    const socialChecks = [];
    if (startup.website) socialChecks.push(true);
    if (startup.linkedinUrl) socialChecks.push(true);
    if (startup.twitterUrl) socialChecks.push(true);

    const socialScore = (socialChecks.filter(Boolean).length / 3) * 15;
    completeness += socialScore;

    // Verification (15%)
    const verificationScore = startup.verification?.status === VerificationStatus.VERIFIED ? 15 : 0;
    completeness += verificationScore;

    return Math.round(completeness);
  }

  // ==================== TEAM MANAGEMENT ====================

  /**
   * Add team member to startup
   */
  async addTeamMember(startupId: string, memberData: CreateTeamMemberDto) {
    const startup = await this.startupRepository.findOne({
      where: { id: startupId }
    });

    if (!startup) {
      throw new Error(`Startup with ID ${startupId} not found`);
    }

    // Get max order index
    const maxOrder = await this.teamRepository
      .createQueryBuilder('team')
      .where('team.startup_id = :startupId', { startupId })
      .select('MAX(team.order_index)', 'maxOrder')
      .getRawOne();

    const newMember = this.teamRepository.create({
      ...memberData,
      startup,
      orderIndex: (maxOrder?.maxOrder ?? -1) + 1
    });

    const saved = await this.teamRepository.save(newMember);
    this.logger.log(`Added team member ${saved.id} to startup ${startupId}`);
    return saved;
  }

  /**
   * Update team member details
   */
  async updateTeamMember(startupId: string, memberId: string, updateData: UpdateTeamMemberDto) {
    const member = await this.teamRepository.findOne({
      where: {
        id: memberId,
        startup: { id: startupId }
      }
    });

    if (!member) {
      throw new Error(`Team member ${memberId} not found in startup ${startupId}`);
    }

    Object.assign(member, updateData);
    const updated = await this.teamRepository.save(member);
    return updated;
  }

  /**
   * Delete team member
   */
  async deleteTeamMember(startupId: string, memberId: string) {
    const member = await this.teamRepository.findOne({
      where: {
        id: memberId,
        startup: { id: startupId }
      }
    });

    if (!member) {
      throw new Error(`Team member ${memberId} not found`);
    }

    await this.teamRepository.remove(member);
    this.logger.log(`Deleted team member ${memberId}`);
    return { success: true };
  }

  /**
   * Reorder team members
   */
  async reorderTeam(startupId: string, memberIds: string[]) {
    const members = await this.teamRepository.find({
      where: { startup: { id: startupId } }
    });

    const memberMap = new Map(members.map(m => [m.id, m]));

    memberIds.forEach((id, index) => {
      const member = memberMap.get(id);
      if (member) {
        member.orderIndex = index;
      }
    });

    await this.teamRepository.save(Array.from(memberMap.values()));
    this.logger.log(`Reordered team members for startup ${startupId}`);
    return { success: true };
  }

  /**
   * Get team members for startup
   */
  async getTeamMembers(startupId: string) {
    return this.teamRepository.find({
      where: { startup: { id: startupId } },
      order: { orderIndex: 'ASC' }
    });
  }

  // ==================== PHOTO GALLERY MANAGEMENT ====================

  /**
   * Add photo to gallery
   */
  async addPhoto(startupId: string, photoData: CreatePhotoDto) {
    const startup = await this.startupRepository.findOne({
      where: { id: startupId }
    });

    if (!startup) {
      throw new Error(`Startup with ID ${startupId} not found`);
    }

    // Get max order index
    const maxOrder = await this.photoRepository
      .createQueryBuilder('photo')
      .where('photo.startup_id = :startupId', { startupId })
      .andWhere('photo.deleted_at IS NULL')
      .select('MAX(photo.order_index)', 'maxOrder')
      .getRawOne();

    const newPhoto = this.photoRepository.create({
      ...photoData,
      startup,
      orderIndex: (maxOrder?.maxOrder ?? -1) + 1
    });

    const saved = await this.photoRepository.save(newPhoto);
    this.logger.log(`Added photo ${saved.id} to startup ${startupId}`);
    return saved;
  }

  /**
   * Update photo details
   */
  async updatePhoto(startupId: string, photoId: string, updateData: UpdatePhotoDto) {
    const photo = await this.photoRepository.findOne({
      where: {
        id: photoId,
        startup: { id: startupId },
        deletedAt: null
      }
    });

    if (!photo) {
      throw new Error(`Photo ${photoId} not found`);
    }

    Object.assign(photo, updateData);
    const updated = await this.photoRepository.save(photo);
    return updated;
  }

  /**
   * Delete photo (soft delete)
   */
  async deletePhoto(startupId: string, photoId: string) {
    const photo = await this.photoRepository.findOne({
      where: {
        id: photoId,
        startup: { id: startupId }
      }
    });

    if (!photo) {
      throw new Error(`Photo ${photoId} not found`);
    }

    photo.deletedAt = new Date();
    await this.photoRepository.save(photo);
    this.logger.log(`Deleted photo ${photoId}`);
    return { success: true };
  }

  /**
   * Reorder photos in gallery
   */
  async reorderPhotos(startupId: string, photoIds: string[]) {
    const photos = await this.photoRepository.find({
      where: {
        startup: { id: startupId },
        deletedAt: null
      }
    });

    const photoMap = new Map(photos.map(p => [p.id, p]));

    photoIds.forEach((id, index) => {
      const photo = photoMap.get(id);
      if (photo) {
        photo.orderIndex = index;
      }
    });

    await this.photoRepository.save(Array.from(photoMap.values()));
    this.logger.log(`Reordered photos for startup ${startupId}`);
    return { success: true };
  }

  /**
   * Get gallery for startup
   */
  async getGallery(startupId: string, category?: string) {
    let query = this.photoRepository.createQueryBuilder('photo')
      .where('photo.startup_id = :startupId', { startupId })
      .andWhere('photo.deleted_at IS NULL');

    if (category) {
      query = query.andWhere('photo.category = :category', { category });
    }

    return query.orderBy('photo.order_index', 'ASC').getMany();
  }

  /**
   * Increment photo views
   */
  async incrementPhotoViews(photoId: string) {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId }
    });

    if (photo) {
      photo.incrementViewCount();
      await this.photoRepository.save(photo);
    }

    return photo;
  }

  /**
   * Like/unlike photo
   */
  async togglePhotoLike(photoId: string, like: boolean) {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId }
    });

    if (!photo) {
      throw new Error(`Photo ${photoId} not found`);
    }

    if (like) {
      photo.incrementLikesCount();
    } else {
      photo.decrementLikesCount();
    }

    const updated = await this.photoRepository.save(photo);
    return updated;
  }

  // ==================== VERIFICATION MANAGEMENT ====================

  /**
   * Get or create verification record
   */
  async getOrCreateVerification(startupId: string) {
    let verification = await this.verificationRepository.findOne({
      where: { startupId }
    });

    if (!verification) {
      const startup = await this.startupRepository.findOne({
        where: { id: startupId }
      });

      if (!startup) {
        throw new Error(`Startup with ID ${startupId} not found`);
      }

      verification = this.verificationRepository.create({
        startupId,
        status: 'UNVERIFIED',
        startup
      });

      verification = await this.verificationRepository.save(verification);
    }

    return verification;
  }

  /**
   * Start email verification process
   */
  async startEmailVerification(startupId: string, email: string) {
    const verification = await this.getOrCreateVerification(startupId);

    verification.companyEmail = email;
    verification.companyEmailDomain = email.split('@')[1];
    verification.status = VerificationStatus.PENDING;

    const updated = await this.verificationRepository.save(verification);
    this.logger.log(`Started email verification for startup ${startupId}`);
    return updated;
  }

  /**
   * Confirm email verification
   */
  async confirmEmailVerification(startupId: string) {
    const verification = await this.verificationRepository.findOne({
      where: { startupId }
    });

    if (!verification) {
      throw new Error('Verification record not found');
    }

    verification.emailVerified = true;
    verification.emailVerifiedAt = new Date();

    // Check if we can mark as verified
    if (verification.documentsVerified || verification.linkedinVerified) {
      verification.status = VerificationStatus.VERIFIED;
    }

    const updated = await this.verificationRepository.save(verification);
    this.logger.log(`Confirmed email verification for startup ${startupId}`);
    return updated;
  }

  /**
   * Submit documents for verification
   */
  async submitDocuments(startupId: string, registrationNumber: string, documentUrl: string) {
    const verification = await this.getOrCreateVerification(startupId);

    verification.registrationNumber = registrationNumber;
    verification.registrationDocumentUrl = documentUrl;
    verification.status = VerificationStatus.PENDING;

    const updated = await this.verificationRepository.save(verification);
    this.logger.log(`Submitted documents for startup ${startupId}`);
    return updated;
  }

  /**
   * Admin approve verification
   */
  async approveVerification(startupId: string, reviewedBy: string, notes?: string) {
    const verification = await this.verificationRepository.findOne({
      where: { startupId }
    });

    if (!verification) {
      throw new Error('Verification record not found');
    }

    verification.status = VerificationStatus.VERIFIED;
    verification.reviewedBy = reviewedBy;
    verification.reviewedAt = new Date();
    verification.reviewNotes = notes;

    const updated = await this.verificationRepository.save(verification);
    this.logger.log(`Approved verification for startup ${startupId}`);
    return updated;
  }

  /**
   * Admin reject verification
   */
  async rejectVerification(startupId: string, reviewedBy: string, reason: string) {
    const verification = await this.verificationRepository.findOne({
      where: { startupId }
    });

    if (!verification) {
      throw new Error('Verification record not found');
    }

    verification.recordRejection(reason);
    verification.reviewedBy = reviewedBy;
    verification.reviewedAt = new Date();

    const updated = await this.verificationRepository.save(verification);
    this.logger.log(`Rejected verification for startup ${startupId}`);
    return updated;
  }

  /**
   * Check verification status
   */
  async getVerificationStatus(startupId: string) {
    const verification = await this.getOrCreateVerification(startupId);

    return {
      status: verification.status,
      emailVerified: verification.emailVerified,
      documentsVerified: verification.documentsVerified,
      linkedinVerified: verification.linkedinVerified,
      reviewedAt: verification.reviewedAt,
      rejectionReason: verification.rejectionReason,
      canResubmit: verification.canResubmit()
    };
  }

  // ==================== ANALYTICS ====================

  /**
   * Get profile analytics
   */
  async getProfileAnalytics(startupId: string) {
    const teamMembers = await this.teamRepository.find({
      where: { startup: { id: startupId } }
    });

    const photos = await this.photoRepository.find({
      where: { startup: { id: startupId }, deletedAt: null }
    });

    const followers = await this.followRepository.count({
      where: { startupId, unfollowedAt: null }
    });

    const totalPhotoViews = photos.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
    const totalPhotoLikes = photos.reduce((sum, p) => sum + (p.likesCount || 0), 0);

    const totalTeamViews = teamMembers.reduce((sum, m) => sum + (m.viewsCount || 0), 0);

    return {
      teamMembersCount: teamMembers.length,
      photosCount: photos.length,
      followers,
      totalPhotoViews,
      totalPhotoLikes,
      totalTeamViews,
      averagePhotoLikes: photos.length > 0 ? (totalPhotoLikes / photos.length).toFixed(2) : 0,
      mostViewedPhoto: photos.length > 0 ? photos.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))[0] : null
    };
  }

  /**
   * Get featured content for startup
   */
  async getFeaturedContent(startupId: string) {
    const [featuredTeam, featuredPhotos] = await Promise.all([
      this.teamRepository.find({
        where: {
          startup: { id: startupId },
          isFeatured: true
        },
        order: { orderIndex: 'ASC' },
        take: 5
      }),
      this.photoRepository.find({
        where: {
          startup: { id: startupId },
          isFeatured: true,
          deletedAt: null
        },
        order: { orderIndex: 'ASC' },
        take: 5
      })
    ]);

    return {
      featuredTeamMembers: featuredTeam,
      featuredPhotos: featuredPhotos
    };
  }
}
