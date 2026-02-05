import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import { NotificationType, NotificationCategory } from './Notification';

@Entity('notification_templates')
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200, unique: true })
  @Index()
  name: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  @Index()
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationCategory
  })
  @Index()
  category: NotificationCategory;

  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean; // System templates cannot be deleted

  // Template content
  @Column({ length: 500, nullable: true })
  subject?: string; // For email notifications

  @Column('text')
  content: string; // Main template content (supports Handlebars)

  @Column('text', { nullable: true })
  summary?: string; // Short version for push notifications

  @Column('text', { nullable: true })
  @Index()
  html?: string; // HTML version for emails

  @Column('text', { nullable: true })
  text?: string; // Plain text version for emails

  // Template variables and schema
  @Column('jsonb', { name: 'variables', default: '[]' })
  variables: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
    required: boolean;
    description?: string;
    defaultValue?: any;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      enum?: any[];
    };
  }>;

  @Column('jsonb', { name: 'sample_data', default: '{}' })
  sampleData: Record<string, any>; // Sample data for testing

  // Styling and branding
  @Column('jsonb', { name: 'styling', default: '{}' })
  styling: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    fontSize?: string;
    backgroundColor?: string;
    logoUrl?: string;
    headerImage?: string;
    footerText?: string;
  };

  // Email specific settings
  @Column({ name: 'email_from', nullable: true })
  emailFrom?: string;

  @Column({ name: 'email_reply_to', nullable: true })
  emailReplyTo?: string;

  @Column('text', { array: true, default: '{}' })
  emailCc: string[];

  @Column('text', { array: true, default: '{}' })
  emailBcc: string[];

  // Push notification specific settings
  @Column({ name: 'push_icon', nullable: true })
  pushIcon?: string;

  @Column({ name: 'push_sound', nullable: true })
  pushSound?: string;

  @Column({ name: 'push_badge', nullable: true })
  pushBadge?: string;

  @Column('jsonb', { name: 'push_actions', default: '[]' })
  pushActions: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;

  // SMS specific settings
  @Column({ name: 'sms_from', nullable: true })
  smsFrom?: string;

  // Localization
  @Column({ name: 'default_language', default: 'en' })
  defaultLanguage: string;

  @Column('jsonb', { name: 'translations', default: '{}' })
  translations: Record<string, {
    subject?: string;
    content: string;
    summary?: string;
    html?: string;
    text?: string;
  }>;

  // Template metadata
  @Column('text', { array: true, default: '{}' })
  tags: string[];

  @Column({ name: 'version', default: 1 })
  version: number;

  @Column({ name: 'parent_template_id', nullable: true })
  parentTemplateId?: string; // For template versioning

  @Column({ name: 'usage_count', default: 0 })
  usageCount: number;

  @Column({ name: 'last_used_at', nullable: true })
  lastUsedAt?: Date;

  // Validation and testing
  @Column({ name: 'is_validated', default: false })
  isValidated: boolean;

  @Column({ name: 'validation_errors', nullable: true })
  validationErrors?: string;

  @Column({ name: 'test_recipients', nullable: true })
  testRecipients?: string; // Comma-separated list of test emails/phones

  // Access control
  @Column({ name: 'created_by', nullable: true })
  createdBy?: string; // User ID

  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: string; // User ID

  @Column('text', { array: true, default: '{}' })
  allowedRoles: string[]; // Roles that can use this template

  // Additional metadata
  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual getters
  get isEmailTemplate(): boolean {
    return this.type === NotificationType.EMAIL;
  }

  get isPushTemplate(): boolean {
    return this.type === NotificationType.PUSH;
  }

  get isSmsTemplate(): boolean {
    return this.type === NotificationType.SMS;
  }

  get hasTranslations(): boolean {
    return Object.keys(this.translations).length > 0;
  }

  get supportedLanguages(): string[] {
    return [this.defaultLanguage, ...Object.keys(this.translations)];
  }

  get requiredVariables(): string[] {
    return this.variables.filter(v => v.required).map(v => v.name);
  }

  get optionalVariables(): string[] {
    return this.variables.filter(v => !v.required).map(v => v.name);
  }

  // Methods
  addVariable(variable: NotificationTemplate['variables'][0]): void {
    const existingIndex = this.variables.findIndex(v => v.name === variable.name);
    if (existingIndex >= 0) {
      this.variables[existingIndex] = variable;
    } else {
      this.variables.push(variable);
    }
  }

  removeVariable(variableName: string): void {
    this.variables = this.variables.filter(v => v.name !== variableName);
  }

  addTranslation(language: string, translation: NotificationTemplate['translations'][string]): void {
    this.translations[language] = translation;
  }

  removeTranslation(language: string): void {
    delete this.translations[language];
  }

  getContent(language?: string): {
    subject?: string;
    content: string;
    summary?: string;
    html?: string;
    text?: string;
  } {
    const lang = language || this.defaultLanguage;

    if (lang !== this.defaultLanguage && this.translations[lang]) {
      return this.translations[lang];
    }

    return {
      subject: this.subject,
      content: this.content,
      summary: this.summary,
      html: this.html,
      text: this.text,
    };
  }

  validateVariables(data: Record<string, any>): {
    isValid: boolean;
    errors: string[];
    missingRequired: string[];
  } {
    const errors: string[] = [];
    const missingRequired: string[] = [];

    for (const variable of this.variables) {
      const value = data[variable.name];

      // Check required variables
      if (variable.required && (value === undefined || value === null || value === '')) {
        missingRequired.push(variable.name);
        continue;
      }

      // Skip validation if value is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (variable.type === 'date' && !(value instanceof Date) && typeof value !== 'string') {
        errors.push(`Variable '${variable.name}' must be a date`);
      } else if (variable.type !== 'date' && variable.type !== actualType) {
        errors.push(`Variable '${variable.name}' must be of type ${variable.type}, got ${actualType}`);
      }

      // Validation rules
      if (variable.validation) {
        const validation = variable.validation;

        if (validation.min !== undefined && typeof value === 'number' && value < validation.min) {
          errors.push(`Variable '${variable.name}' must be at least ${validation.min}`);
        }

        if (validation.max !== undefined && typeof value === 'number' && value > validation.max) {
          errors.push(`Variable '${variable.name}' must be at most ${validation.max}`);
        }

        if (validation.pattern && typeof value === 'string' && !new RegExp(validation.pattern).test(value)) {
          errors.push(`Variable '${variable.name}' does not match required pattern`);
        }

        if (validation.enum && !validation.enum.includes(value)) {
          errors.push(`Variable '${variable.name}' must be one of: ${validation.enum.join(', ')}`);
        }
      }
    }

    return {
      isValid: errors.length === 0 && missingRequired.length === 0,
      errors,
      missingRequired,
    };
  }

  incrementUsage(): void {
    this.usageCount += 1;
    this.lastUsedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (!this.content || this.content.trim().length === 0) {
      errors.push('Template content is required');
    }

    // Email specific validation
    if (this.isEmailTemplate && (!this.subject || this.subject.trim().length === 0)) {
      errors.push('Email templates must have a subject');
    }

    // Push notification specific validation
    if (this.isPushTemplate && (!this.summary || this.summary.trim().length === 0)) {
      errors.push('Push notification templates should have a summary');
    }

    // Variable validation
    for (const variable of this.variables) {
      if (!variable.name || variable.name.trim().length === 0) {
        errors.push('All variables must have a name');
      }
    }

    this.isValidated = errors.length === 0;
    this.validationErrors = errors.length > 0 ? errors.join('; ') : undefined;

    return {
      isValid: this.isValidated,
      errors,
    };
  }

  clone(newName: string): Partial<NotificationTemplate> {
    return {
      name: newName,
      description: this.description,
      type: this.type,
      category: this.category,
      subject: this.subject,
      content: this.content,
      summary: this.summary,
      html: this.html,
      text: this.text,
      variables: [...this.variables],
      sampleData: { ...this.sampleData },
      styling: { ...this.styling },
      emailFrom: this.emailFrom,
      emailReplyTo: this.emailReplyTo,
      emailCc: [...this.emailCc],
      emailBcc: [...this.emailBcc],
      pushIcon: this.pushIcon,
      pushSound: this.pushSound,
      pushBadge: this.pushBadge,
      pushActions: [...this.pushActions],
      smsFrom: this.smsFrom,
      defaultLanguage: this.defaultLanguage,
      translations: { ...this.translations },
      tags: [...this.tags],
      parentTemplateId: this.id,
      allowedRoles: [...this.allowedRoles],
      metadata: { ...this.metadata },
    };
  }

  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  canBeUsedBy(userRole: string): boolean {
    return this.allowedRoles.length === 0 || this.allowedRoles.includes(userRole);
  }

  toSummary() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      category: this.category,
      isActive: this.isActive,
      isSystem: this.isSystem,
      version: this.version,
      usageCount: this.usageCount,
      lastUsedAt: this.lastUsedAt,
      isValidated: this.isValidated,
      supportedLanguages: this.supportedLanguages,
      requiredVariables: this.requiredVariables,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}