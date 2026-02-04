import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalStartups: number;
  totalJobs: number;
  totalFunding: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  recentActivity: ActivityItem[];
  userGrowth: GrowthData[];
  industryDistribution: IndustryData[];
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
  metadata?: any;
}

export interface GrowthData {
  period: string;
  users: number;
  startups: number;
  jobs: number;
  funding: number;
}

export interface IndustryData {
  name: string;
  count: number;
  percentage: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'founder' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'pending' | 'banned';
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  profile?: {
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
  };
  stats?: {
    loginCount: number;
    startupCount: number;
    applicationCount: number;
  };
}

export interface Startup {
  id: string;
  name: string;
  description: string;
  industry: string;
  stage: string;
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  founderId: string;
  founderName: string;
  location?: string;
  website?: string;
  employeeCount?: number;
  fundingTotal?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote: boolean;
  status: 'active' | 'closed' | 'pending' | 'suspended';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  applications: number;
  views: number;
  postedBy: string;
  startupId?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  services: ServiceHealth[];
  metrics: SystemMetrics;
  alerts: Alert[];
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'down';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  url?: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    inbound: number;
    outbound: number;
  };
  database: {
    connections: number;
    queryTime: number;
  };
  cache: {
    hitRate: number;
    memory: number;
  };
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  service?: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  role?: string;
  industry?: string;
  dateFrom?: string;
  dateTo?: string;
}

class AdminAPI {
  private api: AxiosInstance;
  private useMock: boolean = true; // Enable mock by default for now

  constructor(baseURL: string = '/api/admin') {
    this.api = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(email: string, password: string): Promise<APIResponse<{ token: string; user: User }>> {
    if (this.useMock) {
      return {
        success: true,
        data: {
          token: 'mock-token-123',
          user: {
            id: 'admin-1',
            email: email,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            status: 'active',
            isVerified: true,
            createdAt: new Date().toISOString()
          }
        }
      };
    }
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async logout(): Promise<APIResponse> {
    if (this.useMock) return { success: true };
    const response = await this.api.post('/auth/logout');
    localStorage.removeItem('adminToken');
    return response.data;
  }

  async refreshToken(): Promise<APIResponse<{ token: string }>> {
    if (this.useMock) return { success: true, data: { token: 'new-mock-token' } };
    const response = await this.api.post('/auth/refresh');
    return response.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<APIResponse<DashboardStats>> {
    if (this.useMock) {
      return {
        success: true,
        data: {
          totalUsers: 15420,
          activeUsers: 8934,
          totalStartups: 2341,
          totalJobs: 5678,
          totalFunding: 234500000,
          systemHealth: 'healthy',
          recentActivity: [
            { id: '1', type: 'user_registration', description: 'New user registered', timestamp: '2023-10-12T10:00:00Z' },
            { id: '2', type: 'job_posted', description: 'New job posted', timestamp: '2023-10-12T09:00:00Z' },
            { id: '3', type: 'funding_announced', description: 'Funding round announced', timestamp: '2023-10-12T08:00:00Z' }
          ],
          userGrowth: [
            { period: 'Jan', users: 1200, startups: 100, jobs: 50, funding: 1000000 },
            { period: 'Feb', users: 1800, startups: 150, jobs: 80, funding: 2000000 },
            { period: 'Mar', users: 2400, startups: 200, jobs: 120, funding: 3500000 },
            { period: 'Apr', users: 3200, startups: 280, jobs: 180, funding: 5000000 },
            { period: 'May', users: 4100, startups: 350, jobs: 250, funding: 7000000 },
            { period: 'Jun', users: 5200, startups: 450, jobs: 350, funding: 9500000 }
          ],
          industryDistribution: [
            { name: 'Technology', count: 450, percentage: 45 },
            { name: 'Healthcare', count: 250, percentage: 25 },
            { name: 'Finance', count: 200, percentage: 20 },
            { name: 'Education', count: 100, percentage: 10 }
          ]
        }
      };
    }
    const response = await this.api.get('/dashboard/stats');
    return response.data;
  }

  async getRecentActivity(limit: number = 50): Promise<APIResponse<ActivityItem[]>> {
    if (this.useMock) {
        return {
            success: true,
            data: [
                { id: '1', type: 'user_registration', description: 'New user registered', timestamp: '2023-10-12T10:00:00Z' },
                { id: '2', type: 'job_posted', description: 'New job posted', timestamp: '2023-10-12T09:00:00Z' }
            ]
        };
    }
    const response = await this.api.get(`/dashboard/activity?limit=${limit}`);
    return response.data;
  }

  // User Management
  async getUsers(params: PaginationParams & FilterParams = {}): Promise<APIResponse<{ users: User[]; total: number }>> {
    if (this.useMock) {
      return {
        success: true,
        data: {
          users: [
            {
              id: '1',
              email: 'john.doe@example.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'user',
              status: 'active',
              isVerified: true,
              createdAt: '2023-01-15T10:30:00Z',
              lastLogin: '2023-10-12T08:45:00Z',
              stats: { loginCount: 15, startupCount: 0, applicationCount: 5 }
            },
            {
              id: '2',
              email: 'jane.smith@startup.com',
              firstName: 'Jane',
              lastName: 'Smith',
              role: 'founder',
              status: 'active',
              isVerified: true,
              createdAt: '2023-02-20T14:20:00Z',
              lastLogin: '2023-10-12T09:15:00Z',
              stats: { loginCount: 45, startupCount: 1, applicationCount: 0 }
            }
          ],
          total: 2
        }
      };
    }
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async getUser(userId: string): Promise<APIResponse<User>> {
    if (this.useMock) {
      return {
        success: true,
        data: {
            id: userId,
            email: 'mock@example.com',
            firstName: 'Mock',
            lastName: 'User',
            role: 'user',
            status: 'active',
            isVerified: true,
            createdAt: '2023-01-01T00:00:00Z'
        }
      }
    }
    const response = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<APIResponse<User>> {
    if (this.useMock) {
        return {
            success: true,
            data: {
                id: userId,
                email: 'mock@example.com',
                firstName: 'Mock',
                lastName: 'User',
                role: 'user',
                status: 'active',
                isVerified: true,
                createdAt: '2023-01-01T00:00:00Z',
                ...updates
            } as User
        };
    }
    const response = await this.api.put(`/users/${userId}`, updates);
    return response.data;
  }

  async suspendUser(userId: string, reason?: string): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'User suspended' };
    const response = await this.api.post(`/users/${userId}/suspend`, { reason });
    return response.data;
  }

  async activateUser(userId: string): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'User activated' };
    const response = await this.api.post(`/users/${userId}/activate`);
    return response.data;
  }

  async deleteUser(userId: string): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'User deleted' };
    const response = await this.api.delete(`/users/${userId}`);
    return response.data;
  }

  async impersonateUser(userId: string): Promise<APIResponse<{ token: string }>> {
    if (this.useMock) return { success: true, data: { token: 'mock-impersonation-token' } };
    const response = await this.api.post(`/users/${userId}/impersonate`);
    return response.data;
  }

  // Startup Management
  async getStartups(params: PaginationParams & FilterParams = {}): Promise<APIResponse<{ startups: Startup[]; total: number }>> {
    if (this.useMock) {
      return {
        success: true,
        data: {
          startups: [
            {
              id: '1',
              name: 'TechStartup Inc',
              description: 'Revolutionizing the tech industry',
              industry: 'Technology',
              stage: 'Series A',
              status: 'active',
              founderId: '2',
              founderName: 'Jane Smith',
              location: 'San Francisco, CA',
              employeeCount: 50,
              fundingTotal: 5000000,
              createdAt: '2023-03-01T12:00:00Z',
              updatedAt: '2023-10-01T10:00:00Z'
            },
            {
              id: '2',
              name: 'HealthPlus',
              description: 'AI-driven healthcare solutions',
              industry: 'Healthcare',
              stage: 'Seed',
              status: 'pending',
              founderId: '3',
              founderName: 'Bob Johnson',
              location: 'Boston, MA',
              employeeCount: 10,
              fundingTotal: 1000000,
              createdAt: '2023-09-15T09:00:00Z',
              updatedAt: '2023-09-15T09:00:00Z'
            }
          ],
          total: 2
        }
      };
    }
    const response = await this.api.get('/startups', { params });
    return response.data;
  }

  async getStartup(startupId: string): Promise<APIResponse<Startup>> {
    if (this.useMock) {
        return {
            success: true,
            data: {
                id: startupId,
                name: 'Mock Startup',
                description: 'Mock Description',
                industry: 'Tech',
                stage: 'Seed',
                status: 'active',
                founderId: '1',
                founderName: 'Founder',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };
    }
    const response = await this.api.get(`/startups/${startupId}`);
    return response.data;
  }

  async updateStartup(startupId: string, updates: Partial<Startup>): Promise<APIResponse<Startup>> {
    if (this.useMock) {
        return {
            success: true,
            data: {
                id: startupId,
                name: 'Mock Startup',
                description: 'Mock Description',
                industry: 'Tech',
                stage: 'Seed',
                status: 'active',
                founderId: '1',
                founderName: 'Founder',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...updates
            } as Startup
        };
    }
    const response = await this.api.put(`/startups/${startupId}`, updates);
    return response.data;
  }

  async approveStartup(startupId: string): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'Startup approved' };
    const response = await this.api.post(`/startups/${startupId}/approve`);
    return response.data;
  }

  async rejectStartup(startupId: string, reason: string): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'Startup rejected' };
    const response = await this.api.post(`/startups/${startupId}/reject`, { reason });
    return response.data;
  }

  async suspendStartup(startupId: string, reason: string): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'Startup suspended' };
    const response = await this.api.post(`/startups/${startupId}/suspend`, { reason });
    return response.data;
  }

  async deleteStartup(startupId: string): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'Startup deleted' };
    const response = await this.api.delete(`/startups/${startupId}`);
    return response.data;
  }

  // Job Management
  async getJobs(params: PaginationParams & FilterParams = {}): Promise<APIResponse<{ jobs: Job[]; total: number }>> {
    if (this.useMock) {
      return {
        success: true,
        data: {
          jobs: [
            {
              id: '1',
              title: 'Senior Software Engineer',
              description: 'We are looking for a senior software engineer...',
              company: 'TechStartup Inc',
              location: 'Remote',
              type: 'full-time',
              remote: true,
              status: 'active',
              applications: 45,
              views: 1200,
              postedBy: '2',
              startupId: '1',
              createdAt: '2023-10-01T10:00:00Z'
            },
            {
              id: '2',
              title: 'Product Manager',
              description: 'Lead our product team...',
              company: 'TechStartup Inc',
              location: 'San Francisco',
              type: 'full-time',
              remote: false,
              status: 'active',
              applications: 20,
              views: 800,
              postedBy: '2',
              startupId: '1',
              createdAt: '2023-10-05T14:00:00Z'
            }
          ],
          total: 2
        }
      };
    }
    const response = await this.api.get('/jobs', { params });
    return response.data;
  }

  async getJob(jobId: string): Promise<APIResponse<Job>> {
    if (this.useMock) {
        return {
            success: true,
            data: {
                id: jobId,
                title: 'Mock Job',
                description: 'Mock Description',
                company: 'Mock Company',
                location: 'Remote',
                type: 'full-time',
                remote: true,
                status: 'active',
                applications: 0,
                views: 0,
                postedBy: '1',
                createdAt: new Date().toISOString()
            }
        };
    }
    const response = await this.api.get(`/jobs/${jobId}`);
    return response.data;
  }

  async updateJob(jobId: string, updates: Partial<Job>): Promise<APIResponse<Job>> {
    if (this.useMock) {
         return {
            success: true,
            data: {
                id: jobId,
                title: 'Mock Job',
                description: 'Mock Description',
                company: 'Mock Company',
                location: 'Remote',
                type: 'full-time',
                remote: true,
                status: 'active',
                applications: 0,
                views: 0,
                postedBy: '1',
                createdAt: new Date().toISOString(),
                ...updates
            } as Job
        };
    }
    const response = await this.api.put(`/jobs/${jobId}`, updates);
    return response.data;
  }

  async suspendJob(jobId: string, reason: string): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'Job suspended' };
    const response = await this.api.post(`/jobs/${jobId}/suspend`, { reason });
    return response.data;
  }

  async activateJob(jobId: string): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'Job activated' };
    const response = await this.api.post(`/jobs/${jobId}/activate`);
    return response.data;
  }

  async deleteJob(jobId: string): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'Job deleted' };
    const response = await this.api.delete(`/jobs/${jobId}`);
    return response.data;
  }

  // System Health
  async getSystemHealth(): Promise<APIResponse<SystemHealth>> {
    if (this.useMock) {
      return {
        success: true,
        data: {
          overall: 'healthy',
          services: [
            { name: 'API Gateway', status: 'healthy', uptime: 99.9, responseTime: 45, lastCheck: new Date().toISOString() },
            { name: 'User Service', status: 'healthy', uptime: 99.8, responseTime: 55, lastCheck: new Date().toISOString() },
            { name: 'Job Service', status: 'warning', uptime: 98.5, responseTime: 120, lastCheck: new Date().toISOString() },
            { name: 'Database', status: 'healthy', uptime: 99.9, responseTime: 15, lastCheck: new Date().toISOString() },
            { name: 'Redis Cache', status: 'healthy', uptime: 99.7, responseTime: 5, lastCheck: new Date().toISOString() }
          ],
          metrics: {
            cpu: 45,
            memory: 68,
            disk: 55,
            network: { inbound: 1500, outbound: 2500 },
            database: { connections: 150, queryTime: 25 },
            cache: { hitRate: 95, memory: 40 }
          },
          alerts: []
        }
      };
    }
    const response = await this.api.get('/system/health');
    return response.data;
  }

  async getSystemMetrics(timeRange: string = '1h'): Promise<APIResponse<SystemMetrics[]>> {
    if (this.useMock) return { success: true, data: [] };
    const response = await this.api.get(`/system/metrics?range=${timeRange}`);
    return response.data;
  }

  async getAlerts(acknowledged: boolean = false): Promise<APIResponse<Alert[]>> {
    if (this.useMock) return { success: true, data: [] };
    const response = await this.api.get(`/system/alerts?acknowledged=${acknowledged}`);
    return response.data;
  }

  async acknowledgeAlert(alertId: string): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'Alert acknowledged' };
    const response = await this.api.post(`/system/alerts/${alertId}/acknowledge`);
    return response.data;
  }

  async restartService(serviceName: string): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'Service restart triggered' };
    const response = await this.api.post(`/system/services/${serviceName}/restart`);
    return response.data;
  }

  // Analytics
  async getAnalytics(type: string, timeRange: string = '30d'): Promise<APIResponse<any>> {
    if (this.useMock) return { success: true, data: {} };
    const response = await this.api.get(`/analytics/${type}?range=${timeRange}`);
    return response.data;
  }

  async exportData(type: string, format: 'csv' | 'json' = 'csv', filters: any = {}): Promise<Blob> {
    if (this.useMock) return new Blob(['mock data'], { type: 'text/csv' });
    const response = await this.api.post(`/export/${type}`, filters, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  // Content Moderation
  async getFlaggedContent(type: 'startups' | 'jobs' | 'users' = 'startups'): Promise<APIResponse<any[]>> {
    if (this.useMock) return { success: true, data: [] };
    const response = await this.api.get(`/moderation/flagged/${type}`);
    return response.data;
  }

  async moderateContent(contentId: string, action: 'approve' | 'reject' | 'flag', reason?: string): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'Content moderated' };
    const response = await this.api.post(`/moderation/content/${contentId}`, { action, reason });
    return response.data;
  }

  // Notifications
  async sendNotification(notification: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    recipients: string[] | 'all';
    channels: ('email' | 'push' | 'in-app')[];
  }): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'Notification sent' };
    const response = await this.api.post('/notifications/send', notification);
    return response.data;
  }

  async getNotificationTemplates(): Promise<APIResponse<any[]>> {
    if (this.useMock) return { success: true, data: [] };
    const response = await this.api.get('/notifications/templates');
    return response.data;
  }

  // Settings
  async getSettings(): Promise<APIResponse<any>> {
    if (this.useMock) return { success: true, data: {} };
    const response = await this.api.get('/settings');
    return response.data;
  }

  async updateSettings(settings: any): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'Settings updated' };
    const response = await this.api.put('/settings', settings);
    return response.data;
  }

  // Audit Logs
  async getAuditLogs(params: PaginationParams & { userId?: string; action?: string } = {}): Promise<APIResponse<any[]>> {
    if (this.useMock) return { success: true, data: [] };
    const response = await this.api.get('/audit/logs', { params });
    return response.data;
  }

  // Backup & Restore
  async createBackup(): Promise<APIResponse<{ backupId: string }>> {
    if (this.useMock) return { success: true, data: { backupId: 'mock-backup-id' } };
    const response = await this.api.post('/backup/create');
    return response.data;
  }

  async getBackups(): Promise<APIResponse<any[]>> {
    if (this.useMock) return { success: true, data: [] };
    const response = await this.api.get('/backup/list');
    return response.data;
  }

  async restoreBackup(backupId: string): Promise<APIResponse> {
    if (this.useMock) return { success: true, message: 'Backup restoration started' };
    const response = await this.api.post(`/backup/restore/${backupId}`);
    return response.data;
  }
}

// Create singleton instance
export const adminAPI = new AdminAPI();

// Export utility functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
};

export const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'healthy':
    case 'approved':
      return 'success';
    case 'pending':
    case 'warning':
      return 'warning';
    case 'suspended':
    case 'rejected':
    case 'critical':
    case 'closed':
    case 'down':
      return 'error';
    case 'info':
      return 'info';
    default:
      return 'default';
  }
};

export default AdminAPI;