export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' | 'STARTUP_FOUNDER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  onboardingCompleted: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  jobCategories: string[];
  industries: string[];
  locations: string[];
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface OAuthProvider {
  provider: 'github' | 'google' | 'linkedin';
  clientId: string;
  redirectUri: string;
}
