'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: 'ADMIN' | 'TEAM_LEADER';
  } | null;
}

export default function Navbar({ user: initialUser }: NavbarProps) {
  const [user, setUser] = useState(initialUser || null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    fetch('/api/admin/cms')
      .then((res) => res.json())
      .then((data) => {
        if (data.content?.logoUrl) {
          setLogoUrl(data.content.logoUrl);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!initialUser) {
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setUser(data.user);
        })
        .catch(() => {});
    }
  }, [initialUser]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto px-5 py-2.5 rounded-full transition-all duration-300 flex items-center justify-between ${
          scrolled
            ? 'bg-white/80 backdrop-blur-2xl border border-white/70 shadow-xl shadow-slate-900/10'
            : 'bg-white/65 backdrop-blur-xl border border-white/50 shadow-lg shadow-slate-900/5'
        }`}
      >
        {/* Brand Logo with Official GLITCH 1.0 Logo */}
        <Link href={user ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-3 group">
          <div className="relative h-10 w-auto flex items-center justify-center group-hover:scale-105 transition-transform">
            <img
              src={logoUrl || '/images/logo.png'}
              alt="GLITCH 1.0 Logo"
              className="h-10 w-auto object-contain max-w-[180px]"
            />
          </div>
        </Link>

        {/* Desktop Navigation Links (Only shown for guest visitors) */}
        {!user && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-700">
            <Link href="/#about" className="hover:text-[#E43D12] transition-colors">
              About
            </Link>
            <Link href="/#agenda" className="hover:text-[#E43D12] transition-colors">
              Agenda
            </Link>
            <Link href="/#rules" className="hover:text-[#E43D12] transition-colors">
              Rules
            </Link>
            <Link href="/#faqs" className="hover:text-[#E43D12] transition-colors">
              FAQs
            </Link>
            <Link href="/#coordinators" className="hover:text-[#E43D12] transition-colors">
              Coordinators
            </Link>
            <Link href="/#contact" className="hover:text-[#E43D12] transition-colors">
              Contact
            </Link>
          </nav>
        )}

        {/* Right Actions: Logout button when logged in, or Login/Register CTAs when guest */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 text-slate-900 border border-slate-300/80 hover:border-[#E43D12] hover:text-[#E43D12] font-extrabold text-sm transition-all shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-[#E43D12]" />
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-extrabold text-sm transition-all shadow-sm cursor-pointer"
                title="Logout"
              >
                <span>Log Out</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-slate-700 hover:text-[#E43D12] font-extrabold text-sm transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 rounded-full btn-3d-primary font-black text-sm text-white shadow-lg transition-all"
              >
                Register Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button (Only for guest visitors) */}
        {!user && (
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100/80 rounded-full border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu (Only for guest visitors) */}
      {!user && mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white/90 backdrop-blur-2xl border border-white/70 rounded-3xl px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200 shadow-2xl">
          <div className="flex flex-col space-y-3 font-bold text-slate-700">
            <Link href="/#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E43D12] transition-colors">
              About
            </Link>
            <Link href="/#agenda" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E43D12] transition-colors">
              Agenda
            </Link>
            <Link href="/#rules" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E43D12] transition-colors">
              Rules
            </Link>
            <Link href="/#faqs" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E43D12] transition-colors">
              FAQs
            </Link>
            <Link href="/#coordinators" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E43D12] transition-colors">
              Coordinators
            </Link>
            <Link href="/#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E43D12] transition-colors">
              Contact
            </Link>
          </div>
          <div className="pt-4 border-t border-slate-200/80 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full border border-slate-300 text-slate-800 font-extrabold"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full btn-3d-primary font-black text-white shadow-lg"
            >
              Register Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
