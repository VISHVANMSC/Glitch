'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate?: string;
}

export default function CountdownTimer({ targetDate = '2026-10-24T09:00:00' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-lg mx-auto lg:mx-0">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
      ].map((item, idx) => (
        <div
          key={idx}
          className="card-3d p-3 sm:p-5 text-center border border-[#E43D12]/40 bg-slate-900/90 backdrop-blur-xl shadow-xl hover:border-[#EFB11D] group"
        >
          <div className="text-2xl sm:text-4xl font-black gradient-text-gold tracking-tight font-mono drop-shadow-[0_0_12px_rgba(239,177,29,0.3)]">
            {String(item.value).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-400 mt-1 group-hover:text-[#FFA2B6] transition-colors">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
