import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { StartupProfileService } from '../services/StartupProfileService';
import {
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
  UpdateStartupProfileRequest,
  StartEmailVerificationRequest,
  SubmitDocumentsRequest,
  ApproveVerificationRequest,
  RejectVerificationRequest,
  ReorderTeamRequest,
  CreatePhotoRequest,
  UpdatePhotoRequest,
  ReorderPhotosRequest,
  ApiResponse,
  ProfileAnalyticsResponse,
  FeaturedContentResponse,
  FollowStatusResponse,
} from '../types/startup-profiles.types';

@Controller('startups/:startupId/profile')
export class StartupProfileController {
  private readonly logger = new Logger(StartupProfileController.name);

  constructor(private profileService: StartupProfileService) {}

  // ==================== PROFILE ENDPOINTS ====================

  @Get()
  async getProfile(@Param('startupId') startupId: string) {
    this.logger.log(`Getting profile for startup ${startupId}`);
    try {
      const profile = await this.profileService.getCompleteProfile(startupId);
      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      throw new NotFoundException(`Startup profile not found`);
    }
  }

  @Put()
  async updateProfile(
    @Param('startupId') startupId: string,
    @Body() updateData: UpdateStartupProfileRequest,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`Updating profile for startup ${startupId} by user ${userId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const updated = await this.profileService.updateProfile(startupId, updateData);
      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('completion')
  async getProfileCompletion(@Param('startupId') startupId: string) {
    this.logger.log(`Getting profile completion for startup ${startupId}`);
    try {
      const profile = await this.profileService.getCompleteProfile(startupId);
      return {
        success: true,
        data: {
          completionPercentage: profile.profileCompleteness,
          missingItems: this.getMissingItems(profile),
          nextSteps: this.getNextSteps(profile),
        },
      };
    } catch (error) {
      throw new NotFoundException(`Startup not found`);
    }
  }

  @Get('analytics')
  async getAnalytics(
    @Param('startupId') startupId: string,
  ): Promise<ApiResponse<ProfileAnalyticsResponse>> {
    this.logger.log(`Getting analytics for startup ${startupId}`);
    try {
      const analytics = await this.profileService.getProfileAnalytics(startupId);
      return {
        success: true,
        data: analytics,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new NotFoundException(`Startup not found`);
    }
  }

  @Get('featured-content')
  async getFeaturedContent(
    @Param('startupId') startupId: string,
  ): Promise<ApiResponse<FeaturedContentResponse>> {
    this.logger.log(`Getting featured content for startup ${startupId}`);
    try {
      const featured = await this.profileService.getFeaturedContent(startupId);
      return {
        success: true,
        data: featured,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new NotFoundException(`Startup not found`);
    }
  }

  // ==================== TEAM ENDPOINTS ====================

  @Get('team')
  async getTeam(@Param('startupId') startupId: string) {
    this.logger.log(`Getting team for startup ${startupId}`);
    try {
      const teamMembers = await this.profileService.getTeamMembers(startupId);
      return {
        success: true,
        data: teamMembers,
        count: teamMembers.length,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('team')
  @HttpCode(HttpStatus.CREATED)
  async addTeamMember(
    @Param('startupId') startupId: string,
    @Body() memberData: CreateTeamMemberRequest,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`Adding team member to startup ${startupId} by user ${userId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (!memberData.name || !memberData.title || !memberData.role) {
      throw new BadRequestException('Name, title, and role are required');
    }

    try {
      const teamMember = await this.profileService.addTeamMember(startupId, memberData);
      return {
        success: true,
        data: teamMember,
        message: 'Team member added successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put('team/:memberId')
  async updateTeamMember(
    @Param('startupId') startupId: string,
    @Param('memberId') memberId: string,
    @Body() updateData: UpdateTeamMemberRequest,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`Updating team member ${memberId} by user ${userId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const updated = await this.profileService.updateTeamMember(startupId, memberId, updateData);
      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete('team/:memberId')
  async deleteTeamMember(
    @Param('startupId') startupId: string,
    @Param('memberId') memberId: string,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`Deleting team member ${memberId} by user ${userId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      await this.profileService.deleteTeamMember(startupId, memberId);
      return {
        success: true,
        message: 'Team member deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('team/reorder')
  async reorderTeam(
    @Param('startupId') startupId: string,
    @Body() reorderData: ReorderTeamRequest,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`Reordering team for startup ${startupId} by user ${userId}`);

    if (!userId || !reorderData.memberIds) {
      throw new BadRequestException('User ID and member IDs are required');
    }

    try {
      await this.profileService.reorderTeam(startupId, reorderData.memberIds);
      return {
        success: true,
        message: 'Team reordered successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ==================== GALLERY ENDPOINTS ====================

  @Get('gallery')
  async getGallery(@Param('startupId') startupId: string, @Query('category') category?: string) {
    this.logger.log(`Getting gallery for startup ${startupId}`);
    try {
      const photos = await this.profileService.getGallery(startupId, category);
      return {
        success: true,
        data: photos,
        count: photos.length,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('gallery')
  @HttpCode(HttpStatus.CREATED)
  async addPhoto(
    @Param('startupId') startupId: string,
    @Body() photoData: CreatePhotoRequest,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`Adding photo to startup ${startupId} by user ${userId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (!photoData.title || !photoData.imageUrl || !photoData.category) {
      throw new BadRequestException('Title, imageUrl, and category are required');
    }

    try {
      const photo = await this.profileService.addPhoto(startupId, photoData);
      return {
        success: true,
        data: photo,
        message: 'Photo added successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put('gallery/:photoId')
  async updatePhoto(
    @Param('startupId') startupId: string,
    @Param('photoId') photoId: string,
    @Body() updateData: UpdatePhotoRequest,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`Updating photo ${photoId} by user ${userId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const updated = await this.profileService.updatePhoto(startupId, photoId, updateData);
      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete('gallery/:photoId')
  async deletePhoto(
    @Param('startupId') startupId: string,
    @Param('photoId') photoId: string,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`Deleting photo ${photoId} by user ${userId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      await this.profileService.deletePhoto(startupId, photoId);
      return {
        success: true,
        message: 'Photo deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('gallery/reorder')
  async reorderPhotos(
    @Param('startupId') startupId: string,
    @Body() reorderData: ReorderPhotosRequest,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`Reordering photos for startup ${startupId} by user ${userId}`);

    if (!userId || !reorderData.photoIds) {
      throw new BadRequestException('User ID and photo IDs are required');
    }

    try {
      await this.profileService.reorderPhotos(startupId, reorderData.photoIds);
      return {
        success: true,
        message: 'Photos reordered successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('gallery/:photoId/like')
  async likePhoto(
    @Param('startupId') startupId: string,
    @Param('photoId') photoId: string,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`User ${userId} liked photo ${photoId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const updated = await this.profileService.togglePhotoLike(photoId, true);
      return {
        success: true,
        data: updated,
        message: 'Photo liked',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('gallery/:photoId/unlike')
  async unlikePhoto(
    @Param('startupId') startupId: string,
    @Param('photoId') photoId: string,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`User ${userId} unliked photo ${photoId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const updated = await this.profileService.togglePhotoLike(photoId, false);
      return {
        success: true,
        data: updated,
        message: 'Photo unliked',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ==================== VERIFICATION ENDPOINTS ====================

  @Get('verification')
  async getVerificationStatus(@Param('startupId') startupId: string) {
    this.logger.log(`Getting verification status for startup ${startupId}`);
    try {
      const status = await this.profileService.getVerificationStatus(startupId);
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('verification/email')
  async startEmailVerification(
    @Param('startupId') startupId: string,
    @Body() request: StartEmailVerificationRequest,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`Starting email verification for startup ${startupId} by user ${userId}`);

    if (!userId || !request.email) {
      throw new BadRequestException('User ID and email are required');
    }

    try {
      const result = await this.profileService.startEmailVerification(startupId, request.email);
      return {
        success: true,
        data: result,
        message: 'Email verification started. Check your email for confirmation.',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('verification/email/confirm')
  async confirmEmailVerification(
    @Param('startupId') startupId: string,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`Confirming email verification for startup ${startupId} by user ${userId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const result = await this.profileService.confirmEmailVerification(startupId);
      return {
        success: true,
        data: result,
        message: 'Email verified successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('verification/documents')
  async submitDocuments(
    @Param('startupId') startupId: string,
    @Body() request: SubmitDocumentsRequest,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`Submitting documents for startup ${startupId} by user ${userId}`);

    if (!userId || !request.registrationNumber || !request.documentUrl) {
      throw new BadRequestException('User ID, registration number, and document URL are required');
    }

    try {
      const result = await this.profileService.submitDocuments(
        startupId,
        request.registrationNumber,
        request.documentUrl,
      );
      return {
        success: true,
        data: result,
        message: 'Documents submitted for verification',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('verification/approve')
  async approveVerification(
    @Param('startupId') startupId: string,
    @Body() request: ApproveVerificationRequest,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`Admin approving verification for startup ${startupId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const result = await this.profileService.approveVerification(
        startupId,
        userId,
        request.notes,
      );
      return {
        success: true,
        data: result,
        message: 'Startup verified successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('verification/reject')
  async rejectVerification(
    @Param('startupId') startupId: string,
    @Body() request: RejectVerificationRequest,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`Admin rejecting verification for startup ${startupId}`);

    if (!userId || !request.reason) {
      throw new BadRequestException('User ID and rejection reason are required');
    }

    try {
      const result = await this.profileService.rejectVerification(
        startupId,
        userId,
        request.reason,
      );
      return {
        success: true,
        data: result,
        message: 'Verification rejected',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ==================== HELPER METHODS ====================

  private getMissingItems(profile: any): string[] {
    const missing = [];

    if (!profile.startup.description) missing.push('Company description');
    if (!profile.startup.mission) missing.push('Mission statement');
    if (!profile.startup.vision) missing.push('Vision statement');
    if (!profile.startup.values?.length) missing.push('Company values');
    if (profile.teamMembers.length === 0) missing.push('Team members');
    if (profile.teamMembers.length < 3) missing.push('At least 3 team members');
    if (profile.photos.length === 0) missing.push('Company photos');
    if (profile.photos.length < 5) missing.push('At least 5 photos');
    if (!profile.verification?.status === 'VERIFIED') missing.push('Startup verification');

    return missing;
  }

  private getNextSteps(profile: any): string[] {
    const steps = [];

    if (profile.profileCompleteness < 30) {
      steps.push('Complete basic information (name, description, mission)');
    }
    if (profile.teamMembers.length === 0) {
      steps.push('Add your founding team members');
    }
    if (profile.photos.length === 0) {
      steps.push('Upload company and team photos');
    }
    if (!profile.verification?.emailVerified) {
      steps.push('Verify your company email');
    }
    if (!profile.verification?.status === 'VERIFIED') {
      steps.push('Submit documents for verification');
    }
    if (profile.profileCompleteness < 80) {
      steps.push('Complete remaining profile details');
    }

    return steps;
  }
}
