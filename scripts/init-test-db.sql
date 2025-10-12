-- Initialize test database with required extensions and basic setup

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create test databases for each service
CREATE DATABASE user_service_test;
CREATE DATABASE job_service_test;
CREATE DATABASE funding_service_test;
CREATE DATABASE notification_service_test;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE user_service_test TO postgres;
GRANT ALL PRIVILEGES ON DATABASE job_service_test TO postgres;
GRANT ALL PRIVILEGES ON DATABASE funding_service_test TO postgres;
GRANT ALL PRIVILEGES ON DATABASE notification_service_test TO postgres;

-- Connect to each database and create extensions
\c user_service_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c job_service_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c funding_service_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c notification_service_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Switch back to main test database
\c startup_compass_test;

-- Create test data cleanup function
CREATE OR REPLACE FUNCTION cleanup_test_data()
RETURNS void AS $$
BEGIN
    -- This function can be called to clean up test data
    -- Add cleanup logic here as needed
    RAISE NOTICE 'Test data cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- Create test user for application
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'test_app_user') THEN
        CREATE ROLE test_app_user WITH LOGIN PASSWORD 'test_password';
    END IF;
END
$$;

-- Grant necessary permissions to test user
GRANT CONNECT ON DATABASE startup_compass_test TO test_app_user;
GRANT CONNECT ON DATABASE user_service_test TO test_app_user;
GRANT CONNECT ON DATABASE job_service_test TO test_app_user;
GRANT CONNECT ON DATABASE funding_service_test TO test_app_user;
GRANT CONNECT ON DATABASE notification_service_test TO test_app_user;

-- Create schemas for testing
CREATE SCHEMA IF NOT EXISTS test_data;
GRANT USAGE ON SCHEMA test_data TO test_app_user;
GRANT CREATE ON SCHEMA test_data TO test_app_user;

-- Log initialization completion
INSERT INTO pg_stat_statements_info (dealloc) VALUES (0) ON CONFLICT DO NOTHING;

-- Create a simple health check table
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'healthy',
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial health check records
INSERT INTO health_check (service_name, status) VALUES 
    ('database', 'healthy'),
    ('test_setup', 'completed')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_health_check_service ON health_check(service_name);
CREATE INDEX IF NOT EXISTS idx_health_check_status ON health_check(status);

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Test database initialization completed successfully';
    RAISE NOTICE 'Available databases: startup_compass_test, user_service_test, job_service_test, funding_service_test, notification_service_test';
    RAISE NOTICE 'Test user created: test_app_user';
END
$$;