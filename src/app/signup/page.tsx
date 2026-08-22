'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import RegistrationSuccessModal from '@/components/RegistrationSuccessModal';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import { validateName, validateEmail, validatePhone, evaluatePassword } from '@/lib/validation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<{ name: string; email: string } | null>(null);

  // Field Validations
  const fieldErrors = useMemo(() => {
    const nameErr = validateName(formData.name);
    const emailErr = validateEmail(formData.email);
    const phoneErr = validatePhone(formData.phone);
    const passCriteria = evaluatePassword(formData.password);
    
    let passErr: string | null = null;
    if (!formData.password) {
      passErr = 'Password is required.';
    } else if (!passCriteria.isAllMet) {
      passErr = 'Password must meet all 5 security requirements.';
    }

    let confirmErr: string | null = null;
    if (!formData.confirmPassword) {
      confirmErr = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      confirmErr = 'Passwords do not match.';
    }

    return {
      name: nameErr,
      email: emailErr,
      phone: phoneErr,
      password: passErr,
      confirmPassword: confirmErr,
      isAllValid: !nameErr && !emailErr && !phoneErr && !passErr && !confirmErr,
    };
  }, [formData]);

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mark all as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    if (!fieldErrors.isAllValid) {
      setError('Please fix all form validation errors before submitting.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setRegisteredUser({
        name: data.user?.name || formData.name,
        email: data.user?.email || formData.email,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 bg-cyber-grid relative overflow-hidden text-slate-900">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#E43D12]/10 via-[#EFB11D]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      <div className="max-w-md w-full card-3d p-8 sm:p-10 rounded-3xl bg-white border-slate-200 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 group mb-2 justify-center">
            <img src="/images/logo.png" alt="GLITCH 1.0 Logo" className="h-12 w-auto object-contain max-w-[220px]" />
          </Link>
          <h2 className="text-2xl font-black text-slate-900">Team Leader Sign Up</h2>
          <p className="text-xs text-slate-600 font-semibold">
            Only Team Leader creates an account to register the team.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
              Full Name (Team Leader) *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#E43D12] absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={formData.name}
                onBlur={() => handleBlur('name')}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors ${
                  touched.name && fieldErrors.name
                    ? 'border-red-500 bg-red-50/20 focus:border-red-600'
                    : 'border-slate-300 focus:border-[#E43D12]'
                }`}
              />
            </div>
            {touched.name && fieldErrors.name && (
              <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#E43D12] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@college.edu"
                value={formData.email}
                onBlur={() => handleBlur('email')}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors ${
                  touched.email && fieldErrors.email
                    ? 'border-red-500 bg-red-50/20 focus:border-red-600'
                    : 'border-slate-300 focus:border-[#E43D12]'
                }`}
              />
            </div>
            {touched.email && fieldErrors.email && (
              <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#E43D12] absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={formData.phone}
                onBlur={() => handleBlur('phone')}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors ${
                  touched.phone && fieldErrors.phone
                    ? 'border-red-500 bg-red-50/20 focus:border-red-600'
                    : 'border-slate-300 focus:border-[#E43D12]'
                }`}
              />
            </div>
            {touched.phone && fieldErrors.phone && (
              <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                {fieldErrors.phone}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#E43D12] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onBlur={() => handleBlur('password')}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors ${
                  touched.password && fieldErrors.password
                    ? 'border-red-500 bg-red-50/20 focus:border-red-600'
                    : 'border-slate-300 focus:border-[#E43D12]'
                }`}
              />
            </div>
            {/* Real-Time Password Strength Component */}
            <PasswordStrengthIndicator
              password={formData.password}
              confirmPassword={formData.confirmPassword}
              showConfirmMatch={false}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#E43D12] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onBlur={() => handleBlur('confirmPassword')}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors ${
                  touched.confirmPassword && fieldErrors.confirmPassword
                    ? 'border-red-500 bg-red-50/20 focus:border-red-600'
                    : 'border-slate-300 focus:border-[#E43D12]'
                }`}
              />
            </div>
            {touched.confirmPassword && fieldErrors.confirmPassword && (
              <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (touched.password && !fieldErrors.isAllValid)}
            className="w-full py-3.5 rounded-xl btn-3d-primary font-black text-sm text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                Sign Up & Proceed to Registration
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-600 font-semibold">
            Already registered?{' '}
            <Link href="/login" className="text-[#E43D12] font-black hover:underline">
              Log In to Leader Dashboard
            </Link>
          </p>
        </div>
      </div>

      <RegistrationSuccessModal
        isOpen={showSuccessModal}
        title="Account Registered Successfully!"
        subtitle={`Welcome, ${registeredUser?.name || 'Leader'}! Your account has been registered successfully. A welcome email with team registration details has been sent.`}
        badgeText="Account Created"
        details={[
          { label: 'Leader Name', value: registeredUser?.name || '' },
          { label: 'Registered Email', value: registeredUser?.email || '' },
          { label: 'Role', value: 'Team Leader' },
        ]}
        primaryButtonText="Proceed to Team Registration"
        onPrimaryClick={() => router.push('/register')}
      />
    </div>
  );
}
