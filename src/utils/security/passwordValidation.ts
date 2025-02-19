import { toast } from "sonner";

export interface PasswordValidationRules {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecial: boolean;
  maxLength: number;
}

export const defaultPasswordRules: PasswordValidationRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecial: true,
  maxLength: 128,
};

export const validatePassword = (password: string, rules: PasswordValidationRules = defaultPasswordRules): boolean => {
  if (password.length < rules.minLength || password.length > rules.maxLength) {
    toast.error(`Password must be between ${rules.minLength} and ${rules.maxLength} characters`);
    return false;
  }

  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    toast.error("Password must contain at least one uppercase letter");
    return false;
  }

  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    toast.error("Password must contain at least one lowercase letter");
    return false;
  }

  if (rules.requireNumbers && !/\d/.test(password)) {
    toast.error("Password must contain at least one number");
    return false;
  }

  if (rules.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    toast.error("Password must contain at least one special character");
    return false;
  }

  return true;
}; 