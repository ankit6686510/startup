'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/features/auth/hooks';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const { requestPasswordReset, isPasswordResetRequestLoading, error } = useAuth();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const email = watch('email');

  const onSubmit = (data: ForgotPasswordFormData) => {
    requestPasswordReset(data, {
      onSuccess: () => {
        setSubmitted(true);
        toast.success('Check your email for password reset link');
      }
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Check your email</h2>
            <p className="text-slate-600">
              We've sent a password reset link to <span className="font-medium">{email}</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 space-y-4 text-center text-slate-600 text-sm">
            <p>The link will expire in 24 hours. If you don't see the email, check your spam folder.</p>
            <p>
              Remember your password?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">StartupCompass</h1>
          <p className="mt-2 text-sm text-slate-600">
            Reset your password
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <p className="text-slate-600 text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isPasswordResetRequestLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPasswordResetRequestLoading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <p className="text-center text-sm text-slate-600">
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
