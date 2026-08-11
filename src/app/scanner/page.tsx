'use client';

import { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Users,
  Search,
  LogOut,
  AlertTriangle,
  RefreshCw,
  Camera,
  CheckSquare,
  Square,
  Sparkles,
  Zap,
  Volume2,
  Shield,
  Layers,
} from 'lucide-react';
import { playSuccessBeep, playErrorBeep } from '@/lib/audio';

export default function ScannerDashboard() {
  const [operator, setOperator] = useState<any>(null);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [scanCodeInput, setScanCodeInput] = useState('');

  const [loadingScan, setLoadingScan] = useState(false);
  const [scannedTeam, setScannedTeam] = useState<any>(null);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO'; message: string } | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [cameraActive, setCameraActive] = useState(false);

  const scanInputRef = useRef<HTMLInputElement>(null);

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch operator session & active events
  useEffect(() => {
    fetchSessionAndEvents();
  }, []);

  const fetchSessionAndEvents = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.user || (meData.user.role !== 'SCANNER' && meData.user.role !== 'ADMIN')) {
        window.location.href = '/scanner/login';
        return;
      }
      setOperator(meData.user);

      const evtRes = await fetch('/api/scanner/active-events');
      const evtData = await evtRes.json();
      if (evtData.events && evtData.events.length > 0) {
        setActiveEvents(evtData.events);
        setSelectedEventId(evtData.events[0].id);
      }
    } catch (err) {
      console.error('Failed to load scanner context', err);
    }
  };

  // Focus scan input automatically for hardware scanners
  useEffect(() => {
    if (scanInputRef.current && !scannedTeam) {
      scanInputRef.current.focus();
    }
  }, [scannedTeam, selectedEventId]);

  const handleCodeScanSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = scanCodeInput.trim();
    if (!code) return;

    if (!selectedEventId) {
      setFeedback({ type: 'ERROR', message: 'Please select an active scanning event first.' });
      playErrorBeep();
      return;
    }

    setLoadingScan(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/scanner/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, eventId: selectedEventId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'ERROR', message: data.error || 'Invalid or unapproved team scan.' });
        playErrorBeep();
        setScannedTeam(null);
        setMembersList([]);
        return;
      }

      setScannedTeam(data.team);
      setMembersList(data.members || []);

      if (data.isAlreadyScanned && !data.allowDuplicate) {
        setFeedback({
          type: 'WARNING',
          message: data.warningMessage || `Team "${data.team.teamName}" has ALREADY been scanned for this event!`,
        });
        playErrorBeep();
      } else {
        setFeedback({
          type: 'INFO',
          message: `Team "${data.team.teamName}" (${data.team.teamId}) loaded. All members selected by default.`,
        });
      }
      setScanCodeInput('');
    } catch (err: any) {
      setFeedback({ type: 'ERROR', message: err.message || 'Scan verification failed.' });
      playErrorBeep();
    } finally {
      setLoadingScan(false);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setMembersList((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, selected: !m.selected } : m))
    );
  };

  const selectAllMembers = () => {
    setMembersList((prev) => prev.map((m) => ({ ...m, selected: true })));
  };

  const deselectAllMembers = () => {
    setMembersList((prev) => prev.map((m) => ({ ...m, selected: false })));
  };

  const handleConfirmAttendance = async () => {
    if (!scannedTeam || !selectedEventId) return;

    const selections = membersList.map((m) => ({
      memberId: m.id,
      present: Boolean(m.selected),
    }));

    setSubmitting(true);

    try {
      const res = await fetch('/api/scanner/submit-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          teamId: scannedTeam.id,
          memberSelections: selections,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'ERROR', message: data.error || 'Failed to submit attendance.' });
        playErrorBeep();
        return;
      }

      // Play high chime sound for success
      playSuccessBeep();
      setFeedback({
        type: 'SUCCESS',
        message: `SUCCESS! Attendance recorded for Team "${scannedTeam.teamName}" (${scannedTeam.teamId}). ${data.presentCount} Present, ${data.absentCount} Absent.`,
      });

      // Add to recent scans list
      const activeEvtObj = activeEvents.find((e) => e.id === selectedEventId);
      setRecentScans((prev) => [
        {
          id: Date.now(),
          teamId: scannedTeam.teamId,
          teamName: scannedTeam.teamName,
          eventName: activeEvtObj?.name || 'Event',
          presentCount: data.presentCount,
          totalCount: membersList.length,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 9),
      ]);

      // Reset team view for next scan
      setScannedTeam(null);
      setMembersList([]);
      if (scanInputRef.current) scanInputRef.current.focus();
    } catch (err: any) {
      setFeedback({ type: 'ERROR', message: err.message || 'Submission error' });
      playErrorBeep();
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/scanner/login';
  };

  const currentEvent = activeEvents.find((e) => e.id === selectedEventId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
                GLITCH 1.0 Attendance Scanner
              </h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Operator: <span className="text-slate-200 font-semibold">{operator?.name || 'Scanner'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-indigo-300">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentTime}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Active Event Selector Banner */}
      <div className="bg-slate-900/40 border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Session Event:
            </span>
          </div>

          {activeEvents.length > 0 ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setScannedTeam(null);
                  setMembersList([]);
                  setFeedback(null);
                }}
                className="w-full sm:w-80 bg-slate-950 border border-slate-700 text-white font-semibold text-sm rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {activeEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name} ({evt.type})
                  </option>
                ))}
              </select>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-lg shrink-0">
                ACTIVE
              </span>
            </div>
          ) : (
            <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>No active scanning events found. Please activate an event in the Admin Panel.</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Scanner & Team Control Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl border font-medium text-sm flex items-start gap-3 shadow-lg transition-all animate-fadeIn ${
                feedback.type === 'SUCCESS'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                  : feedback.type === 'ERROR'
                  ? 'bg-red-500/15 border-red-500/40 text-red-200 animate-shake'
                  : feedback.type === 'WARNING'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                  : 'bg-indigo-500/15 border-indigo-500/40 text-indigo-200'
              }`}
            >
              {feedback.type === 'SUCCESS' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {feedback.type === 'ERROR' && <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
              {feedback.type === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
              {feedback.type === 'INFO' && <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}
              <div className="flex-1">
                <span className="font-bold block text-base mb-0.5">
                  {feedback.type === 'SUCCESS' ? 'SCAN APPROVED' : feedback.type === 'ERROR' ? 'SCAN ERROR' : feedback.type === 'WARNING' ? 'ALREADY SCANNED' : 'TEAM LOADED'}
                </span>
                {feedback.message}
              </div>
            </div>
          )}

          {/* Quick Code Scan Input Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <QrCode className="w-32 h-32 text-indigo-400" />
            </div>

            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              Scan Team QR Code / Barcode
            </h2>

            <form onSubmit={handleCodeScanSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  ref={scanInputRef}
                  type="text"
                  value={scanCodeInput}
                  onChange={(e) => setScanCodeInput(e.target.value)}
                  placeholder="Scan QR/Barcode or enter Team ID (e.g. GL-01)..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  disabled={loadingScan}
                />
              </div>

              <button
                type="submit"
                disabled={loadingScan || !scanCodeInput.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {loadingScan ? (
                  <span>Fetching Team...</span>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Scan Team</span>
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-slate-500 mt-2">
              💡 Tip: Plug in a hardware USB Barcode/QR scanner to automatically scan and fetch teams instantly on enter.
            </p>
          </div>

          {/* Active Scanned Team Card & Attendance Checklist */}
          {scannedTeam ? (
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
              {/* Team Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black rounded-lg">
                      {scannedTeam.teamId}
                    </span>
                    <h3 className="text-xl font-extrabold text-white">{scannedTeam.teamName}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Leader: <span className="text-slate-200 font-semibold">{scannedTeam.leaderName}</span> • Total Members: <span className="text-indigo-400 font-semibold">{scannedTeam.teamSize}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllMembers}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllMembers}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Members Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Check-In Team Members ({membersList.filter((m) => m.selected).length}/{membersList.length} Selected)
                  </h4>
                  <span className="text-xs text-slate-400">
                    Deselect physically absent members
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {membersList.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => toggleMemberSelection(m.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                        m.selected
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="mt-0.5">
                        {m.selected ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-white truncate">{m.name}</span>
                          {m.isLeader && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-extrabold uppercase">
                              Leader
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{m.department || m.college || 'Participant'}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{m.phone || m.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setScannedTeam(null);
                    setMembersList([]);
                    setFeedback(null);
                  }}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAttendance}
                  disabled={submitting || membersList.filter((m) => m.selected).length === 0}
                  className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>Confirming Attendance...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Confirm Attendance ({membersList.filter((m) => m.selected).length} Members)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              <QrCode className="w-16 h-16 mx-auto mb-4 text-slate-700 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-300">Ready to Scan Team Pass</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Scan team QR Code or Barcode using your hardware scanner, camera, or search input above to load team members for check-in.
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Active Event Summary & Recent Scans (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Event Info Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Current Event Configuration
            </h3>

            {currentEvent ? (
              <div className="space-y-3">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Event Name</span>
                  <p className="text-sm font-bold text-white mt-0.5">{currentEvent.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Type</span>
                    <span className="font-bold text-indigo-400">{currentEvent.type}</span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Duplicates</span>
                    <span className={`font-bold ${currentEvent.allowDuplicate ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {currentEvent.allowDuplicate ? 'Allowed' : 'Blocked'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No active event selected.</p>
            )}
          </div>

          {/* Recent Scans Session Log */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Session Scan Activity
              </span>
              <span className="text-[11px] text-slate-500 font-normal">{recentScans.length} Scanned</span>
            </h3>

            {recentScans.length > 0 ? (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-300">{scan.teamId}</span>
                        <span className="font-semibold text-white truncate max-w-[120px]">{scan.teamName}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {scan.eventName} • {scan.time}
                      </p>
                    </div>

                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                      {scan.presentCount}/{scan.totalCount} Present
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">
                No team scans recorded in this session yet.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
