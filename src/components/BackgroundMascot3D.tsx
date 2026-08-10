'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

export default function BackgroundMascot3D() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('Welcome to GLITCH 1.0! 🚀');

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll();

  // Smooth scroll spring physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 45,
    damping: 22,
    restDelta: 0.001,
  });

  // Moves CONTINUOUSLY from LEFT to RIGHT as the user scrolls down the page
  // Scroll 0%: Left side (3vw / 2vw)
  // Scroll 100%: Right side (72vw / 55vw)
  const x = useTransform(
    smoothProgress,
    [0, 1],
    isMobile ? ['2vw', '52vw'] : ['3vw', '72vw']
  );

  // Smooth vertical path anchored near the bottom of viewport
  const y = useTransform(
    smoothProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ['0px', '-25px', '10px', '-20px', '0px']
  );

  // Dynamic 3D Rotations (Turns face as it travels from Left to Right)
  const rotateY = useTransform(smoothProgress, [0, 1], [15, -15]);
  const rotateZ = useTransform(smoothProgress, [0, 0.5, 1], [-8, 8, -4]);
  const rotateX = useTransform(smoothProgress, [0, 0.5, 1], [6, -6, 2]);

  // Dynamic 3D Scale (gentle pulsing for 3D depth perception)
  const scale = useTransform(
    smoothProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [0.95, 1.08, 0.92, 1.05, 0.98]
  );

  // Dynamic speech bubble updates per section
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      if (latest < 0.2) {
        setCurrentMessage('Welcome to GLITCH 1.0! Ready to innovate? 🚀');
      } else if (latest < 0.4) {
        setCurrentMessage('24 Hours of Live Sprint & Mentorship! ⚡');
      } else if (latest < 0.6) {
        setCurrentMessage('Compete for ₹1,50,000+ Cash Prizes! 🏆');
      } else if (latest < 0.8) {
        setCurrentMessage('Review Guidelines & Schedule your build! 📜');
      } else {
        setCurrentMessage('Join top tech talent from across India! 🎯');
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      <motion.div
        style={{
          x,
          y,
          rotateX,
          rotateY,
          rotateZ,
          scale,
          perspective: 1200,
          transformStyle: 'preserve-3d',
        }}
        className="absolute bottom-6 left-0 w-36 h-36 sm:w-52 sm:h-52 md:w-64 md:h-64 pointer-events-auto group cursor-pointer"
      >
        {/* Vibrant 3D Ambient Light Orb */}
        <div className="absolute inset-0 -m-4 sm:-m-8 bg-gradient-to-tr from-[#E43D12]/40 via-[#EFB11D]/35 to-[#D6536D]/30 rounded-full blur-2xl animate-pulse-glow" />

        {/* 3D Mascot Character */}
        <div className="relative w-full h-full preserve-3d animate-float-3d">
          <img
            src="/images/mascot_3d.png"
            alt="GLITCH 1.0 3D Mascot"
            className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(228,61,18,0.45)] transition-transform duration-300 group-hover:scale-110"
          />

          {/* Dynamic 3D Ground Shadow */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-slate-900/30 rounded-[100%] blur-md -z-10 group-hover:scale-125 transition-transform" />

          {/* Interactive Speech Badge */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 sm:w-56 p-2 sm:p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E43D12]/40 shadow-xl text-center space-y-0.5 pointer-events-none">
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs font-black text-[#E43D12] uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5 text-[#E43D12]" /> Glitchy
              <Sparkles className="w-3 h-3 text-[#EFB11D]" />
            </div>
            <p className="text-[10px] sm:text-xs text-slate-800 font-bold leading-tight">
              "{currentMessage}"
            </p>
            {/* Bubble Arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/95" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
