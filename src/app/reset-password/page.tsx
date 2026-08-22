'use client';

import { useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import { evaluatePassword } from '@/lib/validation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ newPassword: false, confirmPassword: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passCriteria = useMemo(() => evaluatePassword(newPassword), [newPassword]);

  const confirmError = useMemo(() => {
    if (!confirmPassword) return 'Please confirm your new password.';
    if (newPassword !== confirmPassword) return 'Passwords do not match.';
    return null;
  }, [newPassword, confirmPassword]);

  const isValid = passCriteria.isAllMet && !confirmError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ newPassword: true, confirmPassword: true });

    if (!isValid) {
      setError('Please satisfy all password criteria and ensure passwords match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full card-3d p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-2xl relative z-10 space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-3 group mb-2 justify-center">
          <img src="/images/logo.png" alt="GLITCH 1.0 Logo" className="h-12 w-auto object-contain max-w-[220px]" />
        </Link>
        <h2 className="text-2xl font-black text-slate-900">Create New Password</h2>
        <p className="text-xs text-slate-600 font-semibold">
          Enter your new password below to secure your account.
        </p>
      </div>

      {success ? (
        <div className="space-y-4 text-center">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-black text-base text-emerald-900">Password Reset Complete!</h4>
            <p className="text-xs font-semibold text-emerald-700">
              Your password has been updated successfully. You can now log into your portal.
            </p>
          </div>
          <Link
            href="/login"
            className="w-full py-3.5 rounded-xl btn-3d-primary font-black text-sm text-white shadow-lg flex items-center justify-center gap-2"
          >
            Go to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#E43D12] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onBlur={() => setTouched({ ...touched, newPassword: true })}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors ${
                    touched.newPassword && !passCriteria.isAllMet
                      ? 'border-red-500 bg-red-50/20'
                      : 'border-slate-300 focus:border-[#E43D12]'
                  }`}
                />
              </div>

              {/* Password Strength Indicator */}
              <PasswordStrengthIndicator
                password={newPassword}
                confirmPassword={confirmPassword}
                showConfirmMatch={false}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#E43D12] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors ${
                    touched.confirmPassword && confirmError
                      ? 'border-red-500 bg-red-50/20'
                      : 'border-slate-300 focus:border-[#E43D12]'
                  }`}
                />
              </div>
              {touched.confirmPassword && confirmError && (
                <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  {confirmError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (touched.newPassword && !isValid)}
              className="w-full py-3.5 rounded-xl btn-3d-primary font-black text-sm text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 bg-cyber-grid relative overflow-hidden text-slate-900">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#E43D12]/10 via-[#EFB11D]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <Suspense fallback={<div className="text-slate-600 font-bold">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
