export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'Weak' | 'Medium' | 'Strong';
}

export function evaluatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z).');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z).');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9).');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/]/.test(password)) {
    errors.push('Password must contain at least one special character (e.g. !@#$%^&*).');
  } else {
    score += 1;
  }

  // Blacklist check for simple common patterns
  const commonPasswords = [
    '123456',
    'password',
    'qwerty',
    'abc123',
    'admin',
    'welcome',
    'letmein',
    '12345678',
    'password123',
    'admin123',
    'welcome123',
    'radhafashions',
    'qwertyuiop',
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common and easily guessable. Please choose a unique password.');
    score = 0; // reset score if it's a common password
  }

  const valid = errors.length === 0;
  
  let strength: 'Weak' | 'Medium' | 'Strong' = 'Weak';
  if (score >= 5 && valid) {
    strength = 'Strong';
  } else if (score >= 3) {
    strength = 'Medium';
  }

  return {
    valid,
    errors,
    strength
  };
}

// Keeping the old function signature for backward compatibility, 
// though it internally uses the new one.
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const res = evaluatePasswordStrength(password);
  return { valid: res.valid, errors: res.errors };
}
