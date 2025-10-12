// Startup related enums
export enum StartupStatus {
  ACTIVE = 'active',
  ACQUIRED = 'acquired',
  CLOSED = 'closed',
  STEALTH = 'stealth'
}

export enum StartupStage {
  IDEA = 'idea',
  MVP = 'mvp',
  GROWTH = 'growth',
  MATURE = 'mature',
  SCALING = 'scaling'
}

export enum Industry {
  AI_ML = 'ai_ml',
  FINTECH = 'fintech',
  EDTECH = 'edtech',
  HEALTHTECH = 'healthtech',
  SAAS = 'saas',
  ECOMMERCE = 'ecommerce',
  MOBILITY = 'mobility',
  GAMING = 'gaming',
  CRYPTO = 'crypto',
  AGTECH = 'agtech',
  FOODTECH = 'foodtech',
  PROPTECH = 'proptech',
  CLEANTECH = 'cleantech',
  BIOTECH = 'biotech',
  HARDWARE = 'hardware',
  ENTERPRISE = 'enterprise',
  CONSUMER = 'consumer',
  OTHER = 'other'
}

// Funding related enums
export enum FundingRound {
  PRE_SEED = 'pre_seed',
  SEED = 'seed',
  SERIES_A = 'series_a',
  SERIES_B = 'series_b',
  SERIES_C = 'series_c',
  SERIES_D = 'series_d',
  SERIES_E = 'series_e',
  SERIES_F = 'series_f',
  BRIDGE = 'bridge',
  GROWTH = 'growth',
  IPO = 'ipo',
  DEBT = 'debt',
  GRANT = 'grant',
  BOOTSTRAPPED = 'bootstrapped'
}

export enum InvestorType {
  ANGEL = 'angel',
  VC = 'vc',
  CORPORATE = 'corporate',
  GOVERNMENT = 'government',
  ACCELERATOR = 'accelerator',
  FAMILY_OFFICE = 'family_office',
  HEDGE_FUND = 'hedge_fund',
  PRIVATE_EQUITY = 'private_equity',
  CROWDFUNDING = 'crowdfunding'
}

// Job related enums
export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  FREELANCE = 'freelance'
}

export enum WorkLocation {
  REMOTE = 'remote',
  ONSITE = 'onsite',
  HYBRID = 'hybrid'
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  PRINCIPAL = 'principal',
  DIRECTOR = 'director',
  VP = 'vp',
  C_LEVEL = 'c_level'
}

export enum JobCategory {
  ENGINEERING = 'engineering',
  PRODUCT = 'product',
  DESIGN = 'design',
  MARKETING = 'marketing',
  SALES = 'sales',
  OPERATIONS = 'operations',
  FINANCE = 'finance',
  HR = 'hr',
  LEGAL = 'legal',
  CUSTOMER_SUCCESS = 'customer_success',
  DATA = 'data',
  RESEARCH = 'research',
  BUSINESS_DEVELOPMENT = 'business_development',
  OTHER = 'other'
}

// User related enums
export enum UserRole {
  USER = 'user',
  FOUNDER = 'founder',
  INVESTOR = 'investor',
  RECRUITER = 'recruiter',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

// News and update types
export enum NewsType {
  FUNDING = 'funding',
  ACQUISITION = 'acquisition',
  PRODUCT_LAUNCH = 'product_launch',
  PARTNERSHIP = 'partnership',
  HIRING = 'hiring',
  AWARD = 'award',
  PIVOT = 'pivot',
  SHUTDOWN = 'shutdown',
  IPO = 'ipo',
  GENERAL = 'general'
}

// Data source enums
export enum DataSource {
  MANUAL = 'manual',
  SCRAPED = 'scraped',
  API = 'api',
  USER_SUBMITTED = 'user_submitted',
  VERIFIED = 'verified'
}

// Currency enum
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  INR = 'INR',
  GBP = 'GBP',
  CAD = 'CAD',
  AUD = 'AUD',
  SGD = 'SGD',
  JPY = 'JPY',
  CNY = 'CNY'
}
