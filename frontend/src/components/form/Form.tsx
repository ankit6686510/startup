import React from 'react';
import { 
  useForm, 
  FormProvider, 
  UseFormProps, 
  FieldValues,
  UseFormReturn,
  SubmitHandler
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema, ZodTypeDef } from 'zod';
import { cn } from '@/lib/utils';

interface FormProps<TFormValues extends FieldValues, Schema> extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  form?: UseFormReturn<TFormValues>;
  onSubmit: SubmitHandler<TFormValues>;
  schema?: Schema;
  options?: UseFormProps<TFormValues>;
  className?: string;
  children: React.ReactNode;
}

export const Form = <
  TFormValues extends FieldValues = FieldValues,
  Schema extends ZodSchema<any, ZodTypeDef, any> = ZodSchema<any, ZodTypeDef, any>
>({
  form,
  onSubmit,
  schema,
  options = {},
  className,
  children,
  ...props
}: FormProps<TFormValues, Schema>) => {
  const formMethods = useForm<TFormValues>({
    ...options,
    resolver: schema ? zodResolver(schema) : options.resolver,
  });

  const methods = form || formMethods;

  return (
    <FormProvider {...methods}>
      <form
        className={cn('space-y-6', className)}
        onSubmit={methods.handleSubmit(onSubmit)}
        noValidate
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
};

// Form field wrapper component
interface FieldWrapperProps {
  label?: string;
  className?: string;
  children: React.ReactNode;
  error?: string;
  description?: string;
  required?: boolean;
}

export const FieldWrapper = ({
  label,
  className,
  children,
  error,
  description,
  required = false,
}: FieldWrapperProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {children}
      </div>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

// Submit button component
interface SubmitButtonProps extends React.ComponentProps<'button'> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const SubmitButton = ({
  isLoading = false,
  loadingText = 'Submitting...',
  children,
  className,
  disabled,
  ...props
}: SubmitButtonProps) => {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={cn(
        'btn-primary w-full',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Form reset button
interface ResetButtonProps extends React.ComponentProps<'button'> {
  children: React.ReactNode;
}

export const ResetButton = ({
  children,
  className,
  ...props
}: ResetButtonProps) => {
  return (
    <button
      type="reset"
      className={cn('btn-outline', className)}
      {...props}
    >
      {children}
    </button>
  );
};
