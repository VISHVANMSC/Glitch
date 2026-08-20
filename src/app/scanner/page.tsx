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
  Zap,
  Volume2,
  Shield,
  Layers,
  CameraOff,
  X,
  Bell,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
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
  
  // Popup Modal States for Visual & Audio Feedback
  const [showScanPopupModal, setShowScanPopupModal] = useState(false);
  const [showErrorPopupModal, setShowErrorPopupModal] = useState<string | null>(null);

  // Phone Camera Scanner State
  const [cameraActive, setCameraActive] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const lastScannedCodeRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

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

  // Smartphone Camera Scanner Lifecycle (Html5Qrcode)
  useEffect(() => {
    let isMounted = true;

    if (cameraActive && selectedEventId) {
      const elementId = 'phone-qr-reader';
      const html5QrCode = new Html5Qrcode(elementId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
        ],
        verbose: false,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      } as any);
      html5QrCodeRef.current = html5QrCode;

      const dynamicBoxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
        const width = Math.floor(Math.min(viewfinderWidth * 0.9, 340));
        const height = Math.floor(Math.min(viewfinderHeight * 0.6, 200));
        return { width, height };
      };

      html5QrCode
        .start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: dynamicBoxFunction,
          },
          (decodedText) => {
            if (!isMounted) return;
            const now = Date.now();
            if (decodedText === lastScannedCodeRef.current && now - lastScanTimeRef.current < 3000) {
              return;
            }
            lastScannedCodeRef.current = decodedText;
            lastScanTimeRef.current = now;
            processScannedCode(decodedText);
          },
          () => {
            // Ignore scan frame decode errors
          }
        )
        .catch((err) => {
          console.error('Camera initialization failed:', err);
          if (isMounted) {
            setCameraActive(false);
            setShowErrorPopupModal('Camera permission denied or camera not accessible on this device.');
            playErrorBeep();
          }
        });
    }

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            html5QrCodeRef.current?.clear();
            html5QrCodeRef.current = null;
          })
          .catch((err) => console.error('Error stopping camera:', err));
      }
    };
  }, [cameraActive, selectedEventId]);

  // Focus scan input automatically for hardware scanners / manual input
  useEffect(() => {
    if (scanInputRef.current && !showScanPopupModal && !cameraActive) {
      scanInputRef.current.focus();
    }
  }, [showScanPopupModal, selectedEventId, cameraActive]);

  const processScannedCode = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    if (!selectedEventId) {
      setShowErrorPopupModal('Please select an active scanning event first.');
      playErrorBeep();
      return;
    }

    setLoadingScan(true);
    setFeedback(null);
    setShowErrorPopupModal(null);

    try {
      const res = await fetch('/api/scanner/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode, eventId: selectedEventId }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Play error buzzer and pop up error modal
        playErrorBeep();
        setShowErrorPopupModal(data.error || 'Invalid or unapproved team scan.');
        setScannedTeam(null);
        setMembersList([]);
        return;
      }

      // Successful Scan! Play loud beep sound
      playSuccessBeep();
      setScannedTeam(data.team);
      setMembersList(data.members || []);

      if (data.isAlreadyScanned && !data.allowDuplicate) {
        setFeedback({
          type: 'WARNING',
          message: data.warningMessage || `Team "${data.team.teamName}" has ALREADY been scanned for this event!`,
        });
      } else {
        setFeedback({
          type: 'SUCCESS',
          message: `Team "${data.team.teamName}" (${data.team.teamId}) successfully scanned and loaded.`,
        });
      }

      // Pop up team verification modal
      setShowScanPopupModal(true);
      setScanCodeInput('');
    } catch (err: any) {
      playErrorBeep();
      setShowErrorPopupModal(err.message || 'Scan verification failed.');
    } finally {
      setLoadingScan(false);
    }
  };

  const handleManualFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processScannedCode(scanCodeInput);
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
        setShowErrorPopupModal(data.error || 'Failed to submit attendance.');
        playErrorBeep();
        return;
      }

      // Play success chime sound again for attendance confirmation
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

      // Close popup modal and reset for next scan
      setShowScanPopupModal(false);
      setScannedTeam(null);
      setMembersList([]);
      if (scanInputRef.current && !cameraActive) scanInputRef.current.focus();
    } catch (err: any) {
      setShowErrorPopupModal(err.message || 'Submission error');
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
            <button
              onClick={() => playSuccessBeep()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-lg transition cursor-pointer border border-indigo-500/30"
              title="Test Audio Beep Sound"
            >
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Test Sound Beep</span>
            </button>

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
        {/* Left Scanner Control Panel (8 cols) */}
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
              {feedback.type === 'INFO' && <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}
              <div className="flex-1">
                <span className="font-bold block text-base mb-0.5">
                  {feedback.type === 'SUCCESS' ? 'SCAN APPROVED' : feedback.type === 'ERROR' ? 'SCAN ERROR' : feedback.type === 'WARNING' ? 'ALREADY SCANNED' : 'TEAM LOADED'}
                </span>
                {feedback.message}
              </div>
            </div>
          )}

          {/* Smartphone Camera Scanner Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Phone Camera Scanner</h2>
              </div>

              <button
                type="button"
                onClick={() => setCameraActive(!cameraActive)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-lg ${
                  cameraActive
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {cameraActive ? (
                  <>
                    <CameraOff className="w-4 h-4" />
                    <span>Stop Camera</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Start Phone Camera</span>
                  </>
                )}
              </button>
            </div>

            {/* Camera Viewport Container */}
            {cameraActive ? (
              <div className="space-y-2">
                <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500 bg-black min-h-[260px] flex items-center justify-center">
                  <div id="phone-qr-reader" className="w-full text-white" />
                </div>
                <p className="text-xs text-center text-indigo-300 font-semibold animate-pulse">
                  📷 Point phone camera at participant's QR code. Beep sound plays automatically upon QR detection...
                </p>
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center text-xs text-slate-400">
                Tap <strong className="text-indigo-400">Start Phone Camera</strong> to scan team QR codes directly using your smartphone camera with audio beep feedback.
              </div>
            )}
          </div>

          {/* Manual Input / Hardware Scanner Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              Manual Code Input / USB Hardware Scanner
            </h2>

            <form onSubmit={handleManualFormSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  ref={scanInputRef}
                  type="text"
                  value={scanCodeInput}
                  onChange={(e) => setScanCodeInput(e.target.value)}
                  placeholder="Type Team ID (e.g. GL-01) or scan barcode..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  disabled={loadingScan}
                />
              </div>

              <button
                type="submit"
                disabled={loadingScan || !scanCodeInput.trim()}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl shadow-md disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
              >
                {loadingScan ? (
                  <span>Fetching...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search Team</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Default Ready State Card when no popup active */}
          {!scannedTeam && (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 text-center text-slate-500">
              <QrCode className="w-16 h-16 mx-auto mb-4 text-indigo-500/40 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-300">Ready to Scan Team Pass</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Point your smartphone camera at a participant's QR code or type their Team ID. A scan success popup and audio chime will trigger immediately!
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

      {/* POPUP MODAL 1: PROMINENT TEAM SCAN VERIFICATION & ATTENDANCE POPUP */}
      {showScanPopupModal && scannedTeam && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-emerald-500 max-w-2xl w-full rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-white relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg animate-bounce">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider">
                      🟢 QR SCAN VERIFIED
                    </span>
                    <span className="font-mono text-sm font-black text-emerald-400">
                      {scannedTeam.teamId}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">
                    Team "{scannedTeam.teamName}"
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setShowScanPopupModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Team Leader & Institution Details */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Team Leader</span>
                <span className="font-bold text-slate-200 text-sm">{scannedTeam.leaderName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Institution</span>
                <span className="font-bold text-indigo-400 text-sm truncate block">{scannedTeam.members?.[0]?.college || 'College'}</span>
              </div>
            </div>

            {/* Interactive Attendance Roster Checklist inside Popup */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Select Present Members ({membersList.filter((m) => m.selected).length}/{membersList.length})
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllMembers}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllMembers}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {membersList.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => toggleMemberSelection(m.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      m.selected
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-100 shadow-md'
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
                        <span className="font-bold text-sm text-white truncate">{m.name}</span>
                        {m.isLeader && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-extrabold uppercase">
                            Leader
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{m.department || 'Participant'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setShowScanPopupModal(false)}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Scan Next QR
              </button>

              <button
                type="button"
                onClick={handleConfirmAttendance}
                disabled={submitting || membersList.filter((m) => m.selected).length === 0}
                className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-emerald-600/30 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Saving Attendance...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm Attendance ({membersList.filter((m) => m.selected).length} Members)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: SCAN ERROR / INVALID QR POPUP MODAL */}
      {showErrorPopupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-red-500 max-w-md w-full rounded-3xl p-6 text-center space-y-5 shadow-2xl text-white">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto animate-bounce">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-red-400 uppercase tracking-wider">
                Invalid or Unapproved QR Code
              </h3>
              <p className="text-sm font-semibold text-slate-300">
                {showErrorPopupModal}
              </p>
            </div>

            <button
              onClick={() => setShowErrorPopupModal(null)}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg cursor-pointer transition"
            >
              Dismiss & Scan Next QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
