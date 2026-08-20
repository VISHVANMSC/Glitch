'use client';

import React from 'react';
import { evaluatePassword } from '@/lib/validation';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  confirmPassword?: string;
  showConfirmMatch?: boolean;
}

export default function PasswordStrengthIndicator({
  password,
  confirmPassword,
  showConfirmMatch = true,
}: PasswordStrengthIndicatorProps) {
  const evalResult = evaluatePassword(password);

  const criteriaItems = [
    { label: 'At least 8 characters', met: evalResult.minLength },
    { label: 'At least 1 uppercase letter (A-Z)', met: evalResult.hasUpper },
    { label: 'At least 1 lowercase letter (a-z)', met: evalResult.hasLower },
    { label: 'At least 1 number (0-9)', met: evalResult.hasNumber },
    { label: 'At least 1 special character (@, #, $, %, !)', met: evalResult.hasSpecial },
  ];

  const hasPassword = password.length > 0;
  const hasConfirm = confirmPassword !== undefined && confirmPassword.length > 0;
  const passwordsMatch = hasConfirm && password === confirmPassword;

  return (
    <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 shadow-xs text-xs transition-all">
      {/* Password Strength Header & Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5 font-extrabold">
          <span className="text-slate-700 text-[11px] uppercase tracking-wider">Password Strength:</span>
          <span className={`font-black text-xs ${hasPassword ? evalResult.textColor : 'text-slate-400'}`}>
            {hasPassword ? evalResult.strengthLabel : 'Not entered'}
          </span>
        </div>

        {/* 5-Segment Progress Bar */}
        <div className="grid grid-cols-5 gap-1.5 h-2 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5">
          {[1, 2, 3, 4, 5].map((level) => {
            const isActive = level <= evalResult.score && hasPassword;
            return (
              <div
                key={level}
                className={`h-full rounded-full transition-all duration-300 ${
                  isActive ? evalResult.strengthColor : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Criteria Real-Time Checklist */}
      <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
          Password Requirements:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {criteriaItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${
                item.met ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                  item.met
                    ? 'bg-emerald-100 text-emerald-700 font-black'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {item.met ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className={item.met ? 'line-through decoration-emerald-500/50' : ''}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Password Real-Time Match Indicator */}
      {showConfirmMatch && hasConfirm && (
        <div className="pt-2 border-t border-slate-200/60">
          {passwordsMatch ? (
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Passwords match perfectly!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-black text-red-600 bg-red-50 px-2.5 py-1.5 rounded-xl border border-red-200">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Passwords do not match.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
