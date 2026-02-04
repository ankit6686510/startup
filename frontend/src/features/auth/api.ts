import axios, { AxiosInstance } from 'axios';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  PasswordResetRequest,
  PasswordReset,
  User
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class AuthAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/auth/password-reset/request', data);
    return response.data;
  }

  async resetPassword(data: PasswordReset): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/auth/password-reset/confirm', data);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await this.client.patch<User>('/auth/profile', updates);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/auth/verify-email', { token });
    return response.data;
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    const response = await this.client.post<AuthResponse>('/auth/refresh', { refreshToken });
    return response.data;
  }

  // OAuth endpoints
  async getOAuthUrl(provider: string): Promise<{ url: string }> {
    const response = await this.client.get<{ url: string }>(`/auth/oauth/${provider}/authorize`);
    return response.data;
  }

  async handleOAuthCallback(provider: string, code: string, state: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(`/auth/oauth/${provider}/callback`, {
      code,
      state
    });
    return response.data;
  }
}

export const authAPI = new AuthAPI();
