'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CollegeCombobox from '@/components/CollegeCombobox';
import { uploadPaymentScreenshot } from '@/lib/supabase';
import {
  Users,
  Building2,
  Upload,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  QrCode,
  FileCheck,
  Bot,
} from 'lucide-react';

interface MemberForm {
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  isLeader: boolean;
}

async function compressImageIfNeeded(file: File, maxSizeBytes = 1024 * 1024): Promise<File> {
  if (file.size <= maxSizeBytes || !file.type.startsWith('image/')) {
    return file;
  }
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.75
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState<number>(2);
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('');
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState('');
  const [transactionUtor, setTransactionUtor] = useState('');

  // Members array
  const [members, setMembers] = useState<MemberForm[]>([
    { name: '', email: '', phone: '', college: '', department: '', year: '3rd Year', isLeader: true },
    { name: '', email: '', phone: '', college: '', department: '', year: '3rd Year', isLeader: false },
    { name: '', email: '', phone: '', college: '', department: '', year: '3rd Year', isLeader: false },
  ]);

  const [cmsContent, setCmsContent] = useState<Record<string, string>>({});

  // Auto-fill Team Leader details from logged-in session & fetch CMS
  useEffect(() => {
    fetch('/api/admin/cms')
      .then((res) => res.json())
      .then((data) => {
        if (data.content) setCmsContent(data.content);
      })
      .catch(() => {});

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/signup');
          return;
        }
        if (data.team) {
          router.push('/dashboard');
          return;
        }

        // Auto-populate leader details
        setMembers((prev) => {
          const updated = [...prev];
          updated[0] = {
            ...updated[0],
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
          };
          return updated;
        });

        setLoadingUser(false);
      })
      .catch(() => {
        router.push('/signup');
      });
  }, [router]);

  // When Team Leader changes college, sync to all members
  const handleLeaderCollegeChange = (selectedCollege: string) => {
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        college: selectedCollege,
      }))
    );
  };

  const handleMemberChange = (index: number, field: keyof MemberForm, value: string) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (rawFile) {
      setError('');
      let file = rawFile;
      if (file.size > 1 * 1024 * 1024) {
        file = await compressImageIfNeeded(rawFile, 1 * 1024 * 1024);
      }
      if (file.size > 1 * 1024 * 1024) {
        setError('Screenshot file size must be less than 1MB.');
        e.target.value = '';
        setPaymentFile(null);
        setPaymentPreview('');
        return;
      }
      setPaymentFile(file);
      setPaymentPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  // Validation routines per step
  const validateStep1 = () => {
    if (!teamName.trim()) {
      setError('Please enter a valid Team Name.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    const leader = members[0];
    if (!leader.college || !leader.college.trim()) {
      setError('Please select your College / Institution.');
      return false;
    }
    if (!leader.department || !leader.department.trim()) {
      setError('Please enter your Leader Department.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep3 = () => {
    const activeMembers = members.slice(0, teamSize);
    for (let i = 0; i < teamSize; i++) {
      const m = activeMembers[i];
      if (!m.name.trim() || !m.email.trim() || !m.phone.trim() || !m.department.trim()) {
        setError(`Please fill in all mandatory fields for Member ${i + 1}.`);
        return false;
      }
    }

    const emails = activeMembers.map((m) => m.email.trim().toLowerCase());
    if (new Set(emails).size !== emails.length) {
      setError('Each person in the team must have a unique email address.');
      return false;
    }

    const phones = activeMembers.map((m) => m.phone.trim());
    if (new Set(phones).size !== phones.length) {
      setError('Each person in the team must have a unique phone number.');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentFile) {
      setError('Payment proof screenshot is mandatory for verification.');
      return;
    }
    if (paymentFile.size > 1 * 1024 * 1024) {
      setError('Screenshot file size must be less than 1MB.');
      return;
    }
    if (!transactionUtor.trim() || transactionUtor.trim().length < 6) {
      setError('Please enter a valid 12-digit Transaction Ref / UTR Number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Upload screenshot
      const uploadedUrl = await uploadPaymentScreenshot(paymentFile);

      // 2. Submit team registration API
      const payload = {
        teamName: teamName.trim(),
        teamSize,
        paymentScreenshotUrl: uploadedUrl,
        transactionUtor: transactionUtor.trim(),
        members: members.slice(0, teamSize),
      };

      const res = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit registration');
      }

      // Redirect to team leader dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Server error during registration submission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#E43D12] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-black uppercase tracking-widest text-[#E43D12]">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 bg-cyber-grid">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Step Indicator Header */}
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#E43D12]" /> Mandatory Team Registration
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Register Team for GLITCH - 1.0</h1>
          <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
            Complete all 4 mandatory steps to submit your team application for admin approval.
          </p>
        </div>

        {/* Stepper Bar */}
        <div className="grid grid-cols-4 gap-2.5 mb-8">
          {[
            { num: 1, label: 'Team Info' },
            { num: 2, label: 'Leader & College' },
            { num: 3, label: 'Member Details' },
            { num: 4, label: 'Payment Proof' },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-3 rounded-xl border text-center transition-all ${
                step === s.num
                  ? 'gradient-bg-flame text-white border-[#E43D12] font-extrabold shadow-md'
                  : step > s.num
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold'
                  : 'bg-white text-slate-400 border-slate-200'
              }`}
            >
              <div className="text-xs uppercase font-black tracking-wider">
                Step {s.num}
              </div>
              <div className="text-xs font-bold hidden sm:block truncate mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2 shadow-sm">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
            {error}
          </div>
        )}

        <div className="card-3d p-6 sm:p-10 rounded-3xl bg-white border-slate-200 shadow-xl">
          {/* STEP 1: Team Basics */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#E43D12]" /> Step 1: Team Information
                </h2>
                <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold text-amber-800">
                  <img src="/images/mascot_3d.png" alt="Glitchy" className="w-5 h-5 object-contain" />
                  Glitchy Assist On
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                  Team Name * (Mandatory)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CyberKnights, NeuralNinjas"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#E43D12] focus:ring-2 focus:ring-[#E43D12]/20 text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Number of Team Members * (Strictly 2 to 3 Members)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[2, 3].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTeamSize(size)}
                      className={`py-4 rounded-2xl border-2 font-black text-lg flex flex-col items-center justify-center gap-1 transition-all ${
                        teamSize === size
                          ? 'border-[#E43D12] bg-[#E43D12]/10 text-[#E43D12] shadow-md'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                      }`}
                    >
                      <span>{size} Members</span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {size === 2 ? 'Duo Team' : 'Trio Team'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) setStep(2);
                  }}
                  className="px-6 py-3 rounded-xl btn-3d-primary font-black text-sm text-white flex items-center gap-2 shadow-lg"
                >
                  Continue to Leader Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Team Leader Details & Searchable College Dropdown */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-900 border-b pb-3 border-slate-200 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#E43D12]" /> Step 2: Team Leader & Institution
              </h2>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-black text-[#E43D12]">📌 Auto-Filled Leader Account Information:</p>
                <p className="font-semibold">Name, Email, and Phone number are auto-populated from your signup credentials.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                    Leader Name (Auto-filled)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={members[0].name}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-bold text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                    Leader Email (Auto-filled)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={members[0].email}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-bold text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                    Leader Phone (Auto-filled)
                  </label>
                  <input
                    type="tel"
                    disabled
                    value={members[0].phone}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-bold text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Searchable College Dropdown */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                  Select College / Institution * (Search 250+ Indian Colleges or Add Custom)
                </label>
                <CollegeCombobox
                  value={members[0].college}
                  onChange={handleLeaderCollegeChange}
                />
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  ℹ️ All team members will automatically inherit this college institution.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Leader Department *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science Engineering"
                    value={members[0].department}
                    onChange={(e) => handleMemberChange(0, 'department', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#E43D12] text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Leader Year of Study *
                  </label>
                  <select
                    value={members[0].year}
                    onChange={(e) => handleMemberChange(0, 'year', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#E43D12] text-sm font-semibold bg-slate-50 text-slate-900"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year / Final</option>
                    <option value="PG / Masters">PG / Masters</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm flex items-center gap-2 hover:bg-slate-100"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) setStep(3);
                  }}
                  className="px-6 py-3 rounded-xl btn-3d-primary font-black text-sm text-white flex items-center gap-2 shadow-lg"
                >
                  Continue to Member Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Members Details */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-900 border-b pb-3 border-slate-200 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E43D12]" /> Step 3: All Team Member Details ({teamSize} Members)
              </h2>

              {Array.from({ length: teamSize }).map((_, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 font-black text-slate-900 text-sm">
                      <span className="w-6 h-6 rounded-full gradient-bg-flame text-white flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      {idx === 0 ? 'Team Leader Details' : `Team Member ${idx + 1} Details`}
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] font-black uppercase bg-[#E43D12]/10 text-[#E43D12] px-2.5 py-0.5 rounded-full border border-[#E43D12]/30">
                        Leader
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={idx === 0}
                        placeholder="Member Full Name"
                        value={members[idx].name}
                        onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold ${
                          idx === 0
                            ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                            : 'border-slate-300 focus:border-[#E43D12] bg-white text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        disabled={idx === 0}
                        placeholder="member@college.edu"
                        value={members[idx].email}
                        onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold ${
                          idx === 0
                            ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                            : 'border-slate-300 focus:border-[#E43D12] bg-white text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        disabled={idx === 0}
                        placeholder="+91 98765 43210"
                        value={members[idx].phone}
                        onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold ${
                          idx === 0
                            ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                            : 'border-slate-300 focus:border-[#E43D12] bg-white text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                        College / Institution (Read-Only)
                      </label>
                      <CollegeCombobox value={members[idx].college} onChange={() => {}} disabled={true} />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                        Department *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Department / Major"
                        value={members[idx].department}
                        onChange={(e) => handleMemberChange(idx, 'department', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E43D12] text-sm font-semibold bg-white text-slate-900 placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                        Year of Study *
                      </label>
                      <select
                        value={members[idx].year}
                        onChange={(e) => handleMemberChange(idx, 'year', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E43D12] text-sm font-semibold bg-white text-slate-900"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year / Final</option>
                        <option value="PG / Masters">PG / Masters</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm flex items-center gap-2 hover:bg-slate-100"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep3()) setStep(4);
                  }}
                  className="px-6 py-3 rounded-xl btn-3d-primary font-black text-sm text-white flex items-center gap-2 shadow-lg"
                >
                  Proceed to Payment Proof <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Payment Verification & Proof Upload */}
          {step === 4 && (
            <form onSubmit={handleSubmitRegistration} className="space-y-6">
              <h2 className="text-xl font-black text-slate-900 border-b pb-3 border-slate-200 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#E43D12]" /> Step 4: Payment Details & Receipt Upload
              </h2>

              {/* Payment Details Display Card */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#E43D12]">Registration Fee</span>
                  <span className="text-xl font-black text-emerald-700">{cmsContent.regFee || '₹300 / Team'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-2 text-xs text-slate-700">
                    <p><strong className="text-slate-900">Bank Name:</strong> {cmsContent.bankName || 'State Bank of India'}</p>
                    <p><strong className="text-slate-900">Account Name:</strong> {cmsContent.bankAccountName || 'GLITCH HACKATHON COMMITTEE'}</p>
                    <p><strong className="text-slate-900">Account Number:</strong> {cmsContent.bankAccountNumber || '98765432109876'}</p>
                    <p><strong className="text-slate-900">IFSC Code:</strong> {cmsContent.bankIfsc || 'SBIN0001234'}</p>
                    <p><strong className="text-slate-900">UPI ID:</strong> <code className="bg-white px-2 py-0.5 rounded text-[#E43D12] font-bold border border-slate-300 shadow-xs">{cmsContent.upiId || 'glitch10@upi'}</code></p>
                  </div>

                  {/* QR Code Display */}
                  <div className="bg-white p-4 rounded-xl text-slate-900 text-center space-y-2 border border-slate-200 shadow-xs">
                    {cmsContent.qrCodeUrl ? (
                      <img src={cmsContent.qrCodeUrl} alt="Payment QR Code" className="w-36 h-36 mx-auto object-contain rounded-lg border border-slate-200 bg-white p-1" />
                    ) : (
                      <div className="w-32 h-32 mx-auto bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-900 text-[10px] font-mono tracking-widest border border-slate-200">
                        <QrCode className="w-16 h-16 text-[#E43D12] mb-1" />
                        GLITCH - 1.0 QR
                      </div>
                    )}
                    <p className="text-[11px] font-extrabold text-[#E43D12]">Scan QR Code via PhonePe / GPay / Paytm</p>
                  </div>
                </div>
              </div>

              {/* Upload Screenshot File */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                  Upload Payment Proof Screenshot * (Mandatory JPG / PNG)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-[#E43D12] rounded-2xl p-6 text-center bg-slate-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label htmlFor="screenshot-upload" className="cursor-pointer space-y-2 block">
                    <Upload className="w-8 h-8 text-[#E43D12] mx-auto" />
                    <span className="text-xs font-bold text-slate-700 block">
                      Click to upload payment screenshot (JPG, PNG)
                    </span>
                    <span className="text-[11px] text-slate-500 block">Maximum size 1MB</span>
                  </label>
                </div>

                {paymentPreview && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={paymentPreview} alt="Payment Receipt" className="w-12 h-12 object-cover rounded-lg border border-slate-300" />
                      <span className="text-xs font-semibold text-slate-800 truncate max-w-xs">
                        {paymentFile?.name || 'Payment_Receipt.png'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Selected
                    </span>
                  </div>
                )}
              </div>

              {/* Transaction UTR Number */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                  Transaction Number / UTR Number * (Mandatory 12-digit Ref)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 429182740192 or UPI Ref ID"
                  value={transactionUtor}
                  onChange={(e) => setTransactionUtor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#E43D12] text-sm font-semibold bg-slate-50 text-slate-900 placeholder-slate-400"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm flex items-center gap-2 hover:bg-slate-100"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 rounded-xl btn-3d-primary font-black text-sm text-white flex items-center gap-2 shadow-xl"
                >
                  {submitting ? (
                    <span>Submitting Registration...</span>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 text-[#EFB11D]" />
                      Submit Team Registration
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
