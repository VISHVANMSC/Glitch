'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Clock, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';

const INACTIVITY_LIMIT_MS = 3 * 60 * 1000; // 3 Minutes (180,000 ms)
const WARNING_THRESHOLD_MS = 30 * 1000;     // Show warning 30 seconds before logout (150s of inactivity)

export default function AutoLogoutListener() {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(30);

  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Check if a user session is active
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(!!data.user);
      } else {
        setIsLoggedIn(false);
      }
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [pathname, checkSession]);

  // 2. Perform Automatic Logout
  const performAutoLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Auto logout error:', err);
    } finally {
      setIsLoggedIn(false);
      setShowWarningModal(false);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      router.push('/login?reason=inactivity');
    }
  }, [router]);

  // 3. Reset Inactivity Timer when activity is detected
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (showWarningModal) {
      setShowWarningModal(false);
    }

    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    if (!isLoggedIn) return;

    // Set timer to show warning at 2min 30s
    warningTimerRef.current = setTimeout(() => {
      setShowWarningModal(true);
      setCountdownSeconds(30);

      // Start 30-second countdown ticker
      let remaining = 30;
      countdownIntervalRef.current = setInterval(() => {
        remaining -= 1;
        setCountdownSeconds(remaining);
        if (remaining <= 0) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        }
      }, 1000);
    }, INACTIVITY_LIMIT_MS - WARNING_THRESHOLD_MS);

    // Set timer for hard auto logout at 3 minutes
    logoutTimerRef.current = setTimeout(() => {
      performAutoLogout();
    }, INACTIVITY_LIMIT_MS);
  }, [isLoggedIn, showWarningModal, performAutoLogout]);

  // 4. Attach Global User Activity Listeners
  useEffect(() => {
    if (!isLoggedIn) return;

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    
    // Throttle activity resets so high-frequency events (mousemove/scroll) don't thrash
    let throttleTimeout: NodeJS.Timeout | null = null;
    const handleUserActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
          resetInactivityTimer();
        }, 1000);
      }
    };

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Initial start of timer
    resetInactivityTimer();

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      if (throttleTimeout) clearTimeout(throttleTimeout);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isLoggedIn, resetInactivityTimer]);

  if (!isLoggedIn || !showWarningModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#E43D12] text-center space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Top Warning Icon Badge */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200 shadow-md">
          <Clock className="w-8 h-8 text-red-600 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-black uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" /> Inactivity Alert
          </span>
          <h3 className="text-2xl font-black text-slate-900">Are you still there?</h3>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            You have been inactive for nearly 3 minutes. To protect your security, your session will automatically log out in:
          </p>
        </div>

        {/* 30-Second Countdown Badge */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
          <div className="text-4xl font-black text-[#E43D12] font-mono tracking-tight">
            00:{String(countdownSeconds).padStart(2, '0')}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1 block">
            Seconds Until Auto Logout
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => performAutoLogout()}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-extrabold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-500" /> Logout Now
          </button>
          <button
            onClick={() => resetInactivityTimer()}
            className="w-full px-4 py-3 rounded-xl btn-3d-primary text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-white" /> Stay Logged In
          </button>
        </div>

      </div>
    </div>
  );
}
