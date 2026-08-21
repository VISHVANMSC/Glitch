'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-100/80 text-slate-700 pt-16 pb-8 border-t border-slate-200 relative overflow-hidden">
      {/* Warm Glow accent background */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-gradient-to-t from-[#E43D12]/15 via-[#D6536D]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-200">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#E43D12] via-[#D6536D] to-[#EFB11D] p-0.5 shadow-md">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                  <span className="font-black text-[#E43D12] text-lg">G</span>
                </div>
              </div>
              <span className="font-black text-2xl tracking-tight text-slate-900">
                GLITCH <span className="text-xs px-2 py-0.5 rounded-full bg-[#E43D12]/10 text-[#E43D12] font-extrabold border border-[#E43D12]/30">1.0</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              A Premier 24hrs National Level Hackathon uniting visionary student innovators, developers, and designers to shape the next technological wave.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30">
                <Shield className="w-3.5 h-3.5 text-[#E43D12]" /> Verified Event
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#E43D12]">Quick Links</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="#about" className="hover:text-[#E43D12] transition-colors text-slate-600">
                  About GLITCH - 1.0
                </Link>
              </li>
              <li>
                <Link href="#highlights" className="hover:text-[#E43D12] transition-colors text-slate-600">
                  Event Highlights & Tracks
                </Link>
              </li>
              <li>
                <Link href="#agenda" className="hover:text-[#E43D12] transition-colors text-slate-600">
                  Schedule & Timeline
                </Link>
              </li>
              <li>
                <Link href="#rules" className="hover:text-[#E43D12] transition-colors text-slate-600">
                  Rules & Eligibility
                </Link>
              </li>
              <li>
                <Link href="#coordinators" className="hover:text-[#E43D12] transition-colors text-slate-600">
                  Organizing Committee
                </Link>
              </li>
            </ul>
          </div>

          {/* Hackathon Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#E43D12]">Hackathon Portals</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/signup" className="hover:text-[#E43D12] transition-colors text-slate-600">
                  Team Registration
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#E43D12] transition-colors text-slate-600">
                  Team Leader Login
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#E43D12] transition-colors text-slate-600">
                  Participant Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#E43D12]">Contact & Venue</h4>
            <div className="space-y-2.5 text-xs text-slate-600 font-medium">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E43D12] shrink-0 mt-0.5" />
                <span>Convention Center, Main Campus, Tech Hub City, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E43D12] shrink-0" />
                <a href="mailto:glitch.hackathon.official@gmail.com" className="hover:text-[#E43D12] transition-colors">
                  glitch.hackathon.official@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E43D12] shrink-0" />
                <span>+91 93429 92454</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
          <p>© 2026 GLITCH - 1.0 National Level Hackathon. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Code of Conduct</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
