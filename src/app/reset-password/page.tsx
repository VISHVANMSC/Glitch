'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
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
        <Link href="/" className="inline-flex items-center gap-3 group mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E43D12] via-[#D6536D] to-[#EFB11D] p-0.5 shadow-md">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
              <img src="/images/mascot_3d.png" alt="Glitchy Mascot" className="w-9 h-9 object-contain" />
            </div>
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-900">
            GLITCH <span className="text-xs px-2 py-0.5 rounded-full bg-[#E43D12]/10 text-[#E43D12] font-extrabold border border-[#E43D12]/30">1.0</span>
          </span>
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
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#E43D12] text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400"
                />
              </div>
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
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#E43D12] text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl btn-3d-primary font-black text-sm text-white shadow-lg flex items-center justify-center gap-2"
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
