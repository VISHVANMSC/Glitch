import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';
import Link from 'next/link';
import Image from 'next/image';
import { dataService } from '@/lib/dataService';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Award,
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
} from 'lucide-react';

export const revalidate = 0;

export default async function LandingPage() {
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
                <span>BUILD THE FUTURE AT </span>
                <span className="gradient-text-flame">{cms.heroHeadline || 'GLITCH - 1.0'}</span>
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
                    "Ready to code, innovate, and win ₹1,50,000+ prizes? Join teams from across India!"
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
              <div className="text-3xl font-black gradient-text-gold">₹1,50,000+</div>
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
              <div className="text-3xl font-black text-[#D6536D]">1-3 Members</div>
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1">Team Size</div>
            </div>
          </div>

          {/* Prominent Countdown Section */}
          <div className="pt-8 border-t border-slate-200 max-w-2xl mx-auto">
            <p className="text-xs font-black uppercase tracking-widest text-[#E43D12] mb-4 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-[#E43D12]" /> EVENT STARTS IN
            </p>
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
            <p className="font-black text-slate-900 text-sm sm:text-base">1 to 3 Members</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> About GLITCH - 1.0
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Where Engineering Mastery Meets Real-World Impact
              </h2>
              <p className="text-slate-700 text-base leading-relaxed font-medium">
                <strong className="text-[#E43D12]">GLITCH - 1.0</strong> is a premier 24hrs National Level Hackathon designed to unite student creators, software architects, AI enthusiasts, and system engineers under one roof. Over 24 intense hours, teams will build prototype solutions to real-world industry challenges.
              </p>
              <p className="text-slate-600 text-base leading-relaxed font-medium">
                Whether you are crafting decentralized protocols, intelligent autonomous agents, or high-concurrency web platforms, GLITCH - 1.0 provides the environment, mentorship, and platform to showcase your technical brilliance to a national audience.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-6 rounded-2xl card-3d bg-white border-slate-200">
                  <div className="text-3xl font-black gradient-text-gold">₹1,50,000+</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Grand Prize Pool</div>
                </div>
                <div className="p-6 rounded-2xl card-3d bg-white border-slate-200">
                  <div className="text-3xl font-black text-[#E43D12]">24 Hours</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Non-stop Hack</div>
                </div>
              </div>
            </div>

            {/* 3D Tech Asset & Mascot Feature */}
            <div className="space-y-6">
              <div className="relative w-full h-64 rounded-3xl overflow-hidden card-3d bg-white shadow-xl border border-slate-200">
                <Image
                  src="/images/tech_3d.png"
                  alt="3D Tech Neural Node"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl card-3d bg-white border-slate-200 space-y-2">
                  <div className="w-10 h-10 rounded-xl gradient-bg-flame text-white flex items-center justify-center shadow-md">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Curated Problem Statements</h3>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    Real industrial problem statements revealed via live selection window for fair competition.
                  </p>
                </div>

                <div className="p-6 rounded-2xl card-3d bg-white border-slate-200 space-y-2">
                  <div className="w-10 h-10 rounded-xl gradient-bg-gold text-slate-950 flex items-center justify-center shadow-md">
                    <Zap className="w-5 h-5 font-black" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">24-Hour Live Sprint</h3>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    Non-stop hackathon experience with high-speed internet, power backup, and round-the-clock mentorship.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prize Details Section */}
      <section id="prizes" className="py-24 border-y border-slate-200/80 bg-white/40 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFB11D]/15 text-[#b45309] border border-[#EFB11D]/40 text-xs font-black uppercase tracking-widest mb-4">
            <Trophy className="w-3.5 h-3.5" /> Prize Pool & Awards
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Compete for Grand Cash Prizes & Accolades
          </h2>
          <p className="mt-3 text-slate-600 text-sm max-w-xl mx-auto font-medium">
            Substantial rewards and recognition for top innovative teams at GLITCH - 1.0.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {/* 2nd Prize */}
            <div className="order-2 md:order-1 card-3d p-8 rounded-3xl flex flex-col justify-between bg-white border-slate-200 hover:border-[#D6536D]">
              <div>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#D6536D]/15 text-[#D6536D] flex items-center justify-center mb-4 shadow-md border border-[#D6536D]/30">
                  <Award className="w-8 h-8" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-[#D6536D]">Runner Up</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">2nd Prize</h3>
                <div className="text-3xl font-black text-[#D6536D] my-4">₹40,000</div>
                <p className="text-xs text-slate-600 font-medium">
                  Silver Trophy + Certificates of Excellence + Winner Badges
                </p>
              </div>
            </div>

            {/* 1st Prize */}
            <div className="order-1 md:order-2 card-3d p-8 rounded-3xl border-2 border-[#EFB11D] shadow-2xl shadow-[#EFB11D]/20 relative bg-white flex flex-col justify-between">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 gradient-bg-gold text-slate-950 font-black text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                ★ Grand Champion ★
              </div>
              <div>
                <div className="relative w-24 h-24 mx-auto mb-4 animate-float-3d">
                  <Image src="/images/prize_3d.png" alt="3D Trophy" fill className="object-contain" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-[#b45309]">Overall Winner</span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">1st Prize</h3>
                <div className="text-4xl font-black gradient-text-gold my-4">₹75,000</div>
                <p className="text-xs text-slate-700 font-bold">
                  Grand Champion Trophy + Gold Medals + National Winner Certificate
                </p>
              </div>
            </div>

            {/* 3rd Prize */}
            <div className="order-3 card-3d p-8 rounded-3xl flex flex-col justify-between bg-white border-slate-200 hover:border-[#E43D12]">
              <div>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E43D12]/10 text-[#E43D12] flex items-center justify-center mb-4 shadow-md border border-[#E43D12]/30">
                  <Award className="w-8 h-8" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-[#E43D12]">Second Runner Up</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">3rd Prize</h3>
                <div className="text-3xl font-black text-[#E43D12] my-4">₹25,000</div>
                <p className="text-xs text-slate-600 font-medium">
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
                      'Team Size: Strictly 1 to 3 members per team. Registrations with fewer than 1 or more than 3 members will be rejected.',
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
