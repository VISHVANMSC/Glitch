'use client';

import { useState, useEffect } from 'react';
import { Zap, CheckCircle2, Flame, Trophy, UserCheck, AlertCircle } from 'lucide-react';

interface CountdownTimerProps {
  targetDate?: string; // Event Start Time (e.g. 2026-10-24T08:30:00)
  endDate?: string;    // Event End Time (default 24h after targetDate)
}

export default function CountdownTimer({
  targetDate = '2026-10-24T08:30:00',
  endDate = '2026-10-25T08:30:00',
}: CountdownTimerProps) {
  // Event State Engine: 'BEFORE_EVENT' | 'EVENT_STARTED' | 'EVENT_COMPLETED'
  const [eventState, setEventState] = useState<'BEFORE_EVENT' | 'EVENT_STARTED' | 'EVENT_COMPLETED'>('BEFORE_EVENT');

  // Backend Authenticated User & Team State
  const [hasRegisteredTeam, setHasRegisteredTeam] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [progressPercent, setProgressPercent] = useState(15);

  // 1. Fetch authenticated user's actual team registration status from backend
  useEffect(() => {
    let isMounted = true;
    async function checkUserTeamStatus() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setIsLoggedIn(!!data.user);
            // Registration is ONLY completed if the user has successfully registered a team in the database
            setHasRegisteredTeam(!!data.team);
          }
        }
      } catch (err) {
        console.error('Error fetching user team status:', err);
      } finally {
        if (isMounted) setLoadingAuth(false);
      }
    }

    checkUserTeamStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Timeline & Countdown Engine
  useEffect(() => {
    const updateEventEngine = () => {
      const now = +new Date();
      const startTime = +new Date(targetDate);
      const endTime = endDate ? +new Date(endDate) : startTime + 24 * 60 * 60 * 1000;

      if (now < startTime) {
        // PHASE 1: BEFORE EVENT STARTS
        setEventState('BEFORE_EVENT');
        const diff = startTime - now;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });

        // Calculate Progress
        if (!hasRegisteredTeam) {
          const TOTAL_SECONDS = 90 * 24 * 60 * 60;
          const remainingSec = Math.floor(diff / 1000);
          const elapsed = Math.max(0, TOTAL_SECONDS - remainingSec);
          const pct = Math.min(48, Math.max(8, (elapsed / TOTAL_SECONDS) * 48));
          setProgressPercent(pct);
        } else {
          const TOTAL_SECONDS = 60 * 24 * 60 * 60;
          const remainingSec = Math.floor(diff / 1000);
          const elapsed = Math.max(0, TOTAL_SECONDS - remainingSec);
          const pct = 50 + Math.min(46, Math.max(0, (elapsed / TOTAL_SECONDS) * 46));
          setProgressPercent(pct);
        }
      } else if (now >= startTime && now < endTime) {
        // PHASE 2: EVENT STARTED (24H Live Hackathon & PS Choosing Visible)
        setEventState('EVENT_STARTED');
        const diff = endTime - now;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
        setProgressPercent(100);
      } else {
        // PHASE 3: EVENT COMPLETED
        setEventState('EVENT_COMPLETED');
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setProgressPercent(100);
      }
    };

    updateEventEngine();
    const timer = setInterval(updateEventEngine, 1000);
    return () => clearInterval(timer);
  }, [targetDate, endDate, hasRegisteredTeam]);

  // 3. Dynamically Generate Milestones based on Event Phase & Sequence Rules
  const getMilestones = () => {
    if (eventState === 'BEFORE_EVENT') {
      return [
        {
          id: 'announcement',
          percent: 0,
          label: 'Announcement',
          sub: 'Completed',
          status: 'COMPLETED',
        },
        {
          id: 'registration',
          percent: 50,
          label: 'Registration',
          sub: hasRegisteredTeam ? 'Team Registered ✓' : isLoggedIn ? 'Register Team Required' : 'Action Required',
          status: hasRegisteredTeam ? 'COMPLETED' : 'INCOMPLETE',
        },
        {
          id: 'event_starts',
          percent: 100,
          label: 'Event Starts',
          sub: 'Countdown Active',
          status: 'UPCOMING',
        },
      ];
    }

    if (eventState === 'EVENT_STARTED') {
      return [
        {
          id: 'announcement',
          percent: 0,
          label: 'Announcement',
          sub: 'Completed',
          status: 'COMPLETED',
        },
        {
          id: 'registration',
          percent: 33,
          label: 'Registration',
          sub: 'Completed',
          status: 'COMPLETED',
        },
        {
          id: 'event_started',
          percent: 66,
          label: 'Event Started',
          sub: 'Live Now 🔥',
          status: 'LIVE',
        },
        {
          id: 'ps_choosing',
          percent: 100,
          label: 'PS Choosing',
          sub: 'Selection Window Open',
          status: 'ACTIVE',
        },
      ];
    }

    // EVENT COMPLETED
    return [
      {
        id: 'announcement',
        percent: 0,
        label: 'Announcement',
        sub: 'Completed',
        status: 'COMPLETED',
      },
      {
        id: 'registration',
        percent: 25,
        label: 'Registration',
        sub: 'Completed',
        status: 'COMPLETED',
      },
      {
        id: 'event_started',
        percent: 50,
        label: 'Event Started',
        sub: 'Completed',
        status: 'COMPLETED',
      },
      {
        id: 'ps_choosing',
        percent: 75,
        label: 'PS Choosing',
        sub: 'Completed',
        status: 'COMPLETED',
      },
      {
        id: 'completed',
        percent: 100,
        label: 'GLITCH 1.0 Completed',
        sub: 'Concluded 🏆',
        status: 'COMPLETED',
      },
    ];
  };

  const milestones = getMilestones();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-center my-4">
      {/* Top Header Badge */}
      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 text-xs font-black uppercase tracking-widest shadow-xs">
        {eventState === 'BEFORE_EVENT' && (
          <span>
            {hasRegisteredTeam
              ? 'THE TIMELINE IS RACING TOWARD GLITCH 1.0 — TEAM REGISTERED ✓'
              : 'THE TIMELINE IS RACING TOWARD GLITCH 1.0 — REGISTER YOUR TEAM NOW!'}
          </span>
        )}
        {eventState === 'EVENT_STARTED' && (
          <>
            <Flame className="w-4 h-4 text-[#E43D12] animate-bounce" />
            <span className="text-red-700">⚡ GLITCH 1.0 EVENT STARTED — PS CHOOSING IS LIVE & UNDERWAY!</span>
          </>
        )}
        {eventState === 'EVENT_COMPLETED' && (
          <>
            <Trophy className="w-4 h-4 text-[#EFB11D]" />
            <span className="text-emerald-800">🏆 GLITCH 1.0 COMPLETED — CONGRATULATIONS TO ALL PARTICIPANTS!</span>
          </>
        )}
      </div>

      {/* Main Light Theme Card Container */}
      <div className="card-3d p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl text-slate-900 relative overflow-hidden space-y-8">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-[#E43D12]/5 via-[#EFB11D]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Dynamic Horizontal Journey Tracker */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-700 px-1">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#E43D12]" /> TRAJECTORY & TIMELINE JOURNEY
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black border ${
                eventState === 'EVENT_STARTED'
                  ? 'bg-red-100 text-red-700 border-red-300 animate-pulse'
                  : eventState === 'EVENT_COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : hasRegisteredTeam
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              {eventState === 'BEFORE_EVENT' &&
                (hasRegisteredTeam ? 'STAGE: REGISTRATION COMPLETED ✓' : 'STAGE: REGISTRATION PENDING')}
              {eventState === 'EVENT_STARTED' && 'STAGE: EVENT STARTED & PS CHOOSING LIVE 🔥'}
              {eventState === 'EVENT_COMPLETED' && 'STATUS: GLITCH 1.0 COMPLETED 🏆'}
            </span>
          </div>

          {/* Track Bar Section */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-inner space-y-6">
            
            {/* Horizontal Line with Progress Node */}
            <div className="relative w-full h-12 flex items-center">
              
              {/* Background Track Line */}
              <div className="absolute left-2 right-2 h-3.5 bg-slate-200 rounded-full border border-slate-300/80 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#E43D12] via-[#D6536D] to-[#EFB11D] rounded-full transition-all duration-700 ease-out shadow-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Glowing Progress Indicator Node */}
              <div
                className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center transition-all duration-700 ease-out pointer-events-none"
                style={{ left: `calc(${progressPercent}% - 14px)` }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#E43D12] to-[#EFB11D] p-0.5 shadow-md shadow-[#E43D12]/30">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    {eventState === 'EVENT_COMPLETED' ? (
                      <Trophy className="w-4 h-4 text-[#EFB11D]" />
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-[#E43D12] animate-ping" />
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Milestone Cards Row Below Track */}
            <div className={`grid gap-2 pt-1 border-t border-slate-200/80 ${milestones.length === 5 ? 'grid-cols-2 sm:grid-cols-5' : milestones.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
              {milestones.map((m) => {
                const isCompleted = m.status === 'COMPLETED';
                const isActive = m.status === 'ACTIVE' || m.status === 'LIVE';
                const isIncomplete = m.status === 'INCOMPLETE';

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-amber-50/90 border-[#E43D12] shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : isIncomplete
                        ? 'bg-amber-50/40 border-amber-300'
                        : 'bg-white border-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isActive ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E43D12] animate-ping shrink-0" />
                      ) : isIncomplete ? (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                      )}
                      <span
                        className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                          isActive
                            ? 'text-[#E43D12]'
                            : isCompleted
                            ? 'text-emerald-900'
                            : isIncomplete
                            ? 'text-amber-900'
                            : 'text-slate-500'
                        }`}
                      >
                        {m.label} {isCompleted && '✓'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">{m.sub}</span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Dynamic Countdown / Status Cards */}
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
            {eventState === 'BEFORE_EVENT' && '⏱️ COUNTDOWN TO EVENT START'}
            {eventState === 'EVENT_STARTED' && '🔥 24-HOUR HACKATHON TIME REMAINING'}
            {eventState === 'EVENT_COMPLETED' && '🏆 HACKATHON CONCLUDED'}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
            {[
              { label: 'DAYS', value: timeLeft.days },
              { label: 'HOURS', value: timeLeft.hours },
              { label: 'MINUTES', value: timeLeft.minutes },
              { label: 'SECONDS', value: timeLeft.seconds },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-4 sm:p-6 rounded-2xl border transition-all text-center group ${
                  eventState === 'EVENT_STARTED'
                    ? 'bg-red-50/50 border-red-300 shadow-md'
                    : eventState === 'EVENT_COMPLETED'
                    ? 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                    : 'bg-white border-slate-200 shadow-md hover:border-[#E43D12] hover:-translate-y-1'
                }`}
              >
                <div
                  className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                    eventState === 'EVENT_STARTED'
                      ? 'text-red-600'
                      : eventState === 'EVENT_COMPLETED'
                      ? 'text-emerald-700'
                      : 'text-[#E43D12]'
                  }`}
                >
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 mt-1.5 group-hover:text-[#E43D12] transition-colors">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Tagline / Journey Summary */}
        <div className="pt-4 border-t border-slate-200/80 text-center space-y-1">
          <p className="text-xs sm:text-sm font-extrabold text-slate-700 tracking-wide">
            Announcement ✓ &nbsp;→&nbsp;{' '}
            <span className={hasRegisteredTeam ? 'text-emerald-700 font-black' : 'text-amber-800 font-bold'}>
              Registration {hasRegisteredTeam ? '✓' : ''}
            </span>{' '}
            &nbsp;→&nbsp;{' '}
            {eventState === 'BEFORE_EVENT' && (
              <span className="text-slate-700 font-bold">Event Starts</span>
            )}
            {eventState === 'EVENT_STARTED' && (
              <>
                <span className="text-red-600 font-black underline">Event Started</span>
                &nbsp;→&nbsp;{' '}
                <span className="text-[#E43D12] font-black underline">PS Choosing</span>
              </>
            )}
            {eventState === 'EVENT_COMPLETED' && (
              <>
                <span className="text-emerald-700 font-black">Event Started ✓</span>
                &nbsp;→&nbsp;{' '}
                <span className="text-emerald-700 font-black">PS Choosing ✓</span>
                &nbsp;→&nbsp;{' '}
                <span className="text-emerald-700 font-black underline">GLITCH 1.0 Completed 🏆</span>
              </>
            )}
          </p>
          <p className="text-[11px] font-bold text-slate-500 italic">
            “The rocket is racing toward GLITCH 1.0 — and every second brings it closer to launch.”
          </p>
        </div>

      </div>
    </div>
  );
}
