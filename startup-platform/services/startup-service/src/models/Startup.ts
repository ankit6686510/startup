import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { StartupStatus, StartupStage, Industry, DataSource } from '@startup-platform/types';
import { Founder } from './Founder';
import { StartupMetrics } from './StartupMetrics';

@Entity('startups')
@Index(['industry', 'status'])
@Index(['location_country', 'status'])
@Index(['founded_year'])
@Index(['total_funding'])
export class Startup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  @Index()
  name: string;

  @Column({ length: 200, unique: true })
  @Index()
  slug: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  vision?: string;

  @Column('text', { nullable: true })
  mission?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;

  @Column({
    type: 'enum',
    enum: Industry
  })
  @Index()
  industry: Industry;

  @Column({
    type: 'enum',
    enum: StartupStatus,
    default: StartupStatus.ACTIVE
  })
  @Index()
  status: StartupStatus;

  @Column({
    type: 'enum',
    enum: StartupStage
  })
  stage: StartupStage;

  @Column({ name: 'founded_year' })
  @Index()
  foundedYear: number;

  // Location fields
  @Column({ name: 'location_country' })
  @Index()
  locationCountry: string;

  @Column({ name: 'location_country_code', length: 2 })
  locationCountryCode: string;

  @Column({ name: 'location_city', nullable: true })
  locationCity?: string;

  @Column({ name: 'location_state', nullable: true })
  locationState?: string;

  @Column({ name: 'location_region', nullable: true })
  locationRegion?: string;

  @Column({ name: 'location_is_remote', default: false })
  locationIsRemote: boolean;

  @Column({ name: 'location_latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
  locationLatitude?: number;

  @Column({ name: 'location_longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
  locationLongitude?: number;

  @Column({ name: 'employee_count', nullable: true })
  employeeCount?: number;

  @Column({ type: 'bigint', nullable: true })
  @Index()
  valuation?: number;

  @Column({ name: 'total_funding', type: 'bigint', nullable: true })
  @Index()
  totalFunding?: number;

  @Column({
    name: 'data_source',
    type: 'enum',
    enum: DataSource,
    default: DataSource.MANUAL
  })
  dataSource: DataSource;

  @Column({ default: false })
  @Index()
  verified: boolean;

  @Column({ name: 'claimed_by', nullable: true })
  claimedBy?: string;

  // Social links as JSON
  @Column('jsonb', { name: 'social_links', nullable: true })
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    github?: string;
    productHunt?: string;
    crunchbase?: string;
    angelList?: string;
  };

  @Column('text', { array: true, default: '{}' })
  tags: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Founder, founder => founder.startup, { cascade: true })
  founders: Founder[];

  @OneToMany(() => StartupMetrics, metrics => metrics.startup)
  metrics: StartupMetrics[];

  // Virtual getters for location object
  get location() {
    return {
      country: this.locationCountry,
      countryCode: this.locationCountryCode,
      city: this.locationCity,
      state: this.locationState,
      region: this.locationRegion,
      isRemote: this.locationIsRemote,
      coordinates: this.locationLatitude && this.locationLongitude ? {
        latitude: Number(this.locationLatitude),
        longitude: Number(this.locationLongitude)
      } : undefined
    };
  }

  // Setter for location object
  set location(location: any) {
    this.locationCountry = location.country;
    this.locationCountryCode = location.countryCode;
    this.locationCity = location.city;
    this.locationState = location.state;
    this.locationRegion = location.region;
    this.locationIsRemote = location.isRemote || false;
    if (location.coordinates) {
      this.locationLatitude = location.coordinates.latitude;
      this.locationLongitude = location.coordinates.longitude;
    }
  }
}
