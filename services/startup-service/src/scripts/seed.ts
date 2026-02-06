import 'dotenv/config';
import { AppDataSource } from '../config/database';
import { Startup } from '../models/Startup';
import { Founder } from '../models/Founder';
import { StartupMetrics } from '../models/StartupMetrics';
import { logger } from '../utils/logger';
import {
  Industry,
  StartupStatus,
  StartupStage,
  FundingRound,
  DataSource,
} from '@startup-platform/types';
import { v4 as uuidv4 } from 'uuid';

const sampleStartups = [
  {
    name: 'TechVision AI',
    slug: 'techvision-ai',
    description:
      'Revolutionary AI platform that transforms business operations through intelligent automation and predictive analytics.',
    website: 'https://techvision-ai.com',
    industry: Industry.AI_ML,
    foundedYear: 2021,
    vision: 'To democratize AI and make it accessible to every business',
    mission: 'Building intelligent solutions that empower businesses to make data-driven decisions',
    logoUrl: 'https://via.placeholder.com/200x200?text=TechVision',
    socialLinks: {
      linkedin: 'https://linkedin.com/company/techvision-ai',
      twitter: 'https://twitter.com/techvision_ai',
    },
    locationCountry: 'United States',
    locationCountryCode: 'US',
    locationCity: 'San Francisco',
    locationState: 'California',
    locationRegion: 'North America',
    locationIsRemote: false,
    locationLatitude: 37.7749,
    locationLongitude: -122.4194,
    totalFunding: 5000000,
    stage: StartupStage.GROWTH,
    status: StartupStatus.ACTIVE,
    employeeCount: 25,
    tags: ['AI', 'Machine Learning', 'Enterprise Software'],
    dataSource: DataSource.USER_SUBMITTED,
    verified: true,
    founders: [
      {
        name: 'Sarah Chen',
        title: 'CEO & Co-founder',
        bio: 'Former Google AI researcher with 10+ years experience in machine learning',
        email: 'sarah@techvision-ai.com',
        linkedinUrl: 'https://linkedin.com/in/sarahchen',
        isPrimary: true,
        equity: 35.5,
      },
      {
        name: 'David Rodriguez',
        title: 'CTO & Co-founder',
        bio: 'Ex-Tesla engineer, expert in scalable AI infrastructure',
        email: 'david@techvision-ai.com',
        linkedinUrl: 'https://linkedin.com/in/davidrodriguez',
        isPrimary: false,
        equity: 32.0,
      },
    ],
  },
  {
    name: 'GreenTech Solutions',
    slug: 'greentech-solutions',
    description:
      'Sustainable technology company developing innovative solutions for renewable energy and carbon reduction.',
    website: 'https://greentech-solutions.com',
    industry: Industry.CLEANTECH,
    foundedYear: 2020,
    vision: 'Creating a sustainable future through innovative clean technology',
    mission: 'Accelerating the transition to renewable energy with cutting-edge solutions',
    logoUrl: 'https://via.placeholder.com/200x200?text=GreenTech',
    socialLinks: {
      linkedin: 'https://linkedin.com/company/greentech-solutions',
      twitter: 'https://twitter.com/greentech_sol',
    },
    locationCountry: 'Germany',
    locationCountryCode: 'DE',
    locationCity: 'Berlin',
    locationState: 'Berlin',
    locationRegion: 'Europe',
    locationIsRemote: true,
    locationLatitude: 52.52,
    locationLongitude: 13.405,
    totalFunding: 12000000,
    stage: StartupStage.SCALING,
    status: StartupStatus.ACTIVE,
    employeeCount: 45,
    tags: ['Clean Energy', 'Sustainability', 'Carbon Reduction'],
    dataSource: DataSource.SCRAPED,
    verified: true,
    founders: [
      {
        name: 'Anna Mueller',
        title: 'Founder & CEO',
        bio: 'Environmental engineer passionate about climate solutions',
        email: 'anna@greentech-solutions.com',
        linkedinUrl: 'https://linkedin.com/in/annamueller',
        isPrimary: true,
        equity: 45.0,
      },
    ],
  },
  {
    name: 'HealthBot',
    slug: 'healthbot',
    description:
      'AI-powered healthcare assistant providing personalized medical guidance and appointment scheduling.',
    website: 'https://healthbot.io',
    industry: Industry.HEALTHTECH,
    foundedYear: 2022,
    vision: 'Making healthcare accessible and personalized for everyone',
    mission: 'Leveraging AI to improve patient outcomes and healthcare efficiency',
    logoUrl: 'https://via.placeholder.com/200x200?text=HealthBot',
    socialLinks: {
      linkedin: 'https://linkedin.com/company/healthbot-ai',
      twitter: 'https://twitter.com/healthbot_ai',
    },
    locationCountry: 'Canada',
    locationCountryCode: 'CA',
    locationCity: 'Toronto',
    locationState: 'Ontario',
    locationRegion: 'North America',
    locationIsRemote: false,
    locationLatitude: 43.6532,
    locationLongitude: -79.3832,
    totalFunding: 2500000,
    stage: StartupStage.MVP,
    status: StartupStatus.ACTIVE,
    employeeCount: 12,
    tags: ['Healthcare', 'AI', 'Telemedicine'],
    dataSource: DataSource.API,
    verified: false,
    founders: [
      {
        name: 'Dr. Michael Thompson',
        title: 'CEO & Co-founder',
        bio: 'Medical doctor turned entrepreneur, specializing in digital health',
        email: 'michael@healthbot.io',
        linkedinUrl: 'https://linkedin.com/in/drmichaelthompson',
        isPrimary: true,
        equity: 40.0,
      },
      {
        name: 'Lisa Park',
        title: 'CTO & Co-founder',
        bio: 'Software engineer with expertise in healthcare systems',
        email: 'lisa@healthbot.io',
        linkedinUrl: 'https://linkedin.com/in/lisapark',
        isPrimary: false,
        equity: 35.0,
      },
    ],
  },
  {
    name: 'EduLearn Platform',
    slug: 'edulearn-platform',
    description:
      'Interactive online learning platform with AI-powered personalized curriculum and progress tracking.',
    website: 'https://edulearn.com',
    industry: Industry.EDTECH,
    foundedYear: 2019,
    vision: 'Revolutionizing education through personalized learning experiences',
    mission: 'Empowering learners worldwide with adaptive, engaging educational content',
    logoUrl: 'https://via.placeholder.com/200x200?text=EduLearn',
    socialLinks: {
      linkedin: 'https://linkedin.com/company/edulearn-platform',
      twitter: 'https://twitter.com/edulearn',
    },
    locationCountry: 'India',
    locationCountryCode: 'IN',
    locationCity: 'Bangalore',
    locationState: 'Karnataka',
    locationRegion: 'Asia',
    locationIsRemote: true,
    locationLatitude: 12.9716,
    locationLongitude: 77.5946,
    totalFunding: 8500000,
    stage: StartupStage.GROWTH,
    status: StartupStatus.ACTIVE,
    employeeCount: 65,
    tags: ['Education', 'E-Learning', 'Personalization'],
    dataSource: DataSource.MANUAL,
    verified: true,
    founders: [
      {
        name: 'Rajesh Kumar',
        title: 'Founder & CEO',
        bio: 'Former educator with passion for technology-enhanced learning',
        email: 'rajesh@edulearn.com',
        linkedinUrl: 'https://linkedin.com/in/rajeshkumar',
        isPrimary: true,
        equity: 50.0,
      },
    ],
  },
  {
    name: 'CryptoWallet Pro',
    slug: 'cryptowallet-pro',
    description:
      'Secure, user-friendly cryptocurrency wallet with advanced trading features and DeFi integration.',
    website: 'https://cryptowallet-pro.com',
    industry: Industry.FINTECH,
    foundedYear: 2021,
    vision: 'Making cryptocurrency accessible and secure for mainstream adoption',
    mission: 'Building the most trusted and feature-rich crypto wallet experience',
    logoUrl: 'https://via.placeholder.com/200x200?text=CryptoWallet',
    socialLinks: {
      linkedin: 'https://linkedin.com/company/cryptowallet-pro',
      twitter: 'https://twitter.com/cryptowallet_pro',
    },
    locationCountry: 'Singapore',
    locationCountryCode: 'SG',
    locationCity: 'Singapore',
    locationState: 'Singapore',
    locationRegion: 'Asia',
    locationIsRemote: false,
    locationLatitude: 1.3521,
    locationLongitude: 103.8198,
    totalFunding: 15000000,
    stage: StartupStage.MATURE,
    status: StartupStatus.ACTIVE,
    employeeCount: 35,
    tags: ['Blockchain', 'Cryptocurrency', 'DeFi'],
    dataSource: DataSource.VERIFIED,
    verified: true,
    founders: [
      {
        name: 'Alex Kim',
        title: 'CEO & Co-founder',
        bio: 'Blockchain expert and former Goldman Sachs analyst',
        email: 'alex@cryptowallet-pro.com',
        linkedinUrl: 'https://linkedin.com/in/alexkim',
        isPrimary: true,
        equity: 42.0,
      },
      {
        name: 'Emily Zhang',
        title: 'Head of Security & Co-founder',
        bio: 'Cybersecurity specialist with focus on cryptocurrency security',
        email: 'emily@cryptowallet-pro.com',
        linkedinUrl: 'https://linkedin.com/in/emilyzhang',
        isPrimary: false,
        equity: 38.0,
      },
    ],
  },
];

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection established');

    // Clear existing data
    await AppDataSource.getRepository(StartupMetrics).delete({});
    await AppDataSource.getRepository(Founder).delete({});
    await AppDataSource.getRepository(Startup).delete({});
    logger.info('Cleared existing data');

    const startupRepository = AppDataSource.getRepository(Startup);
    const founderRepository = AppDataSource.getRepository(Founder);
    const metricsRepository = AppDataSource.getRepository(StartupMetrics);

    // Create startups with founders
    for (const startupData of sampleStartups) {
      const { founders, ...startup } = startupData;

      // Create startup
      const startupEntity = startupRepository.create({
        id: uuidv4(),
        ...startup,
      });
      const savedStartup = await startupRepository.save(startupEntity);
      logger.info(`Created startup: ${savedStartup.name}`);

      // Create founders
      for (const founderData of founders) {
        const founderEntity = founderRepository.create({
          id: uuidv4(),
          ...founderData,
          startupId: savedStartup.id,
        });
        await founderRepository.save(founderEntity);
        logger.info(`Created founder: ${founderEntity.name}`);
      }

      // Create sample metrics
      const metricsData = [
        {
          startupId: savedStartup.id,
          metricDate: new Date('2024-01-01'),
          revenue: Math.floor(Math.random() * 1000000),
          users: Math.floor(Math.random() * 50000),
          activeUsers: Math.floor(Math.random() * 25000),
          employees: startup.employeeCount,
          dataSource: DataSource.MANUAL,
        },
        {
          startupId: savedStartup.id,
          metricDate: new Date('2024-06-01'),
          revenue: Math.floor(Math.random() * 2000000),
          users: Math.floor(Math.random() * 100000),
          activeUsers: Math.floor(Math.random() * 50000),
          employees: startup.employeeCount + Math.floor(Math.random() * 10),
          dataSource: DataSource.MANUAL,
        },
      ];

      for (const metricData of metricsData) {
        const metricEntity = metricsRepository.create({
          id: uuidv4(),
          ...metricData,
        });
        await metricsRepository.save(metricEntity);
      }
    }

    logger.info(`Successfully seeded ${sampleStartups.length} startups with founders and metrics`);

    // Log summary
    const startupCount = await startupRepository.count();
    const founderCount = await founderRepository.count();
    const metricsCount = await metricsRepository.count();

    logger.info(`Database seeding completed:`);
    logger.info(`- Startups: ${startupCount}`);
    logger.info(`- Founders: ${founderCount}`);
    logger.info(`- Metrics: ${metricsCount}`);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
