import { useCallback, useEffect } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { authAPI } from './api';
import { useAuthStore } from './store';
import { LoginCredentials, RegisterCredentials, PasswordResetRequest, PasswordReset } from './types';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, setLoading, setError, logout } = useAuthStore();

  // Fetch current user on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token && !user) {
      fetchCurrentUser();
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (error: any) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authAPI.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      router.push(data.user.onboardingCompleted ? '/dashboard' : '/onboarding');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Login failed');
    }
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => authAPI.register(credentials),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      router.push('/onboarding');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Registration failed');
    }
  });

  const passwordResetRequestMutation = useMutation({
    mutationFn: (data: PasswordResetRequest) => authAPI.requestPasswordReset(data),
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to request password reset');
    }
  });

  const passwordResetMutation = useMutation({
    mutationFn: (data: PasswordReset) => authAPI.resetPassword(data),
    onSuccess: () => {
      router.push('/auth/login');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to reset password');
    }
  });

  const logoutHandler = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      logout();
      router.push('/auth/login');
    }
  }, [logout, router]);

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegisterLoading: registerMutation.isPending,
    requestPasswordReset: passwordResetRequestMutation.mutate,
    isPasswordResetRequestLoading: passwordResetRequestMutation.isPending,
    resetPassword: passwordResetMutation.mutate,
    isPasswordResetLoading: passwordResetMutation.isPending,
    logout: logoutHandler,
    error: useAuthStore((state) => state.error)
  };
}

export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isLoading };
}
