import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';
import Link from 'next/link';
import Image from 'next/image';
import { dataService } from '@/lib/dataService';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Award,
  Crown,
  Medal,
  Zap,
  Users,
  Code,
  CheckCircle2,
  HelpCircle,
  Phone,
  Mail,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  Layers,
  Flame,
  Bot,
  Target,
} from 'lucide-react';

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

export const revalidate = 0;

export default async function LandingPage() {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    if (sessionUser.role === 'ADMIN') {
      redirect('/admin');
    } else {
      redirect('/dashboard');
    }
  }

  const cms = await dataService.getCmsContent();
  const coordinators = await dataService.getCoordinators();

  const facultyCoordinators = coordinators.filter((c) => c.type === 'FACULTY');
  const studentCoordinators = coordinators.filter((c) => c.type === 'STUDENT');

  return (
    <div className="min-h-screen flex flex-col text-slate-900 bg-cyber-grid relative overflow-x-hidden">
      <Navbar />

      {/* Hero Section with 3D Mascot */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden text-center z-10">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#E43D12]/15 via-[#EFB11D]/15 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          {/* Top Logo & Title Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/90 border border-slate-200 shadow-md shadow-slate-200/50">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#E43D12] to-[#EFB11D] p-0.5 flex items-center justify-center overflow-hidden">
              {cms.logoUrl ? (
                <img src={cms.logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
              ) : (
                <Flame className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-[#E43D12]">
              National Level 24hrs Hackathon 2026
            </span>
          </div>

          {/* Headline & 3D Mascot Hero Graphic */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-center lg:text-left pt-2">
            <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] drop-shadow-sm text-slate-900">
                <span className="gradient-text-flame">{cms.heroHeadline || 'GLITCH 1.0'}</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-600 font-semibold leading-relaxed max-w-2xl">
                {cms.heroSubtitle ||
                  'A Premier 24hrs National Level Hackathon pushing the frontiers of Artificial Intelligence, Software Engineering, and Digital Breakthroughs.'}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-4 btn-3d-primary font-black text-base flex items-center justify-center shadow-xl"
                >
                  Register Your Team Now
                </Link>
                <Link
                  href="#about"
                  className="w-full sm:w-auto px-8 py-4 btn-3d-secondary text-slate-800 font-extrabold text-base transition-all text-center"
                >
                  Explore Event Details
                </Link>
              </div>
            </div>

            {/* 3D Mascot Interactive Display Card */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <div className="relative group cursor-pointer">
                {/* Floating 3D Brand Logo / Graphic */}
                <div className="w-56 h-56 sm:w-64 sm:h-64 relative animate-float-3d flex items-center justify-center">
                  <img
                    src={cms.logoUrl || '/images/mascot_3d.png'}
                    alt="GLITCH 1.0 Brand Logo"
                    className="w-full h-full object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Speech Bubble from Mascot */}
                <div className="mt-2 p-4 rounded-2xl bg-white border border-[#E43D12]/30 shadow-xl max-w-xs text-center relative space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black text-[#E43D12] uppercase tracking-wider">
                    <Bot className="w-4 h-4 text-[#E43D12]" /> Glitchy Says:
                  </div>
                  <p className="text-xs text-slate-700 font-bold">
                    "Ready to code, innovate, and win {cms.totalPrizePool || '₹1,50,000+'} prizes? Join teams from across India!"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Integrated 3-Card Stats Grid */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <div className="card-3d p-6 text-center bg-white border-slate-200">
              <div className="w-12 h-12 mx-auto rounded-2xl gradient-bg-gold text-slate-950 flex items-center justify-center mb-3 shadow-md">
                <Trophy className="w-6 h-6 text-slate-950" />
              </div>
              <div className="text-3xl font-black gradient-text-gold">{cms.totalPrizePool || '₹1,50,000+'}</div>
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1">Grand Prize Pool</div>
            </div>

            <div className="card-3d p-6 text-center bg-white border-slate-200">
              <div className="w-12 h-12 mx-auto rounded-2xl gradient-bg-flame text-white flex items-center justify-center mb-3 shadow-md">
                <Flame className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-[#E43D12]">24 Hours</div>
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1">Live Hackathon</div>
            </div>

            <div className="card-3d p-6 text-center bg-white border-slate-200">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#D6536D] text-white flex items-center justify-center mb-3 shadow-md">
                <Layers className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-[#D6536D]">2-3 Members</div>
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1">Team Size</div>
            </div>
          </div>

          {/* Prominent Futuristic Countdown Section */}
          <div className="pt-12 border-t border-slate-200 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
            <CountdownTimer targetDate="2026-10-24T08:30:00" />
          </div>
        </div>
      </section>

      {/* Key Info Banner */}
      <section className="bg-white/60 backdrop-blur-md border-y border-slate-200/80 py-8 relative z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-slate-200">
          <div className="px-3">
            <div className="flex items-center justify-center gap-2 text-[#E43D12] mb-1">
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Event Date</span>
            </div>
            <p className="font-black text-slate-900 text-sm sm:text-base">{cms.eventDate || 'OCTOBER 24-25, 2026'}</p>
          </div>

          <div className="px-3">
            <div className="flex items-center justify-center gap-2 text-[#E43D12] mb-1">
              <Clock className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Duration</span>
            </div>
            <p className="font-black text-slate-900 text-sm sm:text-base">{cms.eventTime || '24 Hours Live Hackathon'}</p>
          </div>

          <div className="px-3">
            <div className="flex items-center justify-center gap-2 text-[#E43D12] mb-1">
              <MapPin className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Venue</span>
            </div>
            <p className="font-black text-slate-900 text-sm sm:text-base">{cms.venue || 'Convention Center, Main Campus'}</p>
          </div>

          <div className="px-3">
            <div className="flex items-center justify-center gap-2 text-[#E43D12] mb-1">
              <Users className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Team Size</span>
            </div>
            <p className="font-black text-slate-900 text-sm sm:text-base">2 to 3 Members</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative z-10 bg-gradient-to-b from-transparent via-slate-50/60 to-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 text-xs font-black uppercase tracking-widest">
              About GLITCH 1.0
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Where Students Build Like Industry Professionals
            </h2>
            <div className="max-w-3xl mx-auto space-y-4 pt-2">
              <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-medium">
                <strong className="text-[#E43D12]">GLITCH 1.0</strong> is a student-focused hackathon designed to discover and strengthen the real-world product creation skills of students.
              </p>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
                Unlike traditional academic projects, GLITCH 1.0 gives participants an opportunity to work on industry-oriented problem statements and transform them into functional, user-focused applications.
              </p>
            </div>
          </div>

          {/* Card 1: What is GLITCH 1.0? */}
          <div className="card-3d p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4">
            <div className="inline-flex items-center gap-2 text-[#E43D12] font-black text-xs uppercase tracking-widest">
              Core Mission
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">What is GLITCH 1.0?</h3>
            <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-medium">
              At GLITCH 1.0, we provide the problem statements — the challenge is for participants to turn those challenges into meaningful and practical products.
            </p>
            <p className="text-slate-600 text-base leading-relaxed font-medium">
              From understanding the requirements to designing the user experience, developing the application, testing it, and presenting the final solution, participants get to experience the complete product development journey.
            </p>
          </div>

          {/* Card 2: More Than Just Coding */}
          <div className="card-3d p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-[#E43D12] font-black text-xs uppercase tracking-widest">
                <Code className="w-4 h-4" /> Holistic Product Engineering
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">More Than Just Coding</h3>
              <p className="text-slate-700 text-base leading-relaxed font-medium">
                Building a real-world application requires more than writing code.
              </p>
              <p className="text-slate-900 text-sm font-black uppercase tracking-wider pt-2">
                GLITCH 1.0 helps participants explore how to:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {[
                'Understand and analyze a given problem statement.',
                'Convert requirements into a practical product solution.',
                'Design intuitive and user-friendly interfaces.',
                'Choose the right technologies and architecture.',
                'Build functional and reliable applications.',
                'Think about scalability, usability, and real-world constraints.',
                'Present their product and explain their technical decisions.',
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#E43D12]/10 text-[#E43D12] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#E43D12]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Discovering Real Product-Building Skills */}
          <div className="card-3d p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4">
            <div className="inline-flex items-center gap-2 text-[#E43D12] font-black text-xs uppercase tracking-widest">
              <Target className="w-4 h-4" /> Discovering Talent
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Discovering Real Product-Building Skills</h3>
            <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-medium">
              The goal of GLITCH 1.0 is not simply to find participants who can code.
            </p>
            <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-medium">
              It is about discovering who can take a given challenge and turn it into a complete, meaningful, and usable product.
            </p>
            <p className="text-slate-600 text-base leading-relaxed font-medium">
              We want to understand how students approach problems, make technical decisions, collaborate, build, test, and deliver — just like they would in a real industry environment.
            </p>
          </div>

          {/* Card 4: Experience the Industry. Build the Future. */}
          <div className="card-3d p-8 sm:p-12 rounded-3xl bg-white border-2 border-[#E43D12] text-slate-900 shadow-xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-tr from-[#E43D12]/10 via-[#EFB11D]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 text-xs font-black uppercase tracking-widest shadow-xs">
                Industry Experience
              </div>
              
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Experience the Industry. Build the Future.
              </h3>
              
              <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-semibold">
                GLITCH 1.0 gives students a glimpse into what real-world software development looks like beyond classrooms and academic projects.
              </p>
              
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-semibold">
                Participants get the opportunity to build under constraints, make decisions, solve challenges, and deliver a working product.
              </p>

              {/* Highlight Question Box */}
              <div className="my-8 p-6 sm:p-8 rounded-2xl bg-slate-50 border-2 border-[#E43D12]/40 shadow-md space-y-4 text-center">
                <p className="text-xs font-black uppercase tracking-widest text-[#E43D12]">Because the real question isn't:</p>
                <p className="text-2xl sm:text-3xl font-black text-slate-500 italic">“Can you code?”</p>
                <p className="text-xs font-black uppercase tracking-widest text-[#E43D12] pt-2">It's:</p>
                <p className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  “Can you build something that solves a real problem?”
                </p>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center space-y-2">
                <h4 className="text-3xl sm:text-4xl font-black text-[#E43D12] tracking-wider uppercase">Build. Solve. Innovate.</h4>
                <p className="text-xs sm:text-sm font-extrabold text-slate-700 tracking-wide uppercase">
                  GLITCH 1.0 — A platform to discover the next generation of real-world product builders.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Prize Details Section */}
      <section id="prizes" className="py-24 border-y border-slate-200/80 bg-white/40 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFB11D]/15 text-[#b45309] border border-[#EFB11D]/40 text-xs font-black uppercase tracking-widest mb-4">
            <Trophy className="w-3.5 h-3.5 text-[#b45309]" /> Prize Pool & Awards
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Compete for Grand Cash Prizes & Accolades
          </h2>
          <p className="mt-3 text-slate-600 text-sm max-w-xl mx-auto font-medium">
            Substantial rewards and recognition for top innovative teams at GLITCH - 1.0.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            
            {/* 2nd Prize Card */}
            <div className="order-2 md:order-1 card-3d p-8 rounded-3xl flex flex-col justify-between bg-white border-2 border-slate-200 hover:border-[#D6536D] transition-all shadow-xl hover:-translate-y-1">
              <div className="space-y-4 text-center">
                {/* Rank 2 Icon Badge */}
                <div className="relative w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-slate-100 via-slate-200 to-slate-300 border-2 border-slate-300/80 shadow-md flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center">
                    <Medal className="w-7 h-7 text-slate-600 mb-0.5" />
                    <span className="text-2xl font-black text-slate-800 font-mono leading-none">2</span>
                  </div>
                </div>

                <span className="inline-block px-3 py-1 rounded-full bg-[#D6536D]/10 text-[#D6536D] border border-[#D6536D]/30 text-[10px] font-black uppercase tracking-widest">
                  Runner Up
                </span>
                
                <h3 className="text-2xl font-black text-slate-900">2nd Prize</h3>
                
                <div className="text-4xl font-black text-[#D6536D] font-mono tracking-tight my-2">
                  {cms.secondPrize || '₹40,000'}
                </div>
                
                <p className="text-xs text-slate-600 font-bold leading-relaxed pt-2 border-t border-slate-100">
                  Silver Trophy + Certificates of Excellence + Winner Badges
                </p>
              </div>
            </div>

            {/* 1st Prize Card - Grand Champion (Featured Elevation) */}
            <div className="order-1 md:order-2 card-3d p-8 sm:p-10 rounded-3xl border-2 border-[#EFB11D] shadow-2xl shadow-[#EFB11D]/25 relative bg-gradient-to-b from-amber-50/70 via-white to-white flex flex-col justify-between transform md:scale-105 md:-translate-y-2 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#EFB11D] via-[#f59e0b] to-[#E43D12] text-white font-black text-[11px] uppercase tracking-widest px-5 py-1.5 rounded-full shadow-lg border border-amber-300/40">
                ★ GRAND CHAMPION ★
              </div>

              <div className="space-y-4 text-center pt-3">
                {/* Rank 1 Icon Badge */}
                <div className="relative w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-[#EFB11D] via-[#f59e0b] to-[#E43D12] p-1 shadow-xl shadow-[#EFB11D]/30">
                  <div className="w-full h-full bg-white rounded-[22px] flex flex-col items-center justify-center">
                    <Crown className="w-8 h-8 text-[#d97706] mb-0.5" />
                    <span className="text-3xl font-black text-[#d97706] font-mono leading-none">1</span>
                  </div>
                </div>

                <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#EFB11D]/15 text-[#b45309] border border-[#EFB11D]/40 text-xs font-black uppercase tracking-widest">
                  Overall Winner
                </span>

                <h3 className="text-3xl font-black text-slate-900">1st Prize</h3>

                <div className="text-5xl font-black text-[#d97706] font-mono tracking-tight my-2">
                  {cms.firstPrize || '₹75,000'}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 font-extrabold leading-relaxed pt-2 border-t border-amber-200/80">
                  Grand Champion Trophy + Gold Medals + National Winner Certificate
                </p>
              </div>
            </div>

            {/* 3rd Prize Card */}
            <div className="order-3 card-3d p-8 rounded-3xl flex flex-col justify-between bg-white border-2 border-slate-200 hover:border-[#E43D12] transition-all shadow-xl hover:-translate-y-1">
              <div className="space-y-4 text-center">
                {/* Rank 3 Icon Badge */}
                <div className="relative w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-100 via-amber-200 to-amber-300 border-2 border-amber-300/80 shadow-md flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center">
                    <Award className="w-7 h-7 text-amber-800 mb-0.5" />
                    <span className="text-2xl font-black text-amber-900 font-mono leading-none">3</span>
                  </div>
                </div>

                <span className="inline-block px-3 py-1 rounded-full bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 text-[10px] font-black uppercase tracking-widest">
                  Second Runner Up
                </span>

                <h3 className="text-2xl font-black text-slate-900">3rd Prize</h3>

                <div className="text-4xl font-black text-[#E43D12] font-mono tracking-tight my-2">
                  {cms.thirdPrize || '₹25,000'}
                </div>

                <p className="text-xs text-slate-600 font-bold leading-relaxed pt-2 border-t border-slate-100">
                  Bronze Trophy + Merit Certificates + Recognition Badges
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Rules & Guidelines */}
      <section id="rules" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 text-xs font-black uppercase tracking-widest mb-4">
              <ShieldAlert className="w-3.5 h-3.5" /> Guidelines & Eligibility
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Rules & Registration Guidelines
            </h2>
            <p className="mt-3 text-slate-600 text-sm font-medium">
              Please review the mandatory eligibility criteria and team compliance guidelines before submitting your registration.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Eligibility Rules */}
            <div className="card-3d p-8 space-y-4 bg-white border-slate-200">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3 border-slate-200">
                <Users className="w-5 h-5 text-[#E43D12]" /> Team & Eligibility Rules
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 font-medium">
                {(cms.rulesEligibility
                  ? cms.rulesEligibility.split('\n').map((l: string) => l.trim()).filter(Boolean)
                  : [
                      'Team Size: Strictly 2 to 3 members per team. Registrations with fewer than 2 or more than 3 members will be rejected.',
                      'Institutional Uniformity: All team members must belong to the exact same college/institution as selected by the Team Leader.',
                      'Single Account Registration: Only the Team Leader creates an account and logs into the platform. Separate member accounts are not required.',
                      'Student Status: Open to all undergraduate & postgraduate engineering and technology students across India.',
                    ]
                ).map((ruleStr: string, idx: number) => {
                  const colonIdx = ruleStr.indexOf(':');
                  const title = colonIdx !== -1 ? ruleStr.substring(0, colonIdx).trim() : '';
                  const text = colonIdx !== -1 ? ruleStr.substring(colonIdx + 1).trim() : ruleStr;

                  return (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#E43D12] shrink-0 mt-0.5" />
                      <span>
                        {title && <strong className="text-slate-900">{title}: </strong>}
                        {text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Conduct & Submission Rules */}
            <div className="card-3d p-8 space-y-4 bg-white border-slate-200">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3 border-slate-200">
                <Layers className="w-5 h-5 text-[#D6536D]" /> Hackathon Conduct & Submission
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 font-medium">
                {(cms.rulesConduct
                  ? cms.rulesConduct.split('\n').map((l: string) => l.trim()).filter(Boolean)
                  : [
                      'Problem Statement Lock: Problem statement selection is permitted only during the active Admin timer window. Once locked, selection cannot be edited or changed.',
                      'Originality: All code written during GLITCH - 1.0 must be fresh work. Pre-existing projects are strictly prohibited.',
                      'Payment Proof Verification: Upload of valid payment receipt screenshot and UTR transaction number is mandatory for Admin approval.',
                      'Jury Verdict: The decision of the organizing committee and evaluation jury will be final and binding.',
                    ]
                ).map((ruleStr: string, idx: number) => {
                  const colonIdx = ruleStr.indexOf(':');
                  const title = colonIdx !== -1 ? ruleStr.substring(0, colonIdx).trim() : '';
                  const text = colonIdx !== -1 ? ruleStr.substring(colonIdx + 1).trim() : ruleStr;

                  return (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#D6536D] shrink-0 mt-0.5" />
                      <span>
                        {title && <strong className="text-slate-900">{title}: </strong>}
                        {text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Agenda Section */}
      <section id="agenda" className="py-24 border-y border-slate-200/80 bg-white/40 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6536D]/15 text-[#D6536D] border border-[#D6536D]/30 text-xs font-black uppercase tracking-widest mb-4">
              <Calendar className="w-3.5 h-3.5" /> Event Schedule
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              National Hackathon Agenda
            </h2>
            <p className="mt-3 text-slate-600 text-sm font-medium">
              24 hours of intense coding, mentoring, milestones, and evaluations.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Day 1 */}
            <div className="card-3d p-8 bg-white border-slate-200">
              <div className="inline-block px-3.5 py-1.5 rounded-xl gradient-bg-flame text-white text-xs font-black uppercase tracking-widest mb-6">
                DAY 1 — {cms.eventDate ? cms.eventDate.split('-')[0] : 'OCTOBER 24, 2026'}
              </div>
              <div className="space-y-6 text-xs sm:text-sm">
                {(cms.agendaDay1
                  ? cms.agendaDay1.split('\n').map((l: string) => l.trim()).filter(Boolean)
                  : [
                      '08:30 AM | Reporting & Badge Verification | Check-in at venue and team badge collection.',
                      '09:30 AM | Grand Inauguration Ceremony | Welcome note by Faculty Chairs and Chief Guest address.',
                      '10:30 AM | PS Window Opens & Hackathon Commences | Problem statement selection window activates online.',
                      '04:00 PM | Mentorship Round 1 | Architecture review and technical guidance by industry experts.',
                    ]
                ).map((itemStr: string, idx: number) => {
                  const parts = itemStr.split('|').map((p: string) => p.trim());
                  const time = parts[0] || 'Scheduled';
                  const title = parts[1] || itemStr;
                  const desc = parts[2] || '';

                  return (
                    <div key={idx} className="flex gap-4 border-l-2 border-[#E43D12] pl-4 py-1">
                      <span className="font-extrabold text-[#E43D12] w-24 shrink-0">{time}</span>
                      <div>
                        <h4 className="font-bold text-slate-900">{title}</h4>
                        {desc && <p className="text-slate-600">{desc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day 2 */}
            <div className="card-3d p-8 bg-white border-slate-200">
              <div className="inline-block px-3.5 py-1.5 rounded-xl gradient-bg-gold text-slate-950 text-xs font-black uppercase tracking-widest mb-6">
                DAY 2 — {cms.eventDate ? cms.eventDate.split('-')[1] || cms.eventDate : 'OCTOBER 25, 2026'}
              </div>
              <div className="space-y-6 text-xs sm:text-sm">
                {(cms.agendaDay2
                  ? cms.agendaDay2.split('\n').map((l: string) => l.trim()).filter(Boolean)
                  : [
                      '09:00 AM | Mentorship & Prototype Check-in | Mid-evaluation and feature sanity checks.',
                      '10:30 AM | Final Code Freeze & Repository Lock | All submissions locked in GitHub / Drive link.',
                      '11:30 AM | Jury Presentations & Demo Round | Live 5-minute team pitches in front of Grand Jury panel.',
                      '01:30 PM | Valedictory & Prize Distribution | Winner announcements and trophy presentation.',
                    ]
                ).map((itemStr: string, idx: number) => {
                  const parts = itemStr.split('|').map((p: string) => p.trim());
                  const time = parts[0] || 'Scheduled';
                  const title = parts[1] || itemStr;
                  const desc = parts[2] || '';

                  return (
                    <div key={idx} className="flex gap-4 border-l-2 border-[#EFB11D] pl-4 py-1">
                      <span className="font-extrabold text-[#b45309] w-24 shrink-0">{time}</span>
                      <div>
                        <h4 className="font-bold text-slate-900">{title}</h4>
                        {desc && <p className="text-slate-600">{desc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coordinators Section */}
      <section id="coordinators" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 text-xs font-black uppercase tracking-widest">
              <Users className="w-3.5 h-3.5 text-[#E43D12]" /> Organizing Team
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Event Coordinators
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-semibold">
              Meet our faculty conveners and student leaders coordinating GLITCH - 1.0.
            </p>
          </div>

          {/* Faculty Coordinators */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4">
              <div className="w-9 h-9 rounded-xl gradient-bg-flame text-white flex items-center justify-center shadow-md shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Faculty Coordinators</h3>
                <p className="text-xs font-bold text-slate-500">Academic leadership and conveners</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {facultyCoordinators.map((coord) => (
                <div
                  key={coord.id}
                  className="card-3d relative overflow-hidden bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
                >
                  {/* Top Accent Line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 gradient-bg-flame" />

                  <div className="flex items-start gap-5">
                    {/* Avatar Container with Photo Support */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-slate-100 shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0 bg-slate-100 flex items-center justify-center">
                      {coord.photoUrl ? (
                        <img
                          src={coord.photoUrl}
                          alt={coord.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full gradient-bg-flame text-white font-black text-2xl sm:text-3xl flex items-center justify-center">
                          {coord.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg gradient-bg-flame text-white flex items-center justify-center shadow-md">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Information */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 text-[11px] font-black uppercase tracking-wider">
                        {coord.designation || 'Faculty Convener'}
                      </span>
                      <h4 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight leading-snug group-hover:text-[#E43D12] transition-colors truncate">
                        {coord.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-500 leading-snug">
                        {coord.department}
                      </p>
                    </div>
                  </div>

                  {/* Actions / Contact Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                    {coord.phone && (
                      <a
                        href={`tel:${coord.phone}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-[#E43D12] hover:text-white font-extrabold text-xs transition-all border border-slate-200/80 shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#E43D12]" />
                        <span>{coord.phone}</span>
                      </a>
                    )}
                    {coord.email && (
                      <a
                        href={`mailto:${coord.email}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-[#D6536D] hover:text-white font-extrabold text-xs transition-all border border-slate-200/80 shadow-sm"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#D6536D]" />
                        <span>Email</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Coordinators */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4">
              <div className="w-9 h-9 rounded-xl gradient-bg-gold text-slate-950 flex items-center justify-center shadow-md shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Student Coordinators</h3>
                <p className="text-xs font-bold text-slate-500">Student leaders and committee coordinators</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {studentCoordinators.map((coord) => (
                <div
                  key={coord.id}
                  className="card-3d relative overflow-hidden bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
                >
                  {/* Top Accent Line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 gradient-bg-gold" />

                  <div className="flex items-start gap-5">
                    {/* Avatar Container with Photo Support */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-slate-100 shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0 bg-slate-100 flex items-center justify-center">
                      {coord.photoUrl ? (
                        <img
                          src={coord.photoUrl}
                          alt={coord.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full gradient-bg-gold text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center">
                          {coord.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg gradient-bg-gold text-slate-950 flex items-center justify-center shadow-md">
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Information */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#EFB11D]/15 text-[#b45309] border border-[#EFB11D]/40 text-[11px] font-black uppercase tracking-wider">
                        {coord.role || 'Student Lead'}
                      </span>
                      <h4 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight leading-snug group-hover:text-[#b45309] transition-colors truncate">
                        {coord.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-500 leading-snug">
                        {coord.department}
                      </p>
                    </div>
                  </div>

                  {/* Actions / Contact Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                    {coord.phone && (
                      <a
                        href={`tel:${coord.phone}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-[#EFB11D] hover:text-slate-950 font-extrabold text-xs transition-all border border-slate-200/80 shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#b45309]" />
                        <span>{coord.phone}</span>
                      </a>
                    )}
                    {coord.email && (
                      <a
                        href={`mailto:${coord.email}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-[#b45309] hover:text-white font-extrabold text-xs transition-all border border-slate-200/80 shadow-sm"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#b45309]" />
                        <span>Email</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="py-24 border-y border-slate-200/80 bg-white/40 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 text-xs font-black uppercase tracking-widest mb-4">
              <HelpCircle className="w-3.5 h-3.5" /> Got Questions?
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Who is eligible to participate in GLITCH - 1.0?',
                a: 'All currently enrolled undergraduate and postgraduate students from any recognized Indian college or university are eligible.',
              },
              {
                q: 'What is the team size requirement?',
                a: 'Teams must consist of a minimum of 1 member and a maximum of 3 members. All team members must belong to the same institution.',
              },
              {
                q: 'How does the Problem Statement selection work?',
                a: 'Problem Statements will be released in the platform. Team Leaders can select ONE Problem Statement during the active Admin timer window.',
              },
              {
                q: 'What payment details are required during registration?',
                a: 'After completing team member details, upload your payment confirmation screenshot and enter the 12-digit UTR/Ref transaction number. Your registration status will remain "Pending Approval" until verified by Admin.',
              },
              {
                q: 'Do team members need separate login credentials?',
                a: 'No. Only the Team Leader creates an account and manages team details and problem statement selection.',
              },
            ].map((faq, idx) => (
              <details key={idx} className="group card-3d bg-white rounded-2xl p-6 border-slate-200 [&_summary::-webkit-details-marker]:none">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-slate-900 text-sm sm:text-base group-hover:text-[#E43D12] transition-colors">
                  <span>{faq.q}</span>
                  <span className="ml-4 transition-transform group-open:rotate-180 text-[#E43D12] font-extrabold text-lg">
                    ↓
                  </span>
                </summary>
                <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto card-3d p-8 sm:p-14 text-center space-y-6 bg-white border-slate-200">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Have Queries or Need Support?</h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto font-medium">
              Our organizing team is here to assist you with registration queries, payment confirmations, and technical questions.
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
                <Mail className="w-8 h-8 text-[#E43D12] mx-auto mb-2" />
                <h4 className="font-extrabold text-slate-900 text-base">Official Support Email</h4>
                <a href="mailto:glitch.hackathon.official@gmail.com" className="text-xs text-[#E43D12] font-extrabold hover:underline mt-1 block">
                  glitch.hackathon.official@gmail.com
                </a>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
                <Phone className="w-8 h-8 text-[#b45309] mx-auto mb-2" />
                <h4 className="font-extrabold text-slate-900 text-base">Coordinator Helpline</h4>
                <p className="text-xs text-slate-700 font-bold mt-1">
                  +91 98401 12345 / +91 91234 56789
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
