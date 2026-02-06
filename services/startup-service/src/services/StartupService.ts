import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { StartupRepository } from '../repositories/StartupRepository';
import { Startup } from '../models/Startup';
import { Founder } from '../models/Founder';
import {
  CreateStartupRequest,
  UpdateStartupRequest,
  GetStartupsRequest,
  PaginatedResponse,
  StartupSummary,
  GetStartupResponse,
  Industry,
  DataSource,
  StartupStage,
} from '@startup-platform/types';
import { ValidationError, NotFoundError, ConflictError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { KafkaProducer, KAFKA_TOPICS, StartupCreatedEvent, StartupUpdatedEvent, StartupDeletedEvent } from '@startup/kafka-client';

export class StartupService {
  private startupRepository: StartupRepository;
  private kafkaProducer: KafkaProducer;

  constructor() {
    this.startupRepository = new StartupRepository();

    // Initialize Kafka producer
    this.kafkaProducer = new KafkaProducer({
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      clientId: 'startup-service',
      logger: logger,
    });

    // Connect to Kafka
    this.kafkaProducer.connect().catch((error: any) => {
      logger.error('Failed to connect Kafka producer in StartupService', error);
    });
  }

  async getAllStartups(params: GetStartupsRequest): Promise<PaginatedResponse<StartupSummary>> {
    try {
      logger.info('Fetching startups with params:', params);
      return await this.startupRepository.findAll(params);
    } catch (error) {
      logger.error('Error fetching startups:', error);
      throw error;
    }
  }

  async getStartupById(id: string): Promise<GetStartupResponse> {
    if (!this.isValidUuid(id)) {
      throw new ValidationError('Invalid startup ID format');
    }

    const startup = await this.startupRepository.findById(id, ['founders', 'metrics']);
    if (!startup) {
      throw new NotFoundError('Startup not found');
    }

    return {
      startup: startup as any,
      founders: startup.founders || [],
      metrics: startup.metrics || [],
    };
  }

  async getStartupBySlug(slug: string): Promise<GetStartupResponse> {
    if (!slug || slug.trim().length === 0) {
      throw new ValidationError('Slug is required');
    }

    const startup = await this.startupRepository.findBySlug(slug, ['founders', 'metrics']);
    if (!startup) {
      throw new NotFoundError('Startup not found');
    }

    return {
      startup: startup as any,
      founders: startup.founders || [],
      metrics: startup.metrics || [],
    };
  }

  async createStartup(data: CreateStartupRequest): Promise<Startup> {
    try {
      // Validate required fields
      this.validateCreateRequest(data);

      // Generate slug
      const slug = await this.generateUniqueSlug(data.name);

      // Prepare startup data
      const startupData: Partial<Startup> = {
        id: uuidv4(),
        name: data.name.trim(),
        slug,
        description: data.description.trim(),
        website: data.website,
        industry: data.industry,
        stage: (data as any).stage || StartupStage.MVP,
        foundedYear: data.foundedYear,
        vision: data.vision,
        mission: data.mission,
        logoUrl: data.logoUrl,
        socialLinks: data.socialLinks,
        dataSource: DataSource.USER_SUBMITTED,
        verified: false,
      };

      // Set location
      if (data.location) {
        startupData.locationCountry = data.location.country;
        startupData.locationCountryCode = data.location.countryCode;
        startupData.locationCity = data.location.city;
        startupData.locationState = data.location.state;
        startupData.locationRegion = data.location.region;
        startupData.locationIsRemote = data.location.isRemote || false;
        if (data.location.coordinates) {
          startupData.locationLatitude = data.location.coordinates.latitude;
          startupData.locationLongitude = data.location.coordinates.longitude;
        }
      }

      // Prepare founders data
      const foundersData: Partial<Founder>[] = data.founders.map((founder) => ({
        id: uuidv4(),
        name: founder.name.trim(),
        title: founder.title.trim(),
        bio: founder.bio,
        email: founder.email,
        linkedinUrl: founder.linkedinUrl,
        twitterUrl: founder.twitterUrl,
        imageUrl: founder.imageUrl,
        isPrimary: founder.isPrimary || false,
        equity: founder.equity,
      }));

      // Ensure at least one primary founder
      if (!foundersData.some((f) => f.isPrimary)) {
        foundersData[0].isPrimary = true;
      }

      const startup = await this.startupRepository.create(startupData, foundersData);

      // Publish StartupCreatedEvent to Kafka
      try {
        await this.kafkaProducer.publish<StartupCreatedEvent>(
          KAFKA_TOPICS.STARTUP_EVENTS,
          {
            eventType: 'StartupCreated',
            data: {
              startupId: startup.id,
              name: startup.name,
              founderId: foundersData.find(f => f.isPrimary)?.id || foundersData[0]?.id || '',
              industry: startup.industry,
              stage: startup.stage,
            },
          },
          {
            key: startup.id, // Partition by startupId
          },
        );
        logger.info(`StartupCreatedEvent published for startup: ${startup.name}`);
      } catch (error) {
        logger.error('Failed to publish StartupCreatedEvent', error);
      }

      logger.info(`Created startup: ${startup.name} (${startup.id})`);
      return startup;
    } catch (error) {
      logger.error('Error creating startup:', error);
      throw error;
    }
  }

  async updateStartup(id: string, data: UpdateStartupRequest): Promise<Startup> {
    if (!this.isValidUuid(id)) {
      throw new ValidationError('Invalid startup ID format');
    }

    const existingStartup = await this.startupRepository.findById(id);
    if (!existingStartup) {
      throw new NotFoundError('Startup not found');
    }

    try {
      const updates: Partial<Startup> = {};

      // Update basic fields
      if (data.name) {
        updates.name = data.name.trim();
        // Generate new slug if name changed
        if (data.name !== existingStartup.name) {
          updates.slug = await this.generateUniqueSlug(data.name, id);
        }
      }

      if (data.description) updates.description = data.description.trim();
      if (data.website) updates.website = data.website;
      if (data.industry) updates.industry = data.industry;
      if (data.foundedYear) updates.foundedYear = data.foundedYear;
      if (data.vision) updates.vision = data.vision;
      if (data.mission) updates.mission = data.mission;
      if (data.logoUrl) updates.logoUrl = data.logoUrl;
      if (data.socialLinks) updates.socialLinks = data.socialLinks;

      // Update location
      if (data.location) {
        updates.locationCountry = data.location.country;
        updates.locationCountryCode = data.location.countryCode;
        updates.locationCity = data.location.city;
        updates.locationState = data.location.state;
        updates.locationRegion = data.location.region;
        updates.locationIsRemote = data.location.isRemote || false;
        if (data.location.coordinates) {
          updates.locationLatitude = data.location.coordinates.latitude;
          updates.locationLongitude = data.location.coordinates.longitude;
        }
      }

      const updatedStartup = await this.startupRepository.update(id, updates);

      logger.info(`Updated startup: ${id}`);
      return updatedStartup!;
    } catch (error) {
      logger.error('Error updating startup:', error);
      throw error;
    }
  }

  async deleteStartup(id: string): Promise<void> {
    if (!this.isValidUuid(id)) {
      throw new ValidationError('Invalid startup ID format');
    }

    const exists = await this.startupRepository.findById(id);
    if (!exists) {
      throw new NotFoundError('Startup not found');
    }

    const deleted = await this.startupRepository.delete(id);
    if (!deleted) {
      throw new Error('Failed to delete startup');
    }

    logger.info(`Deleted startup: ${id}`);
  }

  async getStartupsByIndustry(industry: Industry, limit: number = 10): Promise<Startup[]> {
    return this.startupRepository.findByIndustry(industry, limit);
  }

  async getFeaturedStartups(limit: number = 5): Promise<Startup[]> {
    return this.startupRepository.findFeatured(limit);
  }

  async getStartupStats(): Promise<{
    total: number;
    verified: number;
    byIndustry: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    return this.startupRepository.getStartupStats();
  }

  private validateCreateRequest(data: CreateStartupRequest): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Name is required', 'name');
    }

    if (data.name.length > 200) {
      throw new ValidationError('Name must be less than 200 characters', 'name');
    }

    if (!data.description || data.description.trim().length < 10) {
      throw new ValidationError('Description must be at least 10 characters', 'description');
    }

    if (data.description.length > 2000) {
      throw new ValidationError('Description must be less than 2000 characters', 'description');
    }

    if (!data.industry) {
      throw new ValidationError('Industry is required', 'industry');
    }

    if (
      !data.foundedYear ||
      data.foundedYear < 1800 ||
      data.foundedYear > new Date().getFullYear()
    ) {
      throw new ValidationError('Invalid founded year', 'foundedYear');
    }

    if (!data.location || !data.location.country) {
      throw new ValidationError('Location with country is required', 'location');
    }

    if (!data.founders || data.founders.length === 0) {
      throw new ValidationError('At least one founder is required', 'founders');
    }

    // Validate founders
    data.founders.forEach((founder, index) => {
      if (!founder.name || founder.name.trim().length === 0) {
        throw new ValidationError(
          `Founder ${index + 1} name is required`,
          `founders[${index}].name`,
        );
      }
      if (!founder.title || founder.title.trim().length === 0) {
        throw new ValidationError(
          `Founder ${index + 1} title is required`,
          `founders[${index}].title`,
        );
      }
    });
  }

  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    const baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.startupRepository.findBySlug(slug);
      if (!existing || (excludeId && existing.id === excludeId)) {
        break;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
