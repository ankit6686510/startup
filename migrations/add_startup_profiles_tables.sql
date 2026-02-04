-- Migration: Add Startup Profiles Tables
-- Run this SQL directly in your PostgreSQL database

-- 1. Team Members Table
CREATE TABLE IF NOT EXISTS startup_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  title VARCHAR(100) NOT NULL,
  role VARCHAR NOT NULL,
  bio TEXT,
  email VARCHAR,
  phone VARCHAR,
  profile_image_url VARCHAR,
  linkedin_url VARCHAR,
  twitter_url VARCHAR,
  github_url VARCHAR,
  personal_website VARCHAR,
  background TEXT,
  expertise TEXT[],
  education TEXT[],
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_startup_team_startup_id ON startup_team(startup_id);
CREATE INDEX idx_startup_team_order ON startup_team(order_index);

-- 2. Photo Gallery Table
CREATE TABLE IF NOT EXISTS startup_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  caption TEXT,
  category VARCHAR NOT NULL,
  image_url VARCHAR NOT NULL,
  thumbnail_url VARCHAR,
  alt_text VARCHAR,
  width INTEGER,
  height INTEGER,
  mime_type VARCHAR,
  file_size INTEGER,
  order_index INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  uploaded_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_photos_startup_id ON startup_photos(startup_id);
CREATE INDEX idx_startup_photos_category ON startup_photos(category);
CREATE INDEX idx_startup_photos_order ON startup_photos(order_index);

-- 3. Verification Table
CREATE TABLE IF NOT EXISTS startup_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL UNIQUE REFERENCES startups(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL,
  verification_types TEXT[],
  company_email VARCHAR,
  company_email_domain VARCHAR,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  registration_number VARCHAR,
  registration_document_url VARCHAR,
  documents_verified BOOLEAN DEFAULT false,
  documents_verified_at TIMESTAMP,
  linkedin_company_id VARCHAR,
  linkedin_verified BOOLEAN DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  rejection_reason TEXT,
  rejection_count INTEGER DEFAULT 0,
  last_rejection_at TIMESTAMP,
  verification_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verifications_startup_id ON startup_verifications(startup_id);
CREATE INDEX idx_verifications_status ON startup_verifications(status);

-- 4. Follows/Bookmarks Table
CREATE TABLE IF NOT EXISTS startup_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(startup_id, user_id)
);

CREATE INDEX idx_follows_startup_id ON startup_follows(startup_id);
CREATE INDEX idx_follows_user_id ON startup_follows(user_id);
CREATE INDEX idx_follows_created_at ON startup_follows(created_at DESC);

-- 5. Add new columns to existing startups table (if they don't exist)
ALTER TABLE startups ADD COLUMN IF NOT EXISTS mission TEXT;
ALTER TABLE startups ADD COLUMN IF NOT EXISTS company_values TEXT[];
ALTER TABLE startups ADD COLUMN IF NOT EXISTS culture TEXT;
ALTER TABLE startups ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE startups ADD COLUMN IF NOT EXISTS follow_count INTEGER DEFAULT 0;
ALTER TABLE startups ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- 6. Create indexes for search and discovery
CREATE INDEX IF NOT EXISTS idx_startups_view_count ON startups(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_startups_follow_count ON startups(follow_count DESC);
CREATE INDEX IF NOT EXISTS idx_startups_verified ON startups(verified);
CREATE INDEX IF NOT EXISTS idx_startups_stage ON startups(stage);
CREATE INDEX IF NOT EXISTS idx_startups_location ON startups(location);
CREATE INDEX IF NOT EXISTS idx_startups_industry ON startups(industry);

-- 7. Full-text search index on startups
CREATE INDEX IF NOT EXISTS idx_startups_search ON startups USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('startup_team', 'startup_photos', 'startup_verifications', 'startup_follows')
ORDER BY table_name;
