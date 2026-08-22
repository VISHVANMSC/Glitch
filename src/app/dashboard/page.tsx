'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TeamTrackingView from '@/components/TeamTrackingView';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  ExternalLink,
  Lock,
  Trophy,
  AlertCircle,
  QrCode,
  Download,
} from 'lucide-react';

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [teamData, setTeamData] = useState<any>(null);
  const [problemStatements, setProblemStatements] = useState<any[]>([]);
  const [selectionWindow, setSelectionWindow] = useState<any>(null);

  const [selectingPs, setSelectingPs] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.user) {
        window.location.href = '/login';
        return;
      }
      setUserData(data.user);
      setTeamData(data.team);

      // Fetch problem statements & timer
      const psRes = await fetch('/api/admin/problem-statements');
      const psData = await psRes.json();
      setProblemStatements(psData.problemStatements || []);
      setSelectionWindow(psData.selectionWindow || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Polling status updates
    return () => clearInterval(interval);
  }, []);

  const handleSelectPs = async (psId: string) => {
    if (!confirm('Are you sure you want to select this Problem Statement? Once selected, your choice is permanently locked.')) {
      return;
    }
    setError('');
    setMessage('');
    setSelectingPs(true);

    try {
      const res = await fetch('/api/problem-statements/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ psId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to select Problem Statement.');
      }

      setMessage(data.message);
      fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Error selecting Problem Statement.');
    } finally {
      setSelectingPs(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#E43D12] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-black uppercase tracking-widest text-[#E43D12]">Loading Team Leader Dashboard...</p>
        </div>
      </div>
    );
  }

  // If no team registered yet
  if (!teamData) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 bg-cyber-grid">
        <Navbar user={userData} />
        <main className="flex-1 pt-32 pb-16 px-4 max-w-xl mx-auto text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 border border-amber-300 flex items-center justify-center mb-4 shadow-md">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Registration Incomplete</h2>
          <p className="text-slate-600 text-xs font-semibold mt-2 mb-6">
            You have not submitted a team registration yet. Team registration is mandatory.
          </p>
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl btn-3d-primary text-white font-black text-sm shadow-lg hover:scale-105 transition-transform"
          >
            Complete Team Registration
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isApproved = teamData.status === 'APPROVED';
  const isRejected = teamData.status === 'REJECTED';
  const isPending = teamData.status === 'PENDING';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 bg-cyber-grid">
      <Navbar user={userData} />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Status Header Banner */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 ${isApproved
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : isRejected
                ? 'bg-red-50 border-red-300 text-red-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white border border-current">
                {teamData.status}
              </span>
              {isApproved && teamData.teamId && (
                <span className="font-mono text-sm font-black bg-white text-[#E43D12] border border-[#E43D12]/30 px-3 py-0.5 rounded-full shadow-sm">
                  Team ID: {teamData.teamId}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Team "{teamData.teamName}"
            </h1>
            <p className="text-xs font-bold text-slate-700">
              {isApproved && 'Your registration is verified. Access your Problem Statement selection below.'}
              {isPending && 'Your application is currently under admin verification. Team ID will be assigned upon approval.'}
              {isRejected && 'Your registration application was not approved by the admin team.'}
            </p>
          </div>

          {/* Action / Badge Status */}
          <div className="shrink-0">
            {isApproved && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-md">
                <CheckCircle2 className="w-5 h-5" /> Registration Approved
              </div>
            )}
            {isPending && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-black shadow-md animate-pulse">
                <Clock className="w-5 h-5" /> Under Admin Review
              </div>
            )}
            {isRejected && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-black shadow-md">
                <XCircle className="w-5 h-5" /> Application Rejected
              </div>
            )}
          </div>
        </div>

        {/* Rejection Reason Alert if Rejected */}
        {isRejected && teamData.rejectionReason && (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs space-y-1">
            <p className="font-black uppercase tracking-wider text-red-700">❌ Reason for Rejection:</p>
            <p className="font-semibold text-sm text-red-800">{teamData.rejectionReason}</p>
          </div>
        )}

        {/* Prize Results Announcement Banner (If awarded) */}
        {teamData.result && teamData.result !== 'NONE' && (
          <div className="p-6 rounded-3xl gradient-bg-primary text-white space-y-2 shadow-xl flex items-center justify-between border border-[#EFB11D]">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#EFB11D]">GLITCH - 1.0 Prize Result</span>
              <h2 className="text-2xl font-black mt-0.5">
                🏆 Awarded Tier: <span className="text-[#EFB11D] uppercase">{teamData.result.replace('_', ' ')}</span>
              </h2>
              <p className="text-xs text-white font-semibold">Congratulations to team {teamData.teamName} on your outstanding performance!</p>
            </div>
            <Trophy className="w-12 h-12 text-[#EFB11D] shrink-0" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* PROBLEM STATEMENT SELECTION MODULE */}
            <div className="card-3d p-6 sm:p-8 rounded-3xl bg-white border-slate-200 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#E43D12]" /> Problem Statement Selection
                </h2>
                {selectionWindow?.isOpen ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" /> Selection Window OPEN ({selectionWindow.durationMinutes}m)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-300 text-xs font-black uppercase tracking-wider">
                    Window CLOSED
                  </span>
                )}
              </div>

              {message && <p className="text-xs font-bold text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-300">✅ {message}</p>}
              {error && <p className="text-xs font-bold text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">⚠️ {error}</p>}

              {/* Already Selected PS Display */}
              {teamData.selectedPs ? (
                <div className="p-6 rounded-2xl bg-[#E43D12]/5 border-2 border-[#E43D12] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full gradient-bg-flame text-white font-black text-xs">
                      {teamData.selectedPs.psNumber}
                    </span>
                    <span className="text-xs font-black text-[#E43D12] uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Selection Permanently Locked
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900">{teamData.selectedPs.title}</h3>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed font-semibold">{teamData.selectedPs.description}</p>
                  </div>

                  <div className="pt-2">
                    <a
                      href={teamData.selectedPs.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-3d-primary text-white text-xs font-black shadow-md hover:scale-105 transition-transform"
                    >
                      <ExternalLink className="w-4 h-4" /> Open Problem Statement Google Drive Resource
                    </a>
                  </div>
                </div>
              ) : isApproved ? (
                selectionWindow?.isOpen ? (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 font-semibold">
                      Selection is currently OPEN. Select ONE Problem Statement below. Once submitted, your selection cannot be changed.
                    </p>
                    <div className="space-y-4">
                      {problemStatements.map((ps) => (
                        <div key={ps.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#E43D12] transition-all space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs bg-white text-[#E43D12] border border-slate-300 px-2.5 py-1 rounded-md">
                              {ps.psNumber}
                            </span>
                            <span className="text-[11px] font-black text-[#D6536D] bg-[#D6536D]/10 px-2 py-0.5 rounded border border-[#D6536D]/30">
                              {ps.category || 'General'}
                            </span>
                          </div>

                          <h4 className="font-black text-slate-900 text-base">{ps.title}</h4>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">{ps.description}</p>

                          <div className="pt-2 flex items-center justify-between">
                            <a
                              href={ps.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#E43D12] font-black hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View Drive Resource
                            </a>
                            <button
                              onClick={() => handleSelectPs(ps.id)}
                              disabled={selectingPs}
                              className="px-4 py-2 rounded-xl btn-3d-primary text-white text-xs font-black shadow-md hover:scale-105 transition-transform"
                            >
                              Select {ps.psNumber} & Lock
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <Lock className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-black text-slate-700">Problem Statement Selection Window is Closed</p>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Selection opens only during the admin designated timer window on the hackathon event day.
                    </p>
                  </div>
                )
              ) : (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center text-xs font-bold text-amber-900 space-y-1">
                  <p className="font-black text-[#E43D12]">🔒 Pending Admin Approval</p>
                  <p>Problem statement selection will unlock automatically once your team registration is verified by admin.</p>
                </div>
              )}
            </div>

            {/* Team Members List */}
            <div className="card-3d p-6 sm:p-8 rounded-3xl bg-white border-slate-200 shadow-xl space-y-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 border-b pb-3 border-slate-200">
                <Users className="w-5 h-5 text-[#E43D12]" /> Team Roster ({teamData.teamSize} Members)
              </h2>

              <div className="space-y-3">
                {teamData.members?.map((mem: any, idx: number) => (
                  <div key={mem.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">{mem.name}</h4>
                        {mem.isLeader && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 px-2 py-0.5 rounded">
                            Team Leader
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-semibold">
                        {mem.department} • {mem.year}
                      </p>
                      <p className="text-xs text-[#E43D12] font-extrabold">{mem.college}</p>
                    </div>

                    <div className="text-right text-xs text-slate-600 font-semibold space-y-0.5">
                      <p>✉️ {mem.email}</p>
                      <p>📞 {mem.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* View-Only Participant & Team Tracking System */}
            <TeamTrackingView teamId={teamData?.id} />
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-6">
            {/* Team Overview Card */}
            <div className="card-3d p-6 rounded-3xl bg-white border-slate-200 space-y-4 shadow-sm">
              <h3 className="font-black text-slate-900 text-base border-b pb-2 border-slate-200">
                Registration Summary
              </h3>

              <div className="space-y-3 text-xs text-slate-700 font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-500">Team Name:</span>
                  <span className="font-black text-slate-900">{teamData.teamName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Team ID:</span>
                  <span className="font-mono font-black text-[#E43D12]">{teamData.teamId || 'Pending Approval'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Team Size:</span>
                  <span className="font-bold text-slate-900">{teamData.teamSize} Members</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Institution:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[150px] text-right">{teamData.members?.[0]?.college || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">UTR / Ref Number:</span>
                  <span className="font-mono font-bold text-slate-900">{teamData.transactionUtor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="font-black text-emerald-600 uppercase">{teamData.paymentStatus}</span>
                </div>
              </div>
            </div>

            {/* Official Downloadable Team Pass (Barcode) */}
            {isApproved && teamData.barcodeUrl && (
              <div className="card-3d p-6 rounded-3xl bg-white border-2 border-emerald-300 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-black text-slate-900 text-sm">Official Team Scanning Pass</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase">
                    Pass Ready
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-semibold">
                  Save your official team Barcode Pass for venue check-in, meal scanning, and event entry.
                </p>

                <div className="flex flex-col items-center justify-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-center space-y-1.5 w-full">
                    <img src={teamData.barcodeUrl} alt="Official Team Barcode Pass" className="w-64 max-w-full h-auto bg-white p-2 rounded-xl border border-slate-200 shadow-sm mx-auto" />
                    <span className="text-xs font-mono font-bold text-slate-700 block">Team ID: {teamData.teamId || 'GL-01'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch(teamData.barcodeUrl);
                        const blob = await res.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${teamData.teamId || 'Team'}_Barcode.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      } catch {
                        window.open(teamData.barcodeUrl, '_blank');
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    <Download className="w-4 h-4 text-white" /> Download Barcode Pass (PNG)
                  </button>
                </div>
              </div>
            )}

            {/* Payment Proof Preview */}
            <div className="card-3d p-6 rounded-3xl bg-white border-slate-200 space-y-3 shadow-sm">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-500">
                Uploaded Payment Screenshot
              </h3>
              {teamData.paymentScreenshotUrl ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={teamData.paymentScreenshotUrl}
                    alt="Uploaded Receipt"
                    className="w-full h-40 object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-semibold">No receipt uploaded.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
