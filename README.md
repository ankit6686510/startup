# StartupCompass 🚀

A comprehensive startup ecosystem platform built with microservices architecture, providing real-time insights into startups, funding rounds, job opportunities, and industry news.

## 🏗️ Architecture Overview

StartupCompass is built using a microservices architecture with the following services:

### Core Services

- **API Gateway** (Port 3000) - Central routing and authentication
- **User Service** (Port 3002) - User management and authentication
- **Startup Service** (Port 3001) - Startup data management
- **Job Service** (Port 3003) - Job board and application tracking
- **Funding Service** (Port 3004) - Investment and funding round tracking
- **Notification Service** (Port 3005) - Email, push, and SMS notifications
- **News Aggregator** (Port 3006) - Real-time startup news aggregation

### Frontend

- **Next.js 14** application (Port 3000) with React 18 and TypeScript
- Modern UI with Tailwind CSS
- Real-time data fetching with React Query
- State management with Zustand

### Infrastructure

- **PostgreSQL** - Primary database for all services
- **Redis** - Caching and queue management
- **Docker Compose** - Multi-service orchestration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 6+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd startupcompass
   ```

2. **Environment Setup**
   ```bash
   # Copy environment files
   cp services/startup-service/.env.example services/startup-service/.env
   cp services/user-service/.env.example services/user-service/.env
   cp services/job-service/.env.example services/job-service/.env
   cp services/funding-service/.env.example services/funding-service/.env
   cp services/notification-service/.env.example services/notification-service/.end
   cp news-aggregator/.env.example news-aggregator/.env
   ```

3. **Start Services**
   ```bash
   docker-compose up -d
   ```

4. **Install Dependencies**
   ```bash
   npm run install:all
   ```

5. **Run Database Migrations**
   ```bash
   # Run migrations for each service
   docker-compose exec startup-service npm run migration:run
   docker-compose exec user-service npm run migration:run
   docker-compose exec job-service npm run migration:run
   docker-compose docker-compose exec funding-service npm run migration:run
   docker-compose docker-compose exec notification-service npm run migration:run
   ```

6. **Seed Data**
   ```bash
   docker-compose exec startup-service npm run seed
   ```

7. **Start Development**
   ```bash
   npm run dev
   ```

8. **Access the Application**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:3000
   - API Documentation: http://localhost:3000/api/v1

## 📚 API Documentation

### Authentication

All API endpoints require authentication except for health checks and public endpoints.

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Core Endpoints

#### Startups
```http
GET /api/v1/startups
GET /api/v1/startups/:id
POST /api/v1/startups
PUT /api/v1/startups/:id
DELETE /api/v1/startups/:id
```

#### Jobs
```http
GET /api/v1/jobs
GET /api/v1/jobs/:id
POST /api/v1/jobs
GET /api/v1/applications
POST /api/v1/applications
```

#### Funding
```http
GET /api/v1/funding
GET /api/v1/funding/:id
GET /api/v1/investors
POST /api/v1/funding
```

#### Notifications
```http
GET /api/v1/notifications
POST /api/v1/notifications
GET /api/v1/notifications/:id
POST /api/v1/notifications/:id/send
```

## 🔧 Development

### Running Services Individually

Each service can be run independently:

```bash
# API Gateway
cd services/api-gateway
npm run dev

# User Service
cd services/user-service
npm run dev

# Startup Service
cd services/startup-service
npm run dev

# Job Service
cd services/job-service
npm run dev

# Funding Service
cd services/funding-service
npm run dev

# Notification Service
cd services/notification-service
npm run dev

# News Aggregator
cd news-aggregator
npm run dev
```

### Testing

```bash
# Run all tests
npm run test

# Run tests for a specific service
npm run test --workspace=services/startup-service

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
# Run linting for all services
npm run lint

# Run linting for a specific service
npm run lint --workspace=services/startup-service

# Fix linting issues
npm run lint:fix
```

## 📊 Monitoring

### Health Checks

Each service provides health check endpoints:

- **API Gateway**: `GET /health`
- **User Service**: `GET /health`
- **Startup Service**: `GET /health`
- **Job Service**: `GET /health`
- **Funding Service**: `GET /health`
- **Notification Service**: `GET /health`
- **News Aggregator**: `GET /health`

### Detailed Health Checks

For detailed service status:

```bash
curl http://localhost:3000/health/detailed
```

### Logs

View logs for all services:

```bash
docker-compose logs -f
```

View logs for a specific service:

```bash
docker-compose logs -f api-gateway
```

## 🔒 Configuration

### Environment Variables

Key environment variables to configure:

#### Database
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`

#### Redis
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

#### Authentication
- `JWT_SECRET`, `JWT_EXPIRES_IN`

#### Email
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

#### External APIs
- `NEWSAPI_KEY`, `CRUNCHBASE_API_KEY`, `ANGELLIST_API_KEY`

## 🚀 Deployment

### Production Deployment

1. **Build Images**
   ```bash
   docker-compose build
   ```

2. **Configure Environment**
   ```bash
   # Update .env files with production values
   ```

3. **Deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Scaling Services

```bash
# Scale specific services
docker-compose up -d --scale api-gateway=3 --scale user-service=2
```

## 📊 Data Models

### Core Entities

- **Startup** - Company information, funding rounds, metrics
- **User** - User profiles, authentication, preferences
- **Job** - Job listings, applications, tracking
- **Investor** - Investor profiles, investment history
- **Notification** - Email, push, SMS notifications
- **News** - Aggregated news articles and insights

### Relationships

- Users can create and claim startup profiles
- Startups can have multiple funding rounds
- Jobs are associated with startups
- Investors can invest in multiple startups
- Notifications are sent to users based on preferences

## 🔒 Security

### Authentication

- JWT-based authentication
- Password hashing with bcrypt
- Session management
- Role-based access control

### Data Protection

- Input validation and sanitization
- SQL injection prevention
- Rate limiting
- CORS configuration
- Security headers

## 📈 Analytics & Insights

### Available Metrics

- Startup growth trends
- Funding round statistics
- Job market analytics
- User engagement metrics
- Notification delivery rates
- News sentiment analysis

### Reporting

- Daily/weekly/monthly reports
- Custom dashboard analytics
- Export functionality
- API usage statistics

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits
- Comprehensive testing

### Testing

- Unit tests for all services
- Integration tests
- API endpoint tests
- Database tests
- Performance tests

## 📚 Documentation

### API Documentation

- OpenAPI/Swagger specifications
- Interactive API docs
- Code examples
- Postman collections

### Architecture Documentation

- Service diagrams
- Data flow diagrams
- Deployment guides
- Troubleshooting guides

## 🆘 Support

### Getting Help

- Check the [Issues](https://github.com/your-org/startupcompass/issues) for known issues
- Review [Discussions](https://github.com/your-org/startupcompass/discussions) for questions
- Check the [Wiki](https://github.com/your-org/startupcompass/wiki) for documentation

### Reporting Issues

When reporting issues, please include:

- Service name and version
- Error messages and stack traces
- Steps to reproduce
- Environment details
- Expected vs actual behavior

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ by the StartupCompass team.

---

**StartupCompass** - Navigate the startup ecosystem with confidence 🚀