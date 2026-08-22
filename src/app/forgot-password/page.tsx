'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, MailCheck, AlertCircle } from 'lucide-react';
import { validateEmail } from '@/lib/validation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const emailError = useMemo(() => validateEmail(email), [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (emailError) {
      setStatus('error');
      setMessage('Please enter a valid registered email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process request');

      setStatus('success');
      setMessage(data.message || 'If an account exists, a reset link has been dispatched to your email.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 bg-cyber-grid relative overflow-hidden text-slate-900">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#E43D12]/10 via-[#EFB11D]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      <div className="max-w-md w-full card-3d p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 group mb-2 justify-center">
            <img src="/images/logo.png" alt="GLITCH 1.0 Logo" className="h-12 w-auto object-contain max-w-[220px]" />
          </Link>
          <h2 className="text-2xl font-black text-slate-900">Forgot Password</h2>
          <p className="text-xs text-slate-600 font-semibold">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold shadow-xs ${
              status === 'success'
                ? 'bg-amber-50 border border-amber-200 text-amber-900'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}
          >
            {status === 'success' ? (
              <div className="space-y-1.5">
                <p className="font-black text-amber-950 text-sm flex items-center gap-1.5">
                  <MailCheck className="w-4.5 h-4.5 text-amber-600" /> Email Sent Successfully!
                </p>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  We’ve sent a password reset link to your registered email address. If you don’t see it in your inbox, please check your <strong className="font-black underline decoration-amber-400">Spam / Junk folder</strong>.
                </p>
              </div>
            ) : (
              message
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
              Registered Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#E43D12] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="leader@college.edu"
                value={email}
                onBlur={() => setTouched(true)}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors ${
                  touched && emailError
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-slate-300 focus:border-[#E43D12]'
                }`}
              />
            </div>
            {touched && emailError && (
              <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                {emailError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3.5 rounded-xl btn-3d-primary font-black text-sm text-white shadow-lg flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 text-[#EFB11D]" />
            {status === 'loading' ? 'Sending Link...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-[#E43D12] font-extrabold hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
