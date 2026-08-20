export interface PasswordCriteria {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  score: number; // 0 to 5
  strengthLabel: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  strengthColor: string;
  textColor: string;
  percentage: number;
  isAllMet: boolean;
}

export function evaluatePassword(password: string): PasswordCriteria {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const criteriaList = [minLength, hasUpper, hasLower, hasNumber, hasSpecial];
  const score = criteriaList.filter(Boolean).length;
  const isAllMet = score === 5;

  let strengthLabel: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong' = 'Very Weak';
  let strengthColor = 'bg-red-500';
  let textColor = 'text-red-600';
  let percentage = (score / 5) * 100;

  if (password.length === 0) {
    percentage = 0;
  }

  if (score <= 1) {
    strengthLabel = 'Very Weak';
    strengthColor = 'bg-red-500';
    textColor = 'text-red-600';
  } else if (score === 2) {
    strengthLabel = 'Weak';
    strengthColor = 'bg-orange-500';
    textColor = 'text-orange-600';
  } else if (score === 3) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-500';
    textColor = 'text-amber-600';
  } else if (score === 4) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    textColor = 'text-emerald-600';
  } else if (score === 5) {
    strengthLabel = 'Very Strong';
    strengthColor = 'bg-green-600';
    textColor = 'text-green-600';
  }

  return {
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    score,
    strengthLabel,
    strengthColor,
    textColor,
    percentage,
    isAllMet,
  };
}

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) return 'Email address is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address (e.g. name@college.edu).';
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone || !phone.trim()) return 'Phone number is required.';
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^(\+91)?[\d]{10}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return 'Please enter a valid 10-digit mobile number.';
  }
  return null;
}

export function validateName(name: string): string | null {
  if (!name || !name.trim()) return 'Full name is required.';
  if (name.trim().length < 2) return 'Full name must be at least 2 characters.';
  if (name.trim().length > 100) return 'Full name cannot exceed 100 characters.';
  return null;
}

export function validateTeamName(teamName: string): string | null {
  if (!teamName || !teamName.trim()) return 'Team name is required.';
  if (teamName.trim().length < 2) return 'Team name must be at least 2 characters.';
  if (teamName.trim().length > 50) return 'Team name cannot exceed 50 characters.';
  return null;
}

export function validateDepartment(dept: string): string | null {
  if (!dept || !dept.trim()) return 'Department is required.';
  if (dept.trim().length < 2) return 'Department must be at least 2 characters.';
  return null;
}

export function validateUtr(utr: string): string | null {
  if (!utr || !utr.trim()) return 'Transaction Ref / UTR number is required.';
  if (utr.trim().length < 6 || utr.trim().length > 20) {
    return 'UTR reference number must be between 6 and 20 characters.';
  }
  return null;
}
