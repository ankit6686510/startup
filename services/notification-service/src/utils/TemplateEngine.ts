import Handlebars from 'handlebars';
import { NotificationTemplate } from '@/models/NotificationTemplate';
import { logger } from '@/utils/logger';

export interface RenderedTemplate {
  subject?: string;
  content: string;
  summary?: string;
  html?: string;
  text?: string;
}

export class TemplateEngine {
  constructor() {
    this.registerHelpers();
  }

  async render(
    template: NotificationTemplate,
    data: Record<string, any>,
    language?: string,
  ): Promise<RenderedTemplate> {
    try {
      const templateContent = template.getContent(language);

      const rendered: RenderedTemplate = {
        content: this.compileAndRender(templateContent.content, data),
      };

      if (templateContent.subject) {
        rendered.subject = this.compileAndRender(templateContent.subject, data);
      }

      if (templateContent.summary) {
        rendered.summary = this.compileAndRender(templateContent.summary, data);
      }

      if (templateContent.html) {
        rendered.html = this.compileAndRender(templateContent.html, data);
      }

      if (templateContent.text) {
        rendered.text = this.compileAndRender(templateContent.text, data);
      }

      return rendered;
    } catch (error) {
      logger.error(`Error rendering template ${template.id}:`, error);
      throw new Error(
        `Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private compileAndRender(templateString: string, data: Record<string, any>): string {
    const compiledTemplate = Handlebars.compile(templateString);
    return compiledTemplate(data);
  }

  private registerHelpers(): void {
    // Date formatting helper
    Handlebars.registerHelper('formatDate', (date: Date | string, format?: string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (!d || isNaN(d.getTime())) return '';

      switch (format) {
        case 'short':
          return d.toLocaleDateString();
        case 'long':
          return d.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        case 'time':
          return d.toLocaleTimeString();
        default:
          return d.toLocaleString();
      }
    });

    // Currency formatting helper
    Handlebars.registerHelper('formatCurrency', (amount: number, currency: string = 'USD') => {
      if (typeof amount !== 'number') return '';

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    });

    // Number formatting helper
    Handlebars.registerHelper('formatNumber', (number: number, decimals?: number) => {
      if (typeof number !== 'number') return '';

      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(number);
    });

    // Capitalize helper
    Handlebars.registerHelper('capitalize', (str: string) => {
      if (typeof str !== 'string') return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    });

    // Uppercase helper
    Handlebars.registerHelper('uppercase', (str: string) => {
      if (typeof str !== 'string') return '';
      return str.toUpperCase();
    });

    // Lowercase helper
    Handlebars.registerHelper('lowercase', (str: string) => {
      if (typeof str !== 'string') return '';
      return str.toLowerCase();
    });

    // Truncate helper
    Handlebars.registerHelper('truncate', (str: string, length: number = 100) => {
      if (typeof str !== 'string') return '';
      if (str.length <= length) return str;
      return str.substring(0, length) + '...';
    });

    // Conditional helpers
    Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    Handlebars.registerHelper('ne', (a: any, b: any) => a !== b);
    Handlebars.registerHelper('gt', (a: any, b: any) => a > b);
    Handlebars.registerHelper('gte', (a: any, b: any) => a >= b);
    Handlebars.registerHelper('lt', (a: any, b: any) => a < b);
    Handlebars.registerHelper('lte', (a: any, b: any) => a <= b);

    // Array helpers
    Handlebars.registerHelper('length', (array: any[]) => {
      return Array.isArray(array) ? array.length : 0;
    });

    Handlebars.registerHelper('join', (array: any[], separator: string = ', ') => {
      return Array.isArray(array) ? array.join(separator) : '';
    });

    // URL helpers
    Handlebars.registerHelper('urlEncode', (str: string) => {
      if (typeof str !== 'string') return '';
      return encodeURIComponent(str);
    });

    // Default value helper
    Handlebars.registerHelper('default', (value: any, defaultValue: any) => {
      return value || defaultValue;
    });

    // Math helpers
    Handlebars.registerHelper('add', (a: number, b: number) => {
      return (typeof a === 'number' ? a : 0) + (typeof b === 'number' ? b : 0);
    });

    Handlebars.registerHelper('subtract', (a: number, b: number) => {
      return (typeof a === 'number' ? a : 0) - (typeof b === 'number' ? b : 0);
    });

    Handlebars.registerHelper('multiply', (a: number, b: number) => {
      return (typeof a === 'number' ? a : 0) * (typeof b === 'number' ? b : 0);
    });

    Handlebars.registerHelper('divide', (a: number, b: number) => {
      if (typeof a !== 'number' || typeof b !== 'number' || b === 0) return 0;
      return a / b;
    });

    // Percentage helper
    Handlebars.registerHelper(
      'percentage',
      (value: number, total: number, decimals: number = 1) => {
        if (typeof value !== 'number' || typeof total !== 'number' || total === 0) return '0%';
        const percentage = (value / total) * 100;
        return percentage.toFixed(decimals) + '%';
      },
    );

    // JSON helper
    Handlebars.registerHelper('json', (obj: any) => {
      return JSON.stringify(obj);
    });

    // Loop helpers
    Handlebars.registerHelper('times', function (n: number, options: any) {
      let result = '';
      for (let i = 0; i < n; i++) {
        result += options.fn({ index: i, count: i + 1 });
      }
      return result;
    });

    // Range helper
    Handlebars.registerHelper('range', function (start: number, end: number, options: any) {
      let result = '';
      for (let i = start; i <= end; i++) {
        result += options.fn({ value: i, index: i - start });
      }
      return result;
    });

    logger.info('Handlebars helpers registered');
  }

  validateTemplate(templateString: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      Handlebars.compile(templateString);
    } catch (error) {
      errors.push(
        `Template compilation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  precompileTemplate(templateString: string): string {
    try {
      return Handlebars.precompile(templateString) as any as string;
    } catch (error) {
      throw new Error(
        `Template precompilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  getAvailableHelpers(): string[] {
    return [
      'formatDate',
      'formatCurrency',
      'formatNumber',
      'capitalize',
      'uppercase',
      'lowercase',
      'truncate',
      'eq',
      'ne',
      'gt',
      'gte',
      'lt',
      'lte',
      'length',
      'join',
      'urlEncode',
      'default',
      'add',
      'subtract',
      'multiply',
      'divide',
      'percentage',
      'json',
      'times',
      'range',
    ];
  }
}
