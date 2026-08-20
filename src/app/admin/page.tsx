'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  FileText,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Lock,
  Unlock,
  Award,
  Trophy,
  Save,
  GraduationCap,
  Briefcase,
  Eye,
  Check,
  X,
  Layers,
  Upload,
  CreditCard,
  Calendar,
  ShieldAlert,
  AlertCircle,
  QrCode,
  Zap,
  Mail,
  RefreshCw,
  FileSpreadsheet,
  Activity,
  AlertTriangle,
  Archive,
} from 'lucide-react';
import { uploadQrCodeImage } from '@/lib/supabase';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Active Tab: 'registrations' | 'attendance' | 'events' | 'scanners' | 'audit' | 'problem-statements' | 'results' | 'coordinators' | 'cms'
  const [activeTab, setActiveTab] = useState('registrations');

  // Registrations & Search/Filter
  const [teams, setTeams] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTeamModal, setSelectedTeamModal] = useState<any>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Attendance Dashboard State
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [manualCorrectionModal, setManualCorrectionModal] = useState<any>(null);
  const [manualStatusInput, setManualStatusInput] = useState<'PRESENT' | 'ABSENT'>('PRESENT');
  const [manualNoteInput, setManualNoteInput] = useState('');

  // Events State
  const [events, setEvents] = useState<any[]>([]);
  const [newEventModal, setNewEventModal] = useState(false);
  const [newEventForm, setNewEventForm] = useState({
    name: '',
    type: 'CHECK_IN',
    startDate: '',
    endDate: '',
    isActive: true,
    allowDuplicate: false,
    description: '',
  });

  // Scanners State
  const [scanners, setScanners] = useState<any[]>([]);
  const [newScannerModal, setNewScannerModal] = useState(false);
  const [newScannerForm, setNewScannerForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    allowedEvents: ['CHECK_IN', 'BREAKFAST', 'LUNCH', 'REFRESHMENT', 'CHECK_OUT'],
  });

  // Audit Logs & Email Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  // CMS Form State
  const [cmsContent, setCmsContent] = useState<Record<string, string>>({});
  const [savingCms, setSavingCms] = useState(false);
  const [cmsSuccessSaved, setCmsSuccessSaved] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [cmsSubTab, setCmsSubTab] = useState<'hero' | 'prizes' | 'payment' | 'rules' | 'agenda'>('hero');

  // User-Friendly Interactive Date & Time Picker States
  const [pickerStartDate, setPickerStartDate] = useState<string>('2026-10-24');
  const [pickerEndDate, setPickerEndDate] = useState<string>('2026-10-25');
  const [pickerTime, setPickerTime] = useState<string>('08:30');
  const [pickerTimeSuffix, setPickerTimeSuffix] = useState<string>('IST (24 Hours Live Code)');

  const formatEventDateRange = (startDateStr: string, endDateStr: string): string => {
    if (!startDateStr) return '';
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return startDateStr;

    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];

    const month = monthNames[start.getMonth()];
    const startDay = start.getDate();
    const year = start.getFullYear();

    if (endDateStr) {
      const end = new Date(endDateStr);
      if (!isNaN(end.getTime()) && end.getMonth() === start.getMonth() && end.getFullYear() === year) {
        return `${month} ${startDay}-${end.getDate()}, ${year}`;
      }
      if (!isNaN(end.getTime())) {
        return `${month} ${startDay} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${year}`;
      }
    }

    return `${month} ${startDay}, ${year}`;
  };

  const formatEventTime = (timeStr: string, suffix: string = 'IST (24 Hours Live Code)'): string => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    let h = parseInt(parts[0], 10);
    if (isNaN(h)) return timeStr;
    const m = parts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    const formattedH = String(h).padStart(2, '0');
    return `${formattedH}:${m} ${ampm} ${suffix}`.trim();
  };

  // Coordinators State
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [newCoord, setNewCoord] = useState({
    type: 'FACULTY',
    name: '',
    designation: '',
    role: '',
    department: '',
    phone: '',
    email: '',
    photoUrl: '',
  });

  // Problem Statements & Window Timer State
  const [problemStatements, setProblemStatements] = useState<any[]>([]);
  const [selectionWindow, setSelectionWindow] = useState<any>(null);
  const [newPs, setNewPs] = useState({
    psNumber: '',
    title: '',
    description: '',
    category: 'Software & AI',
    driveLink: '',
  });
  const [editingPsModal, setEditingPsModal] = useState<any>(null);
  const [timerMinutes, setTimerMinutes] = useState(30);

  // Results State
  const [selectedTeamResultIds, setSelectedTeamResultIds] = useState<string[]>([]);
  const [assignResultTier, setAssignResultTier] = useState<any>('FIRST_PRIZE');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.user || meData.user.role !== 'ADMIN') {
        window.location.href = '/login?admin=true';
        return;
      }
      setAdminUser(meData.user);

      // Fetch all teams & registrations
      const regRes = await fetch('/api/admin/registrations');
      const regData = await regRes.json();
      setTeams(regData.teams || []);

      const cmsRes = await fetch('/api/admin/cms');
      const cmsData = await cmsRes.json();
      setCmsContent(cmsData.content || {});

      const coordRes = await fetch('/api/admin/coordinators');
      const coordData = await coordRes.json();
      setCoordinators(coordData.coordinators || []);

      const psRes = await fetch('/api/admin/problem-statements');
      const psData = await psRes.json();
      setProblemStatements(psData.problemStatements || []);
      setSelectionWindow(psData.selectionWindow || null);

      // Fetch Attendance, Events, Scanners, and Audit Logs
      try {
        const attRes = await fetch('/api/admin/attendance');
        const attData = await attRes.json();
        setAttendanceData(attData);

        const evtRes = await fetch('/api/admin/events');
        const evtData = await evtRes.json();
        setEvents(evtData.events || []);

        const scnRes = await fetch('/api/admin/scanners');
        const scnData = await scnRes.json();
        setScanners(scnData.scanners || []);

        const auditRes = await fetch('/api/admin/audit-logs');
        const auditData = await auditRes.json();
        setAuditLogs(auditData.auditLogs || []);

        const elogRes = await fetch('/api/admin/emails/logs');
        const elogData = await elogRes.json();
        setEmailLogs(elogData.emailLogs || []);
      } catch (err) {
        console.error('Additional scanning data load error', err);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handler: Approve Team
  const handleApproveTeam = async (teamDbId: string) => {
    setError('');
    setMessage('');
    setModalError('');
    setModalSuccess('');
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/registrations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamDbId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approval failed');
      
      setModalSuccess(data.message);
      setMessage(data.message);

      if (data.team) {
        setSelectedTeamModal(data.team);
      }
      fetchAdminData();
    } catch (err: any) {
      setModalError(err.message || 'Approval failed');
      setError(err.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Reject Team
  const handleRejectTeam = async (teamDbId: string) => {
    if (!rejectionReasonInput.trim()) {
      setModalError('Please enter a valid rejection reason below.');
      return;
    }
    setError('');
    setMessage('');
    setModalError('');
    setModalSuccess('');
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/registrations/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamDbId, rejectionReason: rejectionReasonInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rejection failed');
      
      setModalSuccess(data.message);
      setMessage(data.message);

      if (data.team) {
        setSelectedTeamModal(data.team);
      }
      setRejectionReasonInput('');
      fetchAdminData();
    } catch (err: any) {
      setModalError(err.message || 'Rejection failed');
      setError(err.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Regenerate Team QR Code & Barcode
  const handleRegenerateQr = async (teamDbId: string) => {
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/admin/registrations/regenerate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamDbId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'QR regeneration failed');
      setMessage(data.message);
      if (selectedTeamModal && selectedTeamModal.id === teamDbId) {
        setSelectedTeamModal(data.team);
      }
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Resend QR & Approval Email
  const handleResendEmail = async (teamDbId: string) => {
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/admin/emails/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamDbId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Resend email failed');
      setMessage(data.message);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Create Scanner User
  const handleCreateScanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/admin/scanners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScannerForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create scanner');
      setMessage(data.message);
      setNewScannerModal(false);
      setNewScannerForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        allowedEvents: ['CHECK_IN', 'BREAKFAST', 'LUNCH', 'REFRESHMENT', 'CHECK_OUT'],
      });
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Toggle Scanner Active
  const handleToggleScannerActive = async (scannerId: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/scanners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: scannerId, isActive: !currentActive }),
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Create Event Schedule
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEventForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create event');
      setMessage(data.message);
      setNewEventModal(false);
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Toggle Event Active State
  const handleToggleEventActive = async (eventId: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId, isActive: !currentActive }),
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Manual Attendance Correction
  const handleSaveManualAttendance = async () => {
    if (!manualCorrectionModal) return;
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: manualCorrectionModal.eventId,
          teamId: manualCorrectionModal.teamId,
          memberId: manualCorrectionModal.memberId,
          status: manualStatusInput,
          notes: manualNoteInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Manual override failed');
      setMessage(data.message);
      setManualCorrectionModal(null);
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handler: Save CMS
  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCms(true);
    setCmsSuccessSaved(false);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmsContent),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'CMS save failed');
      if (data.content) {
        setCmsContent(data.content);
      }
      setCmsSuccessSaved(true);
      setMessage('Landing Page CMS settings updated successfully.');
      setTimeout(() => setCmsSuccessSaved(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingCms(false);
    }
  };

  // Handler: Add Coordinator
  const handleAddCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/coordinators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoord),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add coordinator');
      setMessage('Coordinator added successfully');
      setNewCoord({
        type: 'FACULTY',
        name: '',
        designation: '',
        role: '',
        department: '',
        phone: '',
        email: '',
        photoUrl: '',
      });
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handler: Delete Coordinator
  const handleDeleteCoordinator = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coordinator?')) return;
    try {
      const res = await fetch(`/api/admin/coordinators?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setMessage('Coordinator removed');
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handler: Create Problem Statement
  const handleCreatePs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/problem-statements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPs),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create PS');
      setMessage('Problem statement added successfully');
      setNewPs({ psNumber: '', title: '', description: '', category: 'Software & AI', driveLink: '' });
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handler: Update Problem Statement
  const handleUpdatePs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPsModal) return;
    try {
      const res = await fetch('/api/admin/problem-statements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPsModal),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update PS');
      setMessage('Problem statement updated');
      setEditingPsModal(null);
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handler: Delete Problem Statement
  const handleDeletePs = async (id: string) => {
    if (!confirm('Delete this problem statement?')) return;
    try {
      const res = await fetch(`/api/admin/problem-statements?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete PS');
      setMessage('Problem statement deleted');
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handler: Toggle Selection Window Timer
  const handleToggleTimerWindow = async (isOpen: boolean) => {
    try {
      const res = await fetch('/api/admin/problem-statements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen, durationMinutes: timerMinutes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle selection window');
      setMessage(data.message);
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-black font-black">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#E43D12] border-t-transparent rounded-full animate-spin" />
          <span>Loading GLITCH Admin Command Center...</span>
        </div>
      </div>
    );
  }

  // Analytics counts
  const totalTeamsCount = teams.length;
  const pendingCount = teams.filter((t) => t.status === 'PENDING').length;
  const approvedCount = teams.filter((t) => t.status === 'APPROVED').length;
  const rejectedCount = teams.filter((t) => t.status === 'REJECTED').length;
  const totalParticipantsCount = teams.reduce((acc, t) => acc + (t.members?.length || t.teamSize), 0);

  // Filtered teams list
  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.teamId && t.teamId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.leader?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.leader?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.transactionUtor.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && t.status === statusFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] bg-cyber-grid text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-28 sm:pt-32 pb-12 space-y-8">
        {/* Admin Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-slate-300 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-[#E43D12]" /> Master Admin Control Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
              GLITCH <span className="text-[#E43D12]">1.0</span> Event Management
            </h1>
            <p className="text-xs text-black font-extrabold mt-1">
              Verify Registrations, Issue QR/Barcode Passes, Schedule Events & Monitor Live Gate Attendance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/scanner"
              target="_blank"
              className="px-4 py-2.5 rounded-xl btn-3d-primary font-black text-xs text-white shadow-md flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" /> Launch Scanner Portal
            </a>

            <a
              href="/api/admin/export/passes?type=ALL"
              target="_blank"
              className="px-4 py-2.5 rounded-xl border-2 border-indigo-500 bg-indigo-50 text-indigo-950 font-black text-xs flex items-center gap-2 hover:bg-indigo-100 shadow-sm cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <Archive className="w-4 h-4 text-indigo-600" /> Bulk Passes (ZIP)
            </a>

            <a
              href="/api/admin/export?type=registrations"
              target="_blank"
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-black font-extrabold text-xs flex items-center gap-2 hover:bg-slate-50 shadow-sm"
            >
              <Download className="w-4 h-4 text-[#E43D12]" /> Registrations CSV
            </a>

            <a
              href="/api/admin/export/attendance"
              target="_blank"
              className="px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 font-extrabold text-xs flex items-center gap-2 hover:bg-emerald-100 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Attendance CSV
            </a>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-sm">
            <span>✅ {message}</span>
            <button onClick={() => setMessage('')}><X className="w-4 h-4" /></button>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center justify-between shadow-sm">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Live Dynamic Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl card-3d bg-white border-slate-200 shadow-sm">
            <div className="text-xs font-black uppercase text-slate-500">Total Teams</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{totalTeamsCount}</div>
            <div className="text-[11px] font-bold text-[#E43D12] mt-1">Registrations Received</div>
          </div>
          <div className="p-5 rounded-2xl card-3d bg-white border-slate-200 shadow-sm">
            <div className="text-xs font-black uppercase text-slate-500">Pending Review</div>
            <div className="text-3xl font-black text-[#b45309] mt-1">{pendingCount}</div>
            <div className="text-[11px] font-bold text-amber-700 mt-1">Awaiting Verification</div>
          </div>
          <div className="p-5 rounded-2xl card-3d bg-white border-slate-200 shadow-sm">
            <div className="text-xs font-black uppercase text-slate-500">Approved Teams</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">{approvedCount}</div>
            <div className="text-[11px] font-bold text-emerald-700 mt-1">Assigned GL Team IDs</div>
          </div>
          <div className="p-5 rounded-2xl card-3d bg-white border-slate-200 shadow-sm">
            <div className="text-xs font-black uppercase text-slate-500">Rejected Teams</div>
            <div className="text-3xl font-black text-red-600 mt-1">{rejectedCount}</div>
            <div className="text-[11px] font-bold text-red-700 mt-1">With Rejection Reason</div>
          </div>
          <div className="p-5 rounded-2xl card-3d bg-white border-slate-200 shadow-sm col-span-2 lg:col-span-1">
            <div className="text-xs font-black uppercase text-slate-500">Total Participants</div>
            <div className="text-3xl font-black text-[#D6536D] mt-1">{totalParticipantsCount}</div>
            <div className="text-[11px] font-bold text-slate-500 mt-1">Students Across India</div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="bg-white border-2 border-slate-300 p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto shadow-sm">
          {[
            { id: 'registrations', label: 'Registrations Review', icon: Users, badge: pendingCount > 0 ? `${pendingCount} Pending` : null },
            { id: 'attendance', label: 'Attendance Dashboard', icon: Activity },
            { id: 'events', label: 'Scan Events & Meals', icon: Calendar, badge: `${events.filter((e) => e.isActive).length} Active` },
            { id: 'scanners', label: 'Scanner Operators', icon: QrCode },
            { id: 'audit', label: 'Security Audit Logs', icon: ShieldCheck },
            { id: 'problem-statements', label: 'Problem Statements & Timer', icon: FileText, badge: `${problemStatements.length} PS` },
            { id: 'results', label: 'Results & Awards', icon: Trophy },
            { id: 'coordinators', label: 'Coordinators Manager', icon: GraduationCap },
            { id: 'cms', label: 'Landing Page CMS', icon: Edit3 },
            { id: 'email-logs', label: 'Email Delivery Logs', icon: Mail, badge: emailLogs.length > 0 ? `${emailLogs.length} Logs` : null },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2.5 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#E43D12] text-white shadow-md shadow-[#E43D12]/20 scale-[1.02]'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#E43D12]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isActive ? 'bg-white text-[#E43D12]' : 'bg-slate-300 text-slate-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: REGISTRATION REVIEW & APPROVAL/REJECTION */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            <div className="card-3d p-6 rounded-3xl bg-white border-slate-200 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#E43D12] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search by team name, ID, leader..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-black bg-white text-black placeholder-slate-500 focus:border-[#E43D12]"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                  <span className="text-xs font-black uppercase text-black flex items-center gap-1">
                    <Filter className="w-4 h-4 text-[#E43D12]" /> Status Filter:
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border-2 border-slate-300 text-xs font-black bg-white text-black focus:border-[#E43D12]"
                  >
                    <option value="ALL">All Statuses ({teams.length})</option>
                    <option value="PENDING">Pending Review ({pendingCount})</option>
                    <option value="APPROVED">Approved ({approvedCount})</option>
                    <option value="REJECTED">Rejected ({rejectedCount})</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <a
                      href="/api/admin/export/passes?type=ALL"
                      target="_blank"
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-transform hover:scale-[1.02]"
                      title="Download ZIP with all QR codes & Barcodes"
                    >
                      <Archive className="w-3.5 h-3.5" /> Zip All Passes
                    </a>
                    <a
                      href="/api/admin/export/passes?type=QR"
                      target="_blank"
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-transform hover:scale-[1.02]"
                      title="Download ZIP with all team QR codes"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Zip QRs
                    </a>
                  </div>
                </div>
              </div>

              {/* Registrations Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 font-black uppercase text-black">
                      <th className="p-3.5">Assigned ID / Team</th>
                      <th className="p-3.5">Leader Contact</th>
                      <th className="p-3.5">Members</th>
                      <th className="p-3.5">Transaction UTR</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-semibold text-black">
                    {filteredTeams.length > 0 ? (
                      filteredTeams.map((team) => (
                        <tr key={team.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <div className="font-black text-black text-sm flex items-center gap-2">
                              {team.teamId ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs">
                                  {team.teamId}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                                  PENDING
                                </span>
                              )}
                              <span>{team.teamName}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-extrabold text-black">
                            <p>{team.leader?.name || 'N/A'}</p>
                            <p className="text-slate-600 font-semibold text-[11px]">{team.leader?.email}</p>
                          </td>
                          <td className="p-3.5 font-bold text-black">
                            {team.members?.length || team.teamSize} Members
                          </td>
                          <td className="p-3.5 font-mono text-[#E43D12] font-black">
                            {team.transactionUtor}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase ${
                                team.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : team.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {team.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setSelectedTeamModal(team)}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-black font-black text-xs transition shadow-xs cursor-pointer"
                            >
                              Review & Verification
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                          No registered teams found matching filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTENDANCE DASHBOARD (NEW) */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl card-3d bg-white border-slate-200 shadow-sm">
                <div className="text-xs font-black uppercase text-slate-500">Registered Teams</div>
                <div className="text-3xl font-black text-slate-900 mt-1">{attendanceData?.summary?.totalTeams || 0}</div>
                <div className="text-[11px] font-bold text-emerald-700 mt-1">{attendanceData?.summary?.approvedTeams || 0} Approved</div>
              </div>
              <div className="p-5 rounded-2xl card-3d bg-white border-slate-200 shadow-sm">
                <div className="text-xs font-black uppercase text-slate-500">Registered Members</div>
                <div className="text-3xl font-black text-slate-900 mt-1">{attendanceData?.summary?.totalMembers || 0}</div>
                <div className="text-[11px] font-bold text-slate-600 mt-1">Participants</div>
              </div>
              <div className="p-5 rounded-2xl card-3d bg-white border-slate-200 shadow-sm">
                <div className="text-xs font-black uppercase text-slate-500">Checked-In Members</div>
                <div className="text-3xl font-black text-emerald-600 mt-1">{attendanceData?.summary?.checkedInMembers || 0}</div>
                <div className="text-[11px] font-bold text-emerald-700 mt-1">Present at Event</div>
              </div>
              <div className="p-5 rounded-2xl card-3d bg-white border-slate-200 shadow-sm">
                <div className="text-xs font-black uppercase text-slate-500">Absent Members</div>
                <div className="text-3xl font-black text-amber-600 mt-1">{attendanceData?.summary?.absentMembersCount || 0}</div>
                <div className="text-[11px] font-bold text-amber-700 mt-1">Pending Gate Scan</div>
              </div>
            </div>

            <div className="card-3d p-6 rounded-3xl bg-white border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <h3 className="text-lg font-black text-black flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#E43D12]" /> Live Gate Attendance Log
                </h3>
                <a
                  href="/api/admin/export/attendance"
                  target="_blank"
                  className="px-4 py-2 rounded-xl btn-3d-primary font-black text-xs text-white shadow-sm flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-white" /> Download Excel/CSV
                </a>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 font-black uppercase text-black">
                      <th className="p-3">Event</th>
                      <th className="p-3">Team ID / Name</th>
                      <th className="p-3">Member Name</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Scanner Operator</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-semibold text-black">
                    {attendanceData?.records && attendanceData.records.length > 0 ? (
                      attendanceData.records.map((rec: any) => (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="p-3 font-extrabold text-[#E43D12]">{rec.event?.name || 'Scan Event'}</td>
                          <td className="p-3 font-bold">
                            <span className="text-[#E43D12] font-black">{rec.team?.teamId || 'GL-01'}</span> - {rec.team?.teamName}
                          </td>
                          <td className="p-3 font-bold">{rec.member?.name}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                                rec.status === 'PRESENT'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 font-medium">{rec.scanner?.name || 'Gate Operator'}</td>
                          <td className="p-3 font-mono text-slate-600">{new Date(rec.scannedAt).toLocaleString()}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setManualCorrectionModal({
                                  eventId: rec.eventId,
                                  teamId: rec.teamId,
                                  memberId: rec.memberId,
                                  memberName: rec.member?.name,
                                  currentStatus: rec.status,
                                });
                                setManualStatusInput(rec.status === 'PRESENT' ? 'ABSENT' : 'PRESENT');
                              }}
                              className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-black font-extrabold text-xs cursor-pointer"
                            >
                              Manual Override
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                          No attendance records captured yet. Use the Attendance Scanner Portal to record team check-ins.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SCAN EVENTS & MEALS (NEW) */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200">
              <h2 className="text-xl font-black text-black">Scan Events & Meal Schedule Configuration</h2>
              <button
                onClick={() => setNewEventModal(true)}
                className="px-4 py-2.5 rounded-xl btn-3d-primary font-black text-xs text-white shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create New Scan Event
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((evt) => (
                <div key={evt.id} className="card-3d p-6 rounded-3xl bg-white border-2 border-slate-300 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 text-[10px] font-black uppercase">
                      {evt.type}
                    </span>
                    <button
                      onClick={() => handleToggleEventActive(evt.id, evt.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-black cursor-pointer ${
                        evt.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {evt.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </div>

                  <h3 className="text-base font-black text-black">{evt.name}</h3>
                  <p className="text-xs text-slate-600 font-semibold">{evt.description || 'Event description'}</p>

                  <div className="pt-3 border-t border-slate-200 text-xs font-mono font-bold text-slate-700 space-y-1">
                    <p>Start: {new Date(evt.startDate).toLocaleString()}</p>
                    <p>End: {new Date(evt.endDate).toLocaleString()}</p>
                    <p className="text-[#E43D12] mt-1 font-black">
                      Duplicates: {evt.allowDuplicate ? 'ALLOWED' : 'BLOCKED'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SCANNER OPERATORS (NEW) */}
        {activeTab === 'scanners' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200">
              <h2 className="text-xl font-black text-black">Attendance Scanner Operators</h2>
              <button
                onClick={() => setNewScannerModal(true)}
                className="px-4 py-2.5 rounded-xl btn-3d-primary font-black text-xs text-white shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Scanner Operator Account
              </button>
            </div>

            <div className="card-3d p-6 rounded-3xl bg-white border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-black uppercase text-black">
                    <th className="p-3.5">Operator Name</th>
                    <th className="p-3.5">Email Login</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-semibold text-black">
                  {scanners.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-black text-black text-sm">{s.name}</td>
                      <td className="p-3.5 font-mono text-[#E43D12] font-extrabold">{s.email}</td>
                      <td className="p-3.5 font-mono text-slate-600">{s.phone || 'N/A'}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase ${
                            s.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {s.isActive ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggleScannerActive(s.id, s.isActive)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-black font-extrabold text-xs cursor-pointer shadow-xs"
                        >
                          {s.isActive ? 'Disable Account' : 'Enable Account'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY AUDIT LOGS (NEW) */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-black border-b pb-4 border-slate-200">Security Audit Trail Log</h2>

            <div className="card-3d p-6 rounded-3xl bg-white border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-black uppercase text-black">
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-black">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3.5 text-slate-600">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="p-3.5 text-[#E43D12] font-black">{log.userEmail || log.userId || 'System'}</td>
                      <td className="p-3.5 font-black text-emerald-800">{log.action}</td>
                      <td className="p-3.5 text-slate-800 font-semibold">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: PROBLEM STATEMENTS & SELECTION TIMER */}
        {activeTab === 'problem-statements' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Active Selection Window Timer Controller */}
              <div className="card-3d p-6 rounded-3xl bg-white border-2 border-[#E43D12]/30 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-slate-200">
                  <div>
                    <span className="text-xs font-black uppercase text-[#E43D12] tracking-wider block">
                      Live PS Selection Lock Status
                    </span>
                    <h3 className="text-xl font-black text-black">
                      {selectionWindow?.isOpen ? '🟢 SELECTION WINDOW ACTIVE' : '🔴 SELECTION WINDOW LOCKED'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectionWindow?.isOpen ? (
                      <button
                        onClick={() => handleToggleTimerWindow(false)}
                        className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-black text-xs shadow-md hover:bg-red-700 flex items-center gap-2 cursor-pointer"
                      >
                        <Lock className="w-4 h-4" /> Immediately Lock Window
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleTimerWindow(true)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-md hover:bg-emerald-700 flex items-center gap-2 cursor-pointer"
                      >
                        <Unlock className="w-4 h-4" /> Open Window ({timerMinutes} Mins)
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-black text-black">
                  <span>Window Timer Duration:</span>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 30)}
                    className="w-20 px-3 py-1.5 rounded-xl border-2 border-slate-300 text-black text-xs font-black text-center"
                  />
                  <span className="text-slate-500">Minutes</span>
                </div>
              </div>

              {/* Problem Statements List */}
              <div className="card-3d p-6 rounded-3xl bg-white border-slate-200 space-y-4 shadow-sm">
                <h3 className="font-black text-black text-lg border-b pb-3 border-slate-200">
                  Published Problem Statements ({problemStatements.length})
                </h3>

                <div className="space-y-4">
                  {problemStatements.map((ps) => (
                    <div key={ps.id} className="p-5 rounded-2xl bg-white border-2 border-slate-300 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 font-black text-xs">
                          {ps.psNumber}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingPsModal(ps)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePs(ps.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-black text-black text-base">{ps.title}</h4>
                      <p className="text-xs text-black font-extrabold">{ps.description}</p>
                      <a href={ps.driveLink} target="_blank" className="text-xs font-black text-[#E43D12] hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> View Drive Resource Folder
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Create Problem Statement Form */}
            <form onSubmit={handleCreatePs} className="card-3d p-6 rounded-3xl bg-white border-slate-200 space-y-4 shadow-sm">
              <h3 className="font-black text-black text-base border-b pb-2 border-slate-200">
                Add Problem Statement
              </h3>

              <div>
                <label className="block text-xs font-black text-black mb-1">PS Number (e.g. PS-04)</label>
                <input
                  type="text"
                  required
                  placeholder="PS-04"
                  value={newPs.psNumber}
                  onChange={(e) => setNewPs({ ...newPs, psNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Software & AI"
                  value={newPs.category}
                  onChange={(e) => setNewPs({ ...newPs, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Title of problem..."
                  value={newPs.title}
                  onChange={(e) => setNewPs({ ...newPs, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detailed description..."
                  value={newPs.description}
                  onChange={(e) => setNewPs({ ...newPs, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Google Drive Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  value={newPs.driveLink}
                  onChange={(e) => setNewPs({ ...newPs, driveLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl btn-3d-primary text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                Publish Problem Statement
              </button>
            </form>
          </div>
        )}

        {/* TAB 7: RESULT PUBLISHING & PRIZES */}
        {activeTab === 'results' && (
          <div className="card-3d p-6 sm:p-10 rounded-3xl bg-white border-slate-200 space-y-6 shadow-sm">
            <h3 className="text-xl font-black text-black border-b pb-3 border-slate-200 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#EFB11D]" /> Result Management & Announcements
            </h3>

            <p className="text-xs text-black font-extrabold">
              Assign result prize tiers (First Prize, Second Prize, Third Prize, Participated) to approved hackathon teams.
            </p>

            <div className="p-6 rounded-2xl bg-white border-2 border-slate-300 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="text-xs font-black uppercase text-black">Assign Prize Tier:</span>
                <select
                  value={assignResultTier}
                  onChange={(e) => setAssignResultTier(e.target.value)}
                  className="px-4 py-2 rounded-xl border-2 border-slate-300 text-xs font-black bg-white text-black"
                >
                  <option value="FIRST_PRIZE">🏆 1st Prize (Grand Champion)</option>
                  <option value="SECOND_PRIZE">🥇 2nd Prize (Runner Up)</option>
                  <option value="THIRD_PRIZE">🥈 3rd Prize (Second Runner Up)</option>
                  <option value="PARTICIPATED">📜 Participated Certificate</option>
                </select>
                <button
                  onClick={async () => {
                    if (selectedTeamResultIds.length === 0) return alert('Select at least one team');
                    await fetch('/api/admin/results', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ teamDbIds: selectedTeamResultIds, result: assignResultTier }),
                    });
                    setMessage('Results updated successfully!');
                    fetchAdminData();
                  }}
                  className="px-5 py-2 rounded-xl btn-3d-primary text-white font-extrabold text-xs shadow-md cursor-pointer"
                >
                  Publish Result to Selected Teams
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {teams.filter((t) => t.status === 'APPROVED').map((t) => (
                  <label key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 text-xs font-black text-black cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selectedTeamResultIds.includes(t.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTeamResultIds([...selectedTeamResultIds, t.id]);
                        else setSelectedTeamResultIds(selectedTeamResultIds.filter((i) => i !== t.id));
                      }}
                    />
                    <span>
                      <strong className="text-[#E43D12]">{t.teamId}</strong> - {t.teamName} (Result: {t.result || 'NONE'})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: COORDINATORS MANAGER */}
        {activeTab === 'coordinators' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card-3d p-6 rounded-3xl bg-white border-slate-200 space-y-4 shadow-sm">
                <h3 className="font-black text-slate-900 text-lg border-b pb-3 border-slate-200">
                  Active Event Coordinators ({coordinators.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coordinators.map((c) => (
                    <div key={c.id} className="p-4 rounded-2xl bg-white border-2 border-slate-300 flex items-center justify-between shadow-xs">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white text-[#E43D12] border border-slate-300 shadow-xs">
                          {c.type}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{c.name}</h4>
                        <p className="text-xs text-[#E43D12] font-semibold">{c.designation || c.role}</p>
                        <p className="text-[11px] text-slate-600 font-medium">{c.department}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCoordinator(c.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Coordinator Form */}
            <form onSubmit={handleAddCoordinator} className="card-3d p-6 rounded-3xl bg-white border-slate-200 space-y-4 shadow-sm">
              <h3 className="font-black text-black text-base border-b pb-2 border-slate-200">
                Add New Coordinator
              </h3>

              <div>
                <label className="block text-xs font-black text-black mb-1">Coordinator Type</label>
                <select
                  value={newCoord.type}
                  onChange={(e) => setNewCoord({ ...newCoord, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                >
                  <option value="FACULTY">Faculty Coordinator</option>
                  <option value="STUDENT">Student Coordinator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. / Mr. / Ms."
                  value={newCoord.name}
                  onChange={(e) => setNewCoord({ ...newCoord, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">
                  {newCoord.type === 'FACULTY' ? 'Designation' : 'Role Title'}
                </label>
                <input
                  type="text"
                  placeholder={newCoord.type === 'FACULTY' ? 'Professor & HOD' : 'Student Lead'}
                  value={newCoord.type === 'FACULTY' ? newCoord.designation : newCoord.role}
                  onChange={(e) =>
                    newCoord.type === 'FACULTY'
                      ? setNewCoord({ ...newCoord, designation: e.target.value })
                      : setNewCoord({ ...newCoord, role: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Department</label>
                <input
                  type="text"
                  required
                  placeholder="Computer Science Engineering"
                  value={newCoord.department}
                  onChange={(e) => setNewCoord({ ...newCoord, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newCoord.phone}
                  onChange={(e) => setNewCoord({ ...newCoord, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Profile Photo Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://... or /images/..."
                  value={newCoord.photoUrl || ''}
                  onChange={(e) => setNewCoord({ ...newCoord, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl btn-3d-primary text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                Add Coordinator
              </button>
            </form>
          </div>
        )}

        {/* TAB 9: LANDING PAGE CMS */}
        {activeTab === 'cms' && (
          <form onSubmit={handleSaveCms} className="card-3d p-6 sm:p-10 rounded-3xl bg-white border-slate-200 space-y-6 shadow-sm text-black">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 border-slate-200 gap-4">
              <div>
                <h3 className="text-xl font-black text-black">Landing Page CMS Content Editor</h3>
                <p className="text-xs text-black font-extrabold">Update website headlines, Bank UPI payment info, eligibility rules, and event agenda schedules.</p>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'hero', label: 'Hero Banner' },
                  { id: 'prizes', label: 'Prizes & Rewards' },
                  { id: 'payment', label: 'Bank & Payment' },
                  { id: 'rules', label: 'Rules & Guidelines' },
                  { id: 'agenda', label: 'Agenda & Timeline' },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setCmsSubTab(sub.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      cmsSubTab === sub.id ? 'bg-[#E43D12] text-white shadow-xs' : 'text-slate-700 hover:text-black'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SUB-TAB 1: HERO & EVENT DETAILS */}
            {cmsSubTab === 'hero' && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <div>
                  <label className="block text-xs font-black text-black mb-1">Hero Main Headline</label>
                  <input
                    type="text"
                    value={cmsContent.heroHeadline || ''}
                    onChange={(e) => setCmsContent({ ...cmsContent, heroHeadline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black mb-1">Hero Subtitle</label>
                  <textarea
                    rows={2}
                    value={cmsContent.heroSubtitle || ''}
                    onChange={(e) => setCmsContent({ ...cmsContent, heroSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                  />
                </div>

                {/* User-Friendly Interactive Date & Time Picker Controls */}
                <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-[#E43D12]" /> Interactive Event Schedule & Time Picker
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                      User-Friendly Controls
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Event Start & End Date Pickers */}
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <label className="block text-[11px] font-black text-black uppercase tracking-wider">
                        📅 Select Event Start & End Dates
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-600 block mb-1">Start Date</span>
                          <input
                            type="date"
                            value={pickerStartDate}
                            onChange={(e) => {
                              const newStart = e.target.value;
                              setPickerStartDate(newStart);
                              const formatted = formatEventDateRange(newStart, pickerEndDate);
                              setCmsContent({ ...cmsContent, eventDate: formatted });
                            }}
                            className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-xs font-bold text-black focus:border-[#E43D12] bg-white cursor-pointer"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-600 block mb-1">End Date</span>
                          <input
                            type="date"
                            value={pickerEndDate}
                            onChange={(e) => {
                              const newEnd = e.target.value;
                              setPickerEndDate(newEnd);
                              const formatted = formatEventDateRange(pickerStartDate, newEnd);
                              setCmsContent({ ...cmsContent, eventDate: formatted });
                            }}
                            className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-xs font-bold text-black focus:border-[#E43D12] bg-white cursor-pointer"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Custom Display Override (Event Dates)</label>
                        <input
                          type="text"
                          value={cmsContent.eventDate || ''}
                          onChange={(e) => setCmsContent({ ...cmsContent, eventDate: e.target.value })}
                          placeholder="e.g. OCTOBER 24-25, 2026"
                          className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-xs font-extrabold text-black focus:border-[#E43D12] bg-white"
                        />
                      </div>
                    </div>

                    {/* Event Start Time Picker & Suffix */}
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <label className="block text-[11px] font-black text-black uppercase tracking-wider">
                        ⏰ Select Event Start Time
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-600 block mb-1">Start Time</span>
                          <input
                            type="time"
                            value={pickerTime}
                            onChange={(e) => {
                              const newTime = e.target.value;
                              setPickerTime(newTime);
                              const formatted = formatEventTime(newTime, pickerTimeSuffix);
                              setCmsContent({ ...cmsContent, eventTime: formatted });
                            }}
                            className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-xs font-bold text-black focus:border-[#E43D12] bg-white cursor-pointer"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-600 block mb-1">Time Label / Suffix</span>
                          <input
                            type="text"
                            value={pickerTimeSuffix}
                            onChange={(e) => {
                              const newSuffix = e.target.value;
                              setPickerTimeSuffix(newSuffix);
                              const formatted = formatEventTime(pickerTime, newSuffix);
                              setCmsContent({ ...cmsContent, eventTime: formatted });
                            }}
                            placeholder="IST (24 Hours Live Code)"
                            className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-xs font-bold text-black focus:border-[#E43D12] bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Custom Display Override (Event Time)</label>
                        <input
                          type="text"
                          value={cmsContent.eventTime || ''}
                          onChange={(e) => setCmsContent({ ...cmsContent, eventTime: e.target.value })}
                          placeholder="e.g. 08:30 AM IST (24 Hours Live Code)"
                          className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-xs font-extrabold text-black focus:border-[#E43D12] bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Website Display Preview Card */}
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span className="font-extrabold text-amber-950">Live Landing Page Preview:</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-md bg-white border border-amber-300 font-mono font-black text-[#E43D12]">
                        📅 {cmsContent.eventDate || 'OCTOBER 24-25, 2026'}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-white border border-amber-300 font-mono font-black text-[#E43D12]">
                        ⏰ {cmsContent.eventTime || '08:30 AM IST'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-black mb-1">Venue Location</label>
                  <input
                    type="text"
                    value={cmsContent.venue || ''}
                    onChange={(e) => setCmsContent({ ...cmsContent, venue: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                  />
                </div>
              </div>
            )}

            {/* SUB-TAB 2: PRIZE POOL & REWARDS */}
            {cmsSubTab === 'prizes' && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                  💡 <strong>Note:</strong> Updates made here directly change the cash prize numbers displayed in the Prize Pool section and Hero banner on the public Landing Page.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-black mb-1">Grand Total Prize Pool Amount</label>
                    <input
                      type="text"
                      placeholder="₹1,50,000+"
                      value={cmsContent.totalPrizePool || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, totalPrizePool: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-black focus:border-[#E43D12]"
                    />
                    <p className="text-[10px] text-slate-500 font-bold mt-1">Shows in Hero banner & Prize section header.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-black mb-1">1st Prize Amount (Grand Champion)</label>
                    <input
                      type="text"
                      placeholder="₹75,000"
                      value={cmsContent.firstPrize || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, firstPrize: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-black text-[#E43D12] focus:border-[#E43D12]"
                    />
                    <p className="text-[10px] text-slate-500 font-bold mt-1">Shows on 1st Prize card.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-black mb-1">2nd Prize Amount (Runner Up)</label>
                    <input
                      type="text"
                      placeholder="₹40,000"
                      value={cmsContent.secondPrize || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, secondPrize: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-black focus:border-[#E43D12]"
                    />
                    <p className="text-[10px] text-slate-500 font-bold mt-1">Shows on 2nd Prize card.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-black mb-1">3rd Prize Amount (Second Runner Up)</label>
                    <input
                      type="text"
                      placeholder="₹25,000"
                      value={cmsContent.thirdPrize || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, thirdPrize: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-black focus:border-[#E43D12]"
                    />
                    <p className="text-[10px] text-slate-500 font-bold mt-1">Shows on 3rd Prize card.</p>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: BANK & PAYMENT INFO */}
            {cmsSubTab === 'payment' && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-black mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={cmsContent.bankName || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, bankName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-black mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={cmsContent.bankAccountName || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, bankAccountName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-black mb-1">Account Number</label>
                    <input
                      type="text"
                      value={cmsContent.bankAccountNumber || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, bankAccountNumber: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-mono font-extrabold focus:border-[#E43D12]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-black mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={cmsContent.bankIfsc || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, bankIfsc: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-mono font-extrabold focus:border-[#E43D12]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-black mb-1">UPI ID</label>
                    <input
                      type="text"
                      value={cmsContent.upiId || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, upiId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-mono font-extrabold focus:border-[#E43D12]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-black mb-1">Payment QR Code Image</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="https://... or upload image"
                      value={cmsContent.qrCodeUrl || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, qrCodeUrl: e.target.value })}
                      className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-mono font-extrabold focus:border-[#E43D12]"
                    />
                    <label className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black font-black text-xs cursor-pointer border-2 border-slate-300 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[#E43D12]" />
                      <span>{uploadingQr ? 'Uploading...' : 'Upload File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingQr(true);
                          try {
                            const publicUrl = await uploadQrCodeImage(file);
                            if (publicUrl) setCmsContent({ ...cmsContent, qrCodeUrl: publicUrl });
                          } catch (err: any) {
                            alert(err.message);
                          } finally {
                            setUploadingQr(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: RULES & GUIDELINES */}
            {cmsSubTab === 'rules' && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <div>
                  <label className="block text-xs font-black text-black mb-1">
                    Team Eligibility Rules (Enter one rule per line)
                  </label>
                  <textarea
                    rows={5}
                    value={cmsContent.rulesEligibility || ''}
                    onChange={(e) => setCmsContent({ ...cmsContent, rulesEligibility: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-mono font-extrabold focus:border-[#E43D12]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black mb-1">
                    Hackathon Conduct & Submission Rules (Enter one rule per line)
                  </label>
                  <textarea
                    rows={5}
                    value={cmsContent.rulesConduct || ''}
                    onChange={(e) => setCmsContent({ ...cmsContent, rulesConduct: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-mono font-extrabold focus:border-[#E43D12]"
                  />
                </div>
              </div>
            )}

            {/* SUB-TAB 4: AGENDA & TIMELINE */}
            {cmsSubTab === 'agenda' && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <div>
                  <label className="block text-xs font-black text-black mb-1">
                    Day 1 Agenda Items (Format per line: Time | Event Title | Description)
                  </label>
                  <textarea
                    rows={6}
                    value={cmsContent.agendaDay1 || ''}
                    onChange={(e) => setCmsContent({ ...cmsContent, agendaDay1: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-mono font-extrabold focus:border-[#E43D12]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black mb-1">
                    Day 2 Agenda Items (Format per line: Time | Event Title | Description)
                  </label>
                  <textarea
                    rows={6}
                    value={cmsContent.agendaDay2 || ''}
                    onChange={(e) => setCmsContent({ ...cmsContent, agendaDay2: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-mono font-extrabold focus:border-[#E43D12]"
                  />
                </div>
              </div>
            )}

            <div className="border-t pt-4 border-slate-200 flex items-center gap-4 flex-wrap">
              <button
                type="submit"
                disabled={savingCms}
                className={`px-6 py-3 rounded-xl font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all ${
                  cmsSuccessSaved
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'btn-3d-primary text-white'
                }`}
              >
                {savingCms ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-white animate-spin" /> Saving Changes...
                  </>
                ) : cmsSuccessSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" /> Saved All CMS Changes! ✓
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" /> Save All CMS Changes
                  </>
                )}
              </button>

              {cmsSuccessSaved && (
                <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Landing Page CMS settings updated & published live!</span>
                </div>
              )}
            </div>
          </form>
        )}

        {/* TAB 10: EMAIL DELIVERY LOGS */}
        {activeTab === 'email-logs' && (
          <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200">
              <div>
                <h3 className="text-xl font-black text-black flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#E43D12]" /> Email Delivery Audit Logs
                </h3>
                <p className="text-xs text-black font-extrabold mt-1">
                  Real-time live audit of all welcome emails, team registrations, admin approvals, and password reset dispatches.
                </p>
              </div>
              <button
                onClick={fetchAdminData}
                className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-black text-black hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Email Logs
              </button>
            </div>

            {emailLogs.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
                <Mail className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-black text-black">No email delivery logs recorded yet.</p>
                <p className="text-[11px] text-black font-bold mt-1">
                  Emails sent during signup, team registration, admin approval, and password reset will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                <table className="w-full text-left text-xs font-bold border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-black uppercase tracking-wider text-[10px]">
                      <th className="p-3.5 border-b">Recipient Email</th>
                      <th className="p-3.5 border-b">Email Subject</th>
                      <th className="p-3.5 border-b">Delivery Status</th>
                      <th className="p-3.5 border-b">Dispatch Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-black">
                    {emailLogs.map((log: any, idx: number) => (
                      <tr key={log.id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-mono text-black font-black">{log.recipient}</td>
                        <td className="p-3.5 font-extrabold text-black">{log.subject}</td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              log.status?.includes('SENT')
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            {log.status?.includes('SENT') ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-red-600" />
                            )}
                            {log.status}
                          </span>
                          {log.error && (
                            <div className="text-[10px] text-red-600 font-bold mt-1 max-w-xs truncate">
                              {log.error}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 text-black font-mono text-[11px] font-bold">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* REVIEW REGISTRATION MODAL WITH PAYMENT PROOF SCREENSHOT & QR PASS CARD */}
        {selectedTeamModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border-2 border-slate-300 max-w-2xl w-full rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-black">
              <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                <div>
                  <span className="text-xs font-mono font-bold text-[#E43D12]">
                    {selectedTeamModal.teamId || 'Pending Approval'}
                  </span>
                  <h3 className="text-xl font-black text-black">{selectedTeamModal.teamName}</h3>
                </div>
                <button onClick={() => setSelectedTeamModal(null)} className="p-2 text-slate-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {modalError && (
                  <div className="p-3 rounded-xl bg-red-50 border-2 border-red-300 text-xs font-black text-red-700 flex items-center justify-between shadow-xs">
                    <span>⚠️ {modalError}</span>
                    <button type="button" onClick={() => setModalError('')}><X className="w-4 h-4" /></button>
                  </div>
                )}
                {modalSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-xs font-black text-emerald-800 flex items-center justify-between shadow-xs">
                    <span>✅ {modalSuccess}</span>
                    <button type="button" onClick={() => setModalSuccess('')}><X className="w-4 h-4" /></button>
                  </div>
                )}

                {/* Official QR & Barcode Card for Approved Teams */}
                {selectedTeamModal.status === 'APPROVED' && selectedTeamModal.qrCodeUrl && (
                  <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-3">
                    <span className="text-xs font-black uppercase text-emerald-900 tracking-wider block">
                      Official Generated Team Pass (QR & Barcode)
                    </span>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-white p-4 rounded-xl border border-emerald-200">
                      <div className="text-center space-y-1">
                        <img src={selectedTeamModal.qrCodeUrl} alt="QR Pass" className="w-32 h-32 rounded-lg border border-slate-200 p-1 mx-auto bg-white" />
                        <span className="text-[10px] font-mono font-bold text-slate-500 block">QR Code</span>
                      </div>
                      {selectedTeamModal.barcodeUrl && (
                        <div className="text-center space-y-1">
                          <img src={selectedTeamModal.barcodeUrl} alt="Barcode Pass" className="w-56 h-auto bg-white p-2 rounded-lg border border-slate-200 mx-auto" />
                          <span className="text-[10px] font-mono font-bold text-slate-500 block">Barcode</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                      {selectedTeamModal.qrCodeUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch(selectedTeamModal.qrCodeUrl);
                              const blob = await res.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${selectedTeamModal.teamId || 'Team'}_QR.png`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            } catch {
                              window.open(selectedTeamModal.qrCodeUrl, '_blank');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5 text-white" /> Download QR Code
                        </button>
                      )}
                      {selectedTeamModal.barcodeUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch(selectedTeamModal.barcodeUrl);
                              const blob = await res.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${selectedTeamModal.teamId || 'Team'}_Barcode.png`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            } catch {
                              window.open(selectedTeamModal.barcodeUrl, '_blank');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5 text-white" /> Download Barcode
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRegenerateQr(selectedTeamModal.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#E43D12]" /> Regenerate Pass
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResendEmail(selectedTeamModal.id)}
                        className="px-3 py-1.5 rounded-lg btn-3d-primary text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Mail className="w-3.5 h-3.5 text-white" /> Resend Email
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-black uppercase text-black mb-2">Team Members</h4>
                  <div className="space-y-2">
                    {selectedTeamModal.members?.map((m: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                        <div>
                          <p className="font-bold text-black">{m.name} {m.isLeader && '(Leader)'}</p>
                          <p className="text-slate-700 font-semibold">{m.department} • {m.year}</p>
                          <p className="text-[#E43D12] font-bold">{m.college}</p>
                        </div>
                        <div className="text-right text-black font-extrabold">
                          <p>{m.email}</p>
                          <p>{m.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-black uppercase text-black mb-1">Transaction UTR</h4>
                    <p className="font-mono font-bold text-[#E43D12] text-sm">{selectedTeamModal.transactionUtor}</p>
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-black mb-1">Payment Status</h4>
                    <p className="font-bold text-emerald-700 uppercase">{selectedTeamModal.status}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-black uppercase text-black mb-2">Uploaded Payment Proof Screenshot</h4>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={selectedTeamModal.paymentScreenshotUrl} alt="Receipt" className="w-full h-48 object-contain bg-slate-100" />
                  </div>
                </div>

                {/* Rejection Reason Textarea */}
                {selectedTeamModal.status === 'PENDING' && (
                  <div>
                    <label className="block font-black text-black mb-1">Rejection Reason (Required if rejecting):</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Invalid payment screenshot or UTR mismatch"
                      value={rejectionReasonInput}
                      onChange={(e) => setRejectionReasonInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                    />
                  </div>
                )}
              </div>

              {selectedTeamModal.status === 'PENDING' && (
                <div className="flex items-center justify-between border-t pt-4 border-slate-200">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleRejectTeam(selectedTeamModal.id)}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    {actionLoading ? 'Processing...' : 'Reject Registration'}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleApproveTeam(selectedTeamModal.id)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <span>Approving & Generating Pass...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Approve & Issue Team QR Pass</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CREATE SCANNER OPERATOR MODAL */}
        {newScannerModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleCreateScanner} className="bg-white border-2 border-slate-300 max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl text-black">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <h3 className="text-lg font-black text-black flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#E43D12]" /> Create Scanner Account
                </h3>
                <button type="button" onClick={() => setNewScannerModal(false)} className="p-2 text-slate-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Operator Name</label>
                <input
                  type="text"
                  required
                  placeholder="Main Gate Operator"
                  value={newScannerForm.name}
                  onChange={(e) => setNewScannerForm({ ...newScannerForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Email Login</label>
                <input
                  type="email"
                  required
                  placeholder="scanner1@glitch.com"
                  value={newScannerForm.email}
                  onChange={(e) => setNewScannerForm({ ...newScannerForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newScannerForm.password}
                  onChange={(e) => setNewScannerForm({ ...newScannerForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t pt-4 border-slate-200">
                <button
                  type="button"
                  onClick={() => setNewScannerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-black font-extrabold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl btn-3d-primary text-white font-extrabold text-xs shadow-md"
                >
                  Create Scanner Account
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CREATE SCAN EVENT MODAL */}
        {newEventModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleCreateEvent} className="bg-white border-2 border-slate-300 max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl text-black">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <h3 className="text-lg font-black text-black flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#E43D12]" /> Create Scan / Meal Event
                </h3>
                <button type="button" onClick={() => setNewEventModal(false)} className="p-2 text-slate-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  placeholder="Day 1 Lunch Sprint"
                  value={newEventForm.name}
                  onChange={(e) => setNewEventForm({ ...newEventForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Event Type</label>
                <select
                  value={newEventForm.type}
                  onChange={(e) => setNewEventForm({ ...newEventForm, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                >
                  <option value="CHECK_IN">CHECK_IN</option>
                  <option value="BREAKFAST">BREAKFAST</option>
                  <option value="LUNCH">LUNCH</option>
                  <option value="REFRESHMENT">REFRESHMENT</option>
                  <option value="CHECK_OUT">CHECK_OUT</option>
                  <option value="BREAK">BREAK</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-black mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEventForm.startDate}
                    onChange={(e) => setNewEventForm({ ...newEventForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-black mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEventForm.endDate}
                    onChange={(e) => setNewEventForm({ ...newEventForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-black text-black pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEventForm.isActive}
                    onChange={(e) => setNewEventForm({ ...newEventForm, isActive: e.target.checked })}
                  />
                  <span>Active Now</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEventForm.allowDuplicate}
                    onChange={(e) => setNewEventForm({ ...newEventForm, allowDuplicate: e.target.checked })}
                  />
                  <span>Allow Duplicates</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t pt-4 border-slate-200">
                <button
                  type="button"
                  onClick={() => setNewEventModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-black font-extrabold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl btn-3d-primary text-white font-extrabold text-xs shadow-md"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MANUAL ATTENDANCE CORRECTION MODAL */}
        {manualCorrectionModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border-2 border-slate-300 max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl text-black">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <h3 className="text-lg font-black text-black">Manual Attendance Correction</h3>
                <button onClick={() => setManualCorrectionModal(null)} className="p-2 text-slate-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <p className="font-extrabold text-black">
                  Updating status for member: <strong className="text-[#E43D12]">{manualCorrectionModal.memberName}</strong>
                </p>

                <div>
                  <label className="block text-xs font-black text-black mb-1">Status</label>
                  <select
                    value={manualStatusInput}
                    onChange={(e: any) => setManualStatusInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-black"
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="ABSENT">ABSENT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-black mb-1">Correction Audit Note</label>
                  <textarea
                    rows={2}
                    value={manualNoteInput}
                    onChange={(e) => setManualNoteInput(e.target.value)}
                    placeholder="Verified participant physically at venue counter."
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t pt-4 border-slate-200">
                  <button
                    onClick={() => setManualCorrectionModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-black font-extrabold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveManualAttendance}
                    className="px-6 py-2 rounded-xl btn-3d-primary text-white font-extrabold text-xs shadow-md"
                  >
                    Save Correction & Log Audit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT PROBLEM STATEMENT MODAL */}
        {editingPsModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleUpdatePs} className="bg-white border-2 border-slate-300 max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl text-black">
              <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                <h3 className="text-lg font-black text-black flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#E43D12]" /> Edit Problem Statement
                </h3>
                <button type="button" onClick={() => setEditingPsModal(null)} className="p-2 text-slate-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">PS Number (e.g. PS-01)</label>
                <input
                  type="text"
                  required
                  value={editingPsModal.psNumber || ''}
                  onChange={(e) => setEditingPsModal({ ...editingPsModal, psNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Artificial Intelligence, Web Dev, etc."
                  value={editingPsModal.category || ''}
                  onChange={(e) => setEditingPsModal({ ...editingPsModal, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingPsModal.title || ''}
                  onChange={(e) => setEditingPsModal({ ...editingPsModal, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={editingPsModal.description || ''}
                  onChange={(e) => setEditingPsModal({ ...editingPsModal, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Google Drive Resource Link</label>
                <input
                  type="url"
                  required
                  value={editingPsModal.driveLink || ''}
                  onChange={(e) => setEditingPsModal({ ...editingPsModal, driveLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold focus:border-[#E43D12]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t pt-4 border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPsModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-black font-extrabold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl btn-3d-primary text-white font-extrabold text-xs shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-white" /> Save & Update PS
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
