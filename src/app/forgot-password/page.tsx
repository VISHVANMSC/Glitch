'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
          <h2 className="text-2xl font-black text-slate-900">Forgot Password</h2>
          <p className="text-xs text-slate-600 font-semibold">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold ${
              status === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#E43D12] text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400"
              />
            </div>
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
