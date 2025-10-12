import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StartupCompass Platform API',
      version: '1.0.0',
      description: `
        A comprehensive API for the StartupCompass platform, providing access to startup data, 
        job listings, funding information, and user management functionality.
        
        ## Features
        - User authentication and management
        - Startup discovery and management
        - Job board functionality
        - Funding and investment tracking
        - Real-time notifications
        - News aggregation
        
        ## Authentication
        Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`
        
        ## Rate Limiting
        API requests are rate-limited to ensure fair usage:
        - Authenticated users: 1000 requests per hour
        - Unauthenticated users: 100 requests per hour
        
        ## Error Handling
        The API uses standard HTTP status codes and returns error details in JSON format:
        \`\`\`json
        {
          "success": false,
          "error": "Error description",
          "code": "ERROR_CODE",
          "details": {}
        }
        \`\`\`
      `,
      termsOfService: 'https://startupcompass.com/terms',
      contact: {
        name: 'StartupCompass API Support',
        url: 'https://startupcompass.com/support',
        email: 'api-support@startupcompass.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://staging-api.startupcompass.com',
        description: 'Staging server'
      },
      {
        url: 'https://api.startupcompass.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for service-to-service communication'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code for programmatic handling'
            },
            details: {
              type: 'object',
              description: 'Additional error details'
            }
          }
        },
        Success: {
          type: 'object',
          required: ['success'],
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            message: {
              type: 'string',
              description: 'Success message'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              description: 'Current page number'
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Number of items per page'
            },
            total: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of items'
            },
            pages: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of pages'
            }
          }
        },
        User: {
          type: 'object',
          required: ['id', 'email', 'firstName', 'lastName'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            firstName: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              description: 'User first name'
            },
            lastName: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              description: 'User last name'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'moderator'],
              description: 'User role'
            },
            isVerified: {
              type: 'boolean',
              description: 'Whether user email is verified'
            },
            avatar: {
              type: 'string',
              format: 'uri',
              description: 'User avatar URL'
            },
            bio: {
              type: 'string',
              maxLength: 500,
              description: 'User biography'
            },
            location: {
              type: 'string',
              maxLength: 100,
              description: 'User location'
            },
            website: {
              type: 'string',
              format: 'uri',
              description: 'User website URL'
            },
            linkedin: {
              type: 'string',
              format: 'uri',
              description: 'LinkedIn profile URL'
            },
            twitter: {
              type: 'string',
              description: 'Twitter handle'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Startup: {
          type: 'object',
          required: ['id', 'name', 'description', 'industry'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique startup identifier'
            },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Startup name'
            },
            description: {
              type: 'string',
              minLength: 10,
              maxLength: 2000,
              description: 'Startup description'
            },
            industry: {
              type: 'string',
              enum: ['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Gaming', 'Media', 'Transportation', 'Energy', 'Other'],
              description: 'Industry category'
            },
            stage: {
              type: 'string',
              enum: ['idea', 'prototype', 'mvp', 'seed', 'series-a', 'series-b', 'series-c', 'growth', 'ipo'],
              description: 'Current funding stage'
            },
            location: {
              type: 'string',
              maxLength: 100,
              description: 'Startup location'
            },
            website: {
              type: 'string',
              format: 'uri',
              description: 'Startup website URL'
            },
            logo: {
              type: 'string',
              format: 'uri',
              description: 'Startup logo URL'
            },
            foundedYear: {
              type: 'integer',
              minimum: 1900,
              maximum: 2030,
              description: 'Year the startup was founded'
            },
            employeeCount: {
              type: 'integer',
              minimum: 1,
              description: 'Number of employees'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Startup tags/keywords'
            },
            socialMedia: {
              type: 'object',
              properties: {
                twitter: { type: 'string' },
                linkedin: { type: 'string' },
                facebook: { type: 'string' }
              }
            },
            founderId: {
              type: 'string',
              format: 'uuid',
              description: 'Founder user ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Job: {
          type: 'object',
          required: ['id', 'title', 'description', 'company'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique job identifier'
            },
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Job title'
            },
            description: {
              type: 'string',
              minLength: 50,
              maxLength: 5000,
              description: 'Job description'
            },
            company: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Company name'
            },
            location: {
              type: 'string',
              maxLength: 100,
              description: 'Job location'
            },
            type: {
              type: 'string',
              enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
              description: 'Employment type'
            },
            remote: {
              type: 'boolean',
              description: 'Whether the job is remote'
            },
            salary: {
              type: 'object',
              properties: {
                min: {
                  type: 'integer',
                  minimum: 0,
                  description: 'Minimum salary'
                },
                max: {
                  type: 'integer',
                  minimum: 0,
                  description: 'Maximum salary'
                },
                currency: {
                  type: 'string',
                  enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
                  default: 'USD'
                },
                period: {
                  type: 'string',
                  enum: ['hourly', 'monthly', 'yearly'],
                  default: 'yearly'
                }
              }
            },
            requirements: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Job requirements'
            },
            benefits: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Job benefits'
            },
            skills: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Required skills'
            },
            experienceLevel: {
              type: 'string',
              enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
              description: 'Required experience level'
            },
            applicationDeadline: {
              type: 'string',
              format: 'date',
              description: 'Application deadline'
            },
            postedBy: {
              type: 'string',
              format: 'uuid',
              description: 'User ID who posted the job'
            },
            startupId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated startup ID'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the job is active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        FundingRound: {
          type: 'object',
          required: ['id', 'startupId', 'round', 'amount'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique funding round identifier'
            },
            startupId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated startup ID'
            },
            round: {
              type: 'string',
              enum: ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Bridge', 'IPO'],
              description: 'Funding round type'
            },
            amount: {
              type: 'number',
              minimum: 0,
              description: 'Funding amount'
            },
            currency: {
              type: 'string',
              enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
              default: 'USD',
              description: 'Currency'
            },
            valuation: {
              type: 'number',
              minimum: 0,
              description: 'Company valuation'
            },
            leadInvestor: {
              type: 'string',
              maxLength: 100,
              description: 'Lead investor name'
            },
            investors: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of investors'
            },
            announcedDate: {
              type: 'string',
              format: 'date',
              description: 'Date the funding was announced'
            },
            closedDate: {
              type: 'string',
              format: 'date',
              description: 'Date the funding round closed'
            },
            useOfFunds: {
              type: 'string',
              maxLength: 1000,
              description: 'Planned use of funds'
            },
            source: {
              type: 'string',
              maxLength: 100,
              description: 'Data source'
            },
            verified: {
              type: 'boolean',
              description: 'Whether the funding round is verified'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Notification: {
          type: 'object',
          required: ['id', 'userId', 'type', 'title', 'message'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique notification identifier'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'Target user ID'
            },
            type: {
              type: 'string',
              enum: ['info', 'success', 'warning', 'error', 'job_alert', 'funding_update', 'system'],
              description: 'Notification type'
            },
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Notification title'
            },
            message: {
              type: 'string',
              minLength: 1,
              maxLength: 500,
              description: 'Notification message'
            },
            data: {
              type: 'object',
              description: 'Additional notification data'
            },
            read: {
              type: 'boolean',
              description: 'Whether the notification has been read'
            },
            readAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the notification was read'
            },
            channels: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['email', 'push', 'sms', 'in-app']
              },
              description: 'Delivery channels'
            },
            priority: {
              type: 'string',
              enum: ['low', 'normal', 'high', 'urgent'],
              default: 'normal',
              description: 'Notification priority'
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the notification expires'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          }
        },
        SortParam: {
          name: 'sort',
          in: 'query',
          description: 'Sort field and direction (e.g., "createdAt:desc")',
          required: false,
          schema: {
            type: 'string'
          }
        },
        SearchParam: {
          name: 'search',
          in: 'query',
          description: 'Search query string',
          required: false,
          schema: {
            type: 'string',
            minLength: 1,
            maxLength: 100
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Authentication required',
                code: 'UNAUTHORIZED'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Insufficient permissions',
                code: 'FORBIDDEN'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Resource not found',
                code: 'NOT_FOUND'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: {
                  field: 'email',
                  message: 'Invalid email format'
                }
              }
            }
          }
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Rate limit exceeded',
                code: 'RATE_LIMIT_EXCEEDED'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Startups',
        description: 'Startup discovery and management'
      },
      {
        name: 'Jobs',
        description: 'Job board functionality'
      },
      {
        name: 'Funding',
        description: 'Funding and investment tracking'
      },
      {
        name: 'Notifications',
        description: 'Notification management'
      },
      {
        name: 'News',
        description: 'News aggregation and management'
      },
      {
        name: 'Health',
        description: 'System health and monitoring'
      }
    ]
  },
  apis: [
    './services/*/src/routes/*.ts',
    './services/*/src/controllers/*.ts',
    './docs/api/paths/*.yml'
  ]
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Swagger UI setup
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6 }
    `,
    customSiteTitle: 'StartupCompass API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2
    }
  }));

  // JSON endpoint for the OpenAPI spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 API Documentation available at /api-docs');
};

export { specs };
export default setupSwagger;