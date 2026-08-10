'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Automatically redirect Team Leader directly to Registration Form
      router.push('/register');
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
          <h2 className="text-2xl font-black text-slate-900">Team Leader Sign Up</h2>
          <p className="text-xs text-slate-600 font-semibold">
            Only Team Leader creates an account to register the team.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#E43D12] text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#E43D12] text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#E43D12] absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#E43D12] text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

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
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#E43D12] text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

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
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#E43D12] text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl btn-3d-primary font-black text-sm text-white shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#EFB11D]" />
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
    </div>
  );
}
