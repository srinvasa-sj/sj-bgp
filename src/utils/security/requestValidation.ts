import DOMPurify from 'dompurify';

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  type?: 'string' | 'number' | 'email' | 'url';
}

export interface SanitizationConfig {
  stripHTML: boolean;
  maxLength?: number;
  allowedTags?: string[];
  allowedAttributes?: string[];
}

const defaultSanitizationConfig: SanitizationConfig = {
  stripHTML: true,
  maxLength: 1000,
  allowedTags: ['b', 'i', 'em', 'strong', 'a'],
  allowedAttributes: ['href', 'title', 'target']
};

export const validateField = (value: any, rules: ValidationRules): { isValid: boolean; error?: string } => {
  if (rules.required && !value) {
    return { isValid: false, error: 'This field is required' };
  }

  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return { isValid: false, error: `Minimum length is ${rules.minLength} characters` };
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return { isValid: false, error: `Maximum length is ${rules.maxLength} characters` };
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return { isValid: false, error: 'Invalid format' };
    }

    if (rules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    if (rules.type === 'url' && !/^https?:\/\/.*/.test(value)) {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  if (rules.type === 'number' && isNaN(Number(value))) {
    return { isValid: false, error: 'Must be a number' };
  }

  return { isValid: true };
};

export const sanitizeInput = (input: string, config: SanitizationConfig = defaultSanitizationConfig): string => {
  let sanitized = input.trim();

  if (config.stripHTML) {
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: config.allowedTags,
      ALLOWED_ATTR: config.allowedAttributes,
    });
  }

  if (config.maxLength && sanitized.length > config.maxLength) {
    sanitized = sanitized.substring(0, config.maxLength);
  }

  return sanitized;
};

export const validateAndSanitizeObject = <T extends { [K in keyof T]: T[K] }>(
  data: T,
  validationRules: Record<keyof T, ValidationRules>,
  sanitizationConfig?: SanitizationConfig
): { isValid: boolean; sanitizedData: T; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};
  const sanitizedData = { ...data };

  let isValid = true;

  for (const key in validationRules) {
    if (Object.prototype.hasOwnProperty.call(validationRules, key)) {
      if (typeof data[key] === 'string') {
        (sanitizedData[key] as any) = sanitizeInput(data[key] as string, sanitizationConfig);
      }

      const validation = validateField(sanitizedData[key], validationRules[key]);
      if (!validation.isValid) {
        errors[key] = validation.error;
        isValid = false;
      }
    }
  }

  return { isValid, sanitizedData, errors };
}; 
