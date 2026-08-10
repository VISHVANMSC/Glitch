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
        {/* Brand Logo with Custom Uploaded Logo or Fallback Badge */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#E43D12] via-[#D6536D] to-[#EFB11D] p-0.5 shadow-md shadow-[#E43D12]/20 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="GLITCH Logo"
                  className="w-full h-full object-contain p-0.5 group-hover:rotate-6 transition-transform"
                />
              ) : (
                <span className="font-black text-[#E43D12] text-lg">G</span>
              )}
            </div>
          </div>
          <div>
            <span className="font-black text-lg tracking-tight text-slate-900 flex items-center gap-2">
              GLITCH{' '}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E43D12]/10 text-[#E43D12] font-extrabold border border-[#E43D12]/30 tracking-wider">
                1.0
              </span>
            </span>
            <p className="text-[9px] uppercase font-extrabold tracking-widest text-[#D6536D]">
              National Level Hackathon
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-700">
          <Link href="#about" className="hover:text-[#E43D12] transition-colors">
            About
          </Link>
          <Link href="#highlights" className="hover:text-[#E43D12] transition-colors">
            Highlights
          </Link>
          <Link href="#agenda" className="hover:text-[#E43D12] transition-colors">
            Agenda
          </Link>
          <Link href="#rules" className="hover:text-[#E43D12] transition-colors">
            Rules
          </Link>
          <Link href="#faqs" className="hover:text-[#E43D12] transition-colors">
            FAQs
          </Link>
          <Link href="#coordinators" className="hover:text-[#E43D12] transition-colors">
            Coordinators
          </Link>
          <Link href="#contact" className="hover:text-[#E43D12] transition-colors">
            Contact
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 text-slate-900 border border-slate-300/80 hover:border-[#E43D12] hover:text-[#E43D12] font-extrabold text-sm transition-all shadow-sm"
              >
                {user.role === 'ADMIN' ? (
                  <ShieldCheck className="w-4 h-4 text-[#E43D12]" />
                ) : (
                  <LayoutDashboard className="w-4 h-4 text-[#E43D12]" />
                )}
                {user.role === 'ADMIN' ? 'Admin Panel' : 'My Dashboard'}
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50/80 rounded-full transition-colors border border-transparent hover:border-red-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
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

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:bg-slate-100/80 rounded-full border border-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white/90 backdrop-blur-2xl border border-white/70 rounded-3xl px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200 shadow-2xl">
          <div className="flex flex-col space-y-3 font-bold text-slate-700">
            <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E43D12] transition-colors">
              About
            </Link>
            <Link href="#highlights" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E43D12] transition-colors">
              Highlights
            </Link>
            <Link href="#agenda" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E43D12] transition-colors">
              Agenda
            </Link>
            <Link href="#rules" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E43D12] transition-colors">
              Rules
            </Link>
            <Link href="#faqs" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E43D12] transition-colors">
              FAQs
            </Link>
            <Link href="#coordinators" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E43D12] transition-colors">
              Coordinators
            </Link>
            <Link href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#E43D12] transition-colors">
              Contact
            </Link>
          </div>
          <div className="pt-4 border-t border-slate-200/80 flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-slate-100 text-slate-900 font-extrabold border border-slate-300"
                >
                  {user.role === 'ADMIN' ? 'Admin Panel' : 'My Dashboard'}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center py-2.5 rounded-full text-red-600 bg-red-50 font-extrabold border border-red-200"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
