'use client';

import { useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, LogIn, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import { validateEmail } from '@/lib/validation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdminParam = searchParams.get('admin') === 'true';
  const isInactivityLogout = searchParams.get('reason') === 'inactivity';

  const [formData, setFormData] = useState({
    email: isAdminParam ? 'admin@glitch.com' : '',
    password: '',
  });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailError = useMemo(() => validateEmail(formData.email), [formData.email]);
  const passwordError = useMemo(() => (!formData.password ? 'Password is required.' : null), [formData.password]);
  const isFormValid = !emailError && !passwordError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!isFormValid) {
      setError('Please enter a valid email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full card-3d p-8 sm:p-10 rounded-3xl bg-white border-2 border-slate-300 shadow-2xl relative z-10 space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-3 group mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E43D12] via-[#D6536D] to-[#EFB11D] p-0.5 shadow-md">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
              <img src="/images/mascot_3d.png" alt="Glitchy Mascot" className="w-9 h-9 object-contain" />
            </div>
          </div>
          <span className="font-black text-2xl tracking-tight text-black">
            GLITCH <span className="text-xs px-2 py-0.5 rounded-full bg-[#E43D12]/10 text-[#E43D12] font-extrabold border border-[#E43D12]/30">1.0</span>
          </span>
        </Link>
        
        {isAdminParam ? (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/40 text-xs font-black uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-[#E43D12]" /> Admin Security Portal
          </div>
        ) : (
          <h2 className="text-2xl font-black text-black">Account Login</h2>
        )}

        <p className="text-xs text-black font-extrabold">
          {isAdminParam ? 'GLITCH 1.0 Admin Command Authorization' : 'Team Leader & Participant Authorization Portal'}
        </p>
      </div>

      {isInactivityLogout && (
        <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs font-black text-amber-900 flex items-center gap-2 animate-in fade-in duration-200">
          <Clock className="w-4 h-4 text-amber-700 shrink-0" />
          <span>You were automatically logged out due to 3 minutes of inactivity. Please log in again to continue.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-200 text-xs font-black text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#E43D12] absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              placeholder="mail@college.edu"
              value={formData.email}
              onBlur={() => setTouched({ ...touched, email: true })}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 text-sm font-extrabold bg-white text-black placeholder-slate-500 shadow-sm transition-colors ${
                touched.email && emailError
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-slate-300 focus:border-[#E43D12]'
              }`}
            />
          </div>
          {touched.email && emailError && (
            <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
              {emailError}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black">
              Password *
            </label>
            <Link href="/forgot-password" className="text-xs font-black text-[#E43D12] hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#E43D12] absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onBlur={() => setTouched({ ...touched, password: true })}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 text-sm font-extrabold bg-white text-black placeholder-slate-500 shadow-sm transition-colors ${
                touched.password && passwordError
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-slate-300 focus:border-[#E43D12]'
              }`}
            />
          </div>
          {touched.password && passwordError && (
            <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
              {passwordError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || (touched.email && !isFormValid)}
          className="w-full py-3.5 rounded-xl btn-3d-primary font-black text-sm text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="font-black">Authenticating...</span>
          ) : (
            <>
              <LogIn className="w-4 h-4 text-white" />
              <span className="font-black">Sign In to Portal</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-black font-extrabold">
          Don't have an account yet?{' '}
          <Link href="/signup" className="text-[#E43D12] font-black hover:underline">
            Create Team Leader Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 bg-cyber-grid relative overflow-hidden text-black">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#E43D12]/10 via-[#EFB11D]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <Suspense fallback={<div className="text-black font-black text-sm">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
