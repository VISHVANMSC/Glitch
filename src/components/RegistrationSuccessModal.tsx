'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Copy, Check, MailCheck } from 'lucide-react';

export interface DetailItem {
  label: string;
  value: string;
}

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  details?: DetailItem[];
  primaryButtonText?: string;
  onPrimaryClick: () => void;
  autoRedirectSeconds?: number;
  showEmailNotice?: boolean;
}

export default function RegistrationSuccessModal({
  isOpen,
  title = 'Registration Successful!',
  subtitle = 'Your account has been registered successfully. Welcome to GLITCH 1.0!',
  badgeText = 'Registration Complete',
  details = [],
  primaryButtonText = 'Proceed',
  onPrimaryClick,
  autoRedirectSeconds,
  showEmailNotice = true,
}: RegistrationSuccessModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(autoRedirectSeconds ?? null);

  useEffect(() => {
    if (!isOpen || autoRedirectSeconds === undefined || autoRedirectSeconds === null) return;
    setCountdown(autoRedirectSeconds);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          onPrimaryClick();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, autoRedirectSeconds, onPrimaryClick]);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
      {/* Outer ambient glow */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 via-teal-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Modal Card */}
      <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-center overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 z-10">
        
        {/* Top Decorative Background Glow */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-teal-400/20 rounded-full blur-xl pointer-events-none" />

        {/* Badge Ribbon */}
        {badgeText && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-black uppercase tracking-wider mb-2">
            {badgeText}
          </div>
        )}

        {/* Google Pay Style Animated Tick Icon */}
        <div className="relative flex items-center justify-center my-5">
          {/* Pulsing Outer Rings */}
          <div className="absolute w-28 h-28 rounded-full bg-emerald-500/15 animate-gpay-ripple pointer-events-none" />
          <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-pulse pointer-events-none" />

          {/* Main Circle with Pop Animation */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/35 border-4 border-white animate-gpay-pop">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                className="animate-check-stroke"
              />
            </svg>
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-xs text-slate-600 font-semibold leading-relaxed px-2 mb-5">
          {subtitle}
        </p>

        {/* Detail Chips / Info List */}
        {details.length > 0 && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-4 space-y-2 text-left shadow-xs">
            {details.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-0">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  {item.label}
                </span>
                <div className="flex items-center gap-1.5 font-black text-slate-800">
                  <span className="truncate max-w-[200px]">{item.value}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.value, idx)}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Copy"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Email Delivery & Spam Notice Card */}
        {showEmailNotice && (
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 mb-6 text-left flex items-start gap-3 shadow-xs">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <MailCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-black text-amber-950 mb-0.5">Email Sent Successfully!</p>
              <p className="font-semibold text-[11px] text-amber-800">
                We’ve sent an email to your registered email address. If you don’t see it in your inbox, please check your <strong className="font-black underline decoration-amber-400">Spam / Junk folder</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onPrimaryClick}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
        >
          <span>{primaryButtonText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Optional Countdown Notice */}
        {countdown !== null && countdown > 0 && (
          <p className="text-[11px] font-bold text-slate-400 mt-3 animate-pulse">
            Redirecting automatically in {countdown}s...
          </p>
        )}
      </div>
    </div>
  );
}
