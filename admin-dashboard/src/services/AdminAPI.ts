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
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async logout(): Promise<APIResponse> {
    const response = await this.api.post('/auth/logout');
    localStorage.removeItem('adminToken');
    return response.data;
  }

  async refreshToken(): Promise<APIResponse<{ token: string }>> {
    const response = await this.api.post('/auth/refresh');
    return response.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<APIResponse<DashboardStats>> {
    const response = await this.api.get('/dashboard/stats');
    return response.data;
  }

  async getRecentActivity(limit: number = 50): Promise<APIResponse<ActivityItem[]>> {
    const response = await this.api.get(`/dashboard/activity?limit=${limit}`);
    return response.data;
  }

  // User Management
  async getUsers(params: PaginationParams & FilterParams = {}): Promise<APIResponse<{ users: User[]; total: number }>> {
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async getUser(userId: string): Promise<APIResponse<User>> {
    const response = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<APIResponse<User>> {
    const response = await this.api.put(`/users/${userId}`, updates);
    return response.data;
  }

  async suspendUser(userId: string, reason?: string): Promise<APIResponse> {
    const response = await this.api.post(`/users/${userId}/suspend`, { reason });
    return response.data;
  }

  async activateUser(userId: string): Promise<APIResponse> {
    const response = await this.api.post(`/users/${userId}/activate`);
    return response.data;
  }

  async deleteUser(userId: string): Promise<APIResponse> {
    const response = await this.api.delete(`/users/${userId}`);
    return response.data;
  }

  async impersonateUser(userId: string): Promise<APIResponse<{ token: string }>> {
    const response = await this.api.post(`/users/${userId}/impersonate`);
    return response.data;
  }

  // Startup Management
  async getStartups(params: PaginationParams & FilterParams = {}): Promise<APIResponse<{ startups: Startup[]; total: number }>> {
    const response = await this.api.get('/startups', { params });
    return response.data;
  }

  async getStartup(startupId: string): Promise<APIResponse<Startup>> {
    const response = await this.api.get(`/startups/${startupId}`);
    return response.data;
  }

  async updateStartup(startupId: string, updates: Partial<Startup>): Promise<APIResponse<Startup>> {
    const response = await this.api.put(`/startups/${startupId}`, updates);
    return response.data;
  }

  async approveStartup(startupId: string): Promise<APIResponse> {
    const response = await this.api.post(`/startups/${startupId}/approve`);
    return response.data;
  }

  async rejectStartup(startupId: string, reason: string): Promise<APIResponse> {
    const response = await this.api.post(`/startups/${startupId}/reject`, { reason });
    return response.data;
  }

  async suspendStartup(startupId: string, reason: string): Promise<APIResponse> {
    const response = await this.api.post(`/startups/${startupId}/suspend`, { reason });
    return response.data;
  }

  async deleteStartup(startupId: string): Promise<APIResponse> {
    const response = await this.api.delete(`/startups/${startupId}`);
    return response.data;
  }

  // Job Management
  async getJobs(params: PaginationParams & FilterParams = {}): Promise<APIResponse<{ jobs: Job[]; total: number }>> {
    const response = await this.api.get('/jobs', { params });
    return response.data;
  }

  async getJob(jobId: string): Promise<APIResponse<Job>> {
    const response = await this.api.get(`/jobs/${jobId}`);
    return response.data;
  }

  async updateJob(jobId: string, updates: Partial<Job>): Promise<APIResponse<Job>> {
    const response = await this.api.put(`/jobs/${jobId}`, updates);
    return response.data;
  }

  async suspendJob(jobId: string, reason: string): Promise<APIResponse> {
    const response = await this.api.post(`/jobs/${jobId}/suspend`, { reason });
    return response.data;
  }

  async activateJob(jobId: string): Promise<APIResponse> {
    const response = await this.api.post(`/jobs/${jobId}/activate`);
    return response.data;
  }

  async deleteJob(jobId: string): Promise<APIResponse> {
    const response = await this.api.delete(`/jobs/${jobId}`);
    return response.data;
  }

  // System Health
  async getSystemHealth(): Promise<APIResponse<SystemHealth>> {
    const response = await this.api.get('/system/health');
    return response.data;
  }

  async getSystemMetrics(timeRange: string = '1h'): Promise<APIResponse<SystemMetrics[]>> {
    const response = await this.api.get(`/system/metrics?range=${timeRange}`);
    return response.data;
  }

  async getAlerts(acknowledged: boolean = false): Promise<APIResponse<Alert[]>> {
    const response = await this.api.get(`/system/alerts?acknowledged=${acknowledged}`);
    return response.data;
  }

  async acknowledgeAlert(alertId: string): Promise<APIResponse> {
    const response = await this.api.post(`/system/alerts/${alertId}/acknowledge`);
    return response.data;
  }

  async restartService(serviceName: string): Promise<APIResponse> {
    const response = await this.api.post(`/system/services/${serviceName}/restart`);
    return response.data;
  }

  // Analytics
  async getAnalytics(type: string, timeRange: string = '30d'): Promise<APIResponse<any>> {
    const response = await this.api.get(`/analytics/${type}?range=${timeRange}`);
    return response.data;
  }

  async exportData(type: string, format: 'csv' | 'json' = 'csv', filters: any = {}): Promise<Blob> {
    const response = await this.api.post(`/export/${type}`, filters, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  // Content Moderation
  async getFlaggedContent(type: 'startups' | 'jobs' | 'users' = 'startups'): Promise<APIResponse<any[]>> {
    const response = await this.api.get(`/moderation/flagged/${type}`);
    return response.data;
  }

  async moderateContent(contentId: string, action: 'approve' | 'reject' | 'flag', reason?: string): Promise<APIResponse> {
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
    const response = await this.api.post('/notifications/send', notification);
    return response.data;
  }

  async getNotificationTemplates(): Promise<APIResponse<any[]>> {
    const response = await this.api.get('/notifications/templates');
    return response.data;
  }

  // Settings
  async getSettings(): Promise<APIResponse<any>> {
    const response = await this.api.get('/settings');
    return response.data;
  }

  async updateSettings(settings: any): Promise<APIResponse> {
    const response = await this.api.put('/settings', settings);
    return response.data;
  }

  // Audit Logs
  async getAuditLogs(params: PaginationParams & { userId?: string; action?: string } = {}): Promise<APIResponse<any[]>> {
    const response = await this.api.get('/audit/logs', { params });
    return response.data;
  }

  // Backup & Restore
  async createBackup(): Promise<APIResponse<{ backupId: string }>> {
    const response = await this.api.post('/backup/create');
    return response.data;
  }

  async getBackups(): Promise<APIResponse<any[]>> {
    const response = await this.api.get('/backup/list');
    return response.data;
  }

  async restoreBackup(backupId: string): Promise<APIResponse> {
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
    case 'down':
      return 'error';
    case 'info':
      return 'info';
    default:
      return 'default';
  }
};

export default AdminAPI;