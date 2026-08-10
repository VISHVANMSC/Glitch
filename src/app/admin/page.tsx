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
  Sparkles,
  CreditCard,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import { uploadQrCodeImage } from '@/lib/supabase';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Active Tab: 'registrations' | 'cms' | 'coordinators' | 'problem-statements' | 'results'
  const [activeTab, setActiveTab] = useState('registrations');

  // Registrations & Search/Filter
  const [teams, setTeams] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTeamModal, setSelectedTeamModal] = useState<any>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // CMS Form State
  const [cmsContent, setCmsContent] = useState<Record<string, string>>({});
  const [savingCms, setSavingCms] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [cmsSubTab, setCmsSubTab] = useState<'hero' | 'payment' | 'rules' | 'agenda'>('hero');

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
    } catch (err) {
      console.error(err);
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
    try {
      const res = await fetch('/api/admin/registrations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamDbId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approval failed');
      setMessage(data.message);
      setSelectedTeamModal(null);
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handler: Reject Team
  const handleRejectTeam = async (teamDbId: string) => {
    if (!rejectionReasonInput.trim()) {
      setError('Please enter a valid rejection reason.');
      return;
    }
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/registrations/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamDbId, rejectionReason: rejectionReasonInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rejection failed');
      setMessage(data.message);
      setSelectedTeamModal(null);
      setRejectionReasonInput('');
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handler: Save CMS
  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCms(true);
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
      setMessage('Landing Page CMS settings updated successfully.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingCms(false);
    }
  };

  // Handler: Add Coordinator
  const handleAddCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coordinators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoord),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCoordinators([...coordinators, data.coordinator]);
      setNewCoord({ type: 'FACULTY', name: '', designation: '', role: '', department: '', phone: '', email: '', photoUrl: '' });
      setMessage('Coordinator added successfully.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handler: Delete Coordinator
  const handleDeleteCoordinator = async (id: string) => {
    try {
      await fetch(`/api/admin/coordinators?id=${id}`, { method: 'DELETE' });
      setCoordinators(coordinators.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handler: Add Problem Statement
  const handleAddPs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/problem-statements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPs),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProblemStatements([...problemStatements, data.problemStatement]);
      setNewPs({ psNumber: '', title: '', description: '', category: 'Software & AI', driveLink: '' });
      setMessage('Problem statement published.');
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
      if (!res.ok) throw new Error(data.error);
      setProblemStatements(
        problemStatements.map((p) => (p.id === editingPsModal.id ? data.problemStatement : p))
      );
      setEditingPsModal(null);
      setMessage('Problem statement updated successfully.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handler: Delete Problem Statement
  const handleDeletePs = async (id: string) => {
    if (!confirm('Are you sure you want to delete this problem statement?')) return;
    try {
      const res = await fetch(`/api/admin/problem-statements?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProblemStatements(problemStatements.filter((p) => p.id !== id));
      setMessage('Problem statement deleted successfully.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handler: Toggle Selection Window Timer
  const handleToggleWindow = async (isOpen: boolean) => {
    try {
      const res = await fetch('/api/admin/problem-statements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_window',
          isOpen,
          durationMinutes: timerMinutes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelectionWindow(data.window);
      setMessage(`Selection window ${isOpen ? 'OPENED' : 'CLOSED'}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#E43D12] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-black uppercase tracking-widest text-[#E43D12]">Loading Admin Command Center...</p>
        </div>
      </div>
    );
  }

  const totalTeamsCount = teams.length;
  const pendingCount = teams.filter((t) => t.status === 'PENDING').length;
  const approvedCount = teams.filter((t) => t.status === 'APPROVED').length;
  const rejectedCount = teams.filter((t) => t.status === 'REJECTED').length;
  const totalParticipantsCount = teams.reduce((acc, t) => acc + (t.members?.length || t.teamSize || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 bg-cyber-grid">
      <Navbar user={adminUser} />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header Title & Dual Export Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-6 border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#E43D12] via-[#D6536D] to-[#EFB11D] p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                <img src="/images/mascot_3d.png" alt="Glitchy" className="w-10 h-10 object-contain" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 text-xs font-black uppercase tracking-widest mb-1">
                <ShieldCheck className="w-4 h-4 text-[#E43D12]" /> Admin Command Center
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                GLITCH - 1.0 Hackathon Management
              </h1>
              <p className="text-xs text-slate-600 font-semibold">
                Review team registrations, manage problem statement selection timers, edit CMS, and publish results.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/api/admin/export?type=registrations"
              target="_blank"
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-extrabold text-xs flex items-center gap-2 hover:bg-slate-50 hover:border-[#E43D12] hover:text-[#E43D12] transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-[#E43D12]" /> Registrations CSV
            </a>
            <a
              href="/api/admin/export?type=participants"
              target="_blank"
              className="px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-extrabold text-xs flex items-center gap-2 hover:bg-amber-100 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-amber-600" /> Overall Participants CSV
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

        {/* Re-Organized Modern Tab Navigation */}
        <div className="bg-slate-200/80 border border-slate-300 p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto shadow-inner">
          {[
            { id: 'registrations', label: 'Registrations Review', icon: Users, badge: pendingCount > 0 ? `${pendingCount} Pending` : null },
            { id: 'problem-statements', label: 'Problem Statements & Timer', icon: FileText, badge: `${problemStatements.length} PS` },
            { id: 'results', label: 'Results & Awards', icon: Trophy },
            { id: 'coordinators', label: 'Coordinators Manager', icon: GraduationCap },
            { id: 'cms', label: 'Landing Page CMS', icon: Edit3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2.5 transition-all whitespace-nowrap ${
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
                    placeholder="Search Team Name, ID, or College..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-extrabold bg-white text-black placeholder-slate-500 focus:border-[#E43D12]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-700" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border-2 border-slate-300 text-xs font-extrabold bg-white text-black"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending Approval</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Sample Teams List Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-black uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Team ID</th>
                      <th className="p-4">Team Name</th>
                      <th className="p-4">Size</th>
                      <th className="p-4">Institution</th>
                      <th className="p-4">UTR Number</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium bg-white">
                    {[
                      {
                        id: 't-1',
                        teamId: 'GL-01',
                        teamName: 'Neural Knights',
                        teamSize: 3,
                        college: 'IIT Madras',
                        transactionUtor: '984019283019',
                        status: 'APPROVED',
                        paymentScreenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
                        leaderName: 'Karthik Raja',
                        leaderEmail: 'karthik@iitm.ac.in',
                        members: [
                          { name: 'Karthik Raja', isLeader: true, college: 'IIT Madras', department: 'CSE', year: '4th Year' },
                          { name: 'Siddharth V', isLeader: false, college: 'IIT Madras', department: 'CSE', year: '4th Year' },
                          { name: 'Priya R', isLeader: false, college: 'IIT Madras', department: 'AI & Data Science', year: '3rd Year' },
                        ],
                      },
                      {
                        id: 't-2',
                        teamId: null,
                        teamName: 'CyberShield',
                        teamSize: 2,
                        college: 'VIT Vellore',
                        transactionUtor: '491029381029',
                        status: 'PENDING',
                        paymentScreenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
                        leaderName: 'Ananya Roy',
                        leaderEmail: 'ananya@vit.ac.in',
                        members: [
                          { name: 'Ananya Roy', isLeader: true, college: 'VIT Vellore', department: 'IT', year: '3rd Year' },
                          { name: 'Rohan Sharma', isLeader: false, college: 'VIT Vellore', department: 'IT', year: '3rd Year' },
                        ],
                      },
                    ].map((team) => (
                      <tr key={team.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#E43D12]">{team.teamId || 'Unassigned'}</td>
                        <td className="p-4 font-bold text-slate-900">{team.teamName}</td>
                        <td className="p-4 font-semibold text-slate-700">{team.teamSize} Members</td>
                        <td className="p-4 font-semibold text-slate-700">{team.college}</td>
                        <td className="p-4 font-mono text-slate-600">{team.transactionUtor}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
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
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedTeamModal(team)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 font-bold hover:bg-[#E43D12] hover:text-white hover:border-[#E43D12] transition-colors flex items-center gap-1.5 ml-auto shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#E43D12]" /> Review Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROBLEM STATEMENTS & TIMER WINDOW CONTROL */}
        {activeTab === 'problem-statements' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Active PS List */}
              <div className="card-3d p-6 rounded-3xl bg-white border-slate-200 space-y-4 shadow-sm">
                <h3 className="font-black text-slate-900 text-lg border-b pb-3 border-slate-200">
                  Published Problem Statements ({problemStatements.length})
                </h3>

                <div className="space-y-4">
                  {problemStatements.map((ps) => (
                    <div key={ps.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs bg-white text-[#E43D12] border border-slate-300 px-2.5 py-0.5 rounded shadow-xs">
                          {ps.psNumber}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-500">{ps.category}</span>
                          <button
                            onClick={() => setEditingPsModal({ ...ps })}
                            className="p-1.5 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold px-2.5 shadow-xs"
                            title="Edit Problem Statement"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#E43D12]" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeletePs(ps.id)}
                            className="p-1.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold px-2.5 shadow-xs"
                            title="Delete Problem Statement"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" /> Delete
                          </button>
                        </div>
                      </div>
                      <h4 className="font-black text-slate-900 text-base">{ps.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{ps.description}</p>
                      <a
                        href={ps.driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#E43D12] font-bold hover:underline inline-flex items-center gap-1 pt-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Drive Resource Link
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selection Window Timer Control Column */}
            <div className="space-y-6">
              <div className="card-3d p-6 rounded-3xl bg-white border-slate-200 space-y-4 shadow-sm">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2 border-b pb-2 border-slate-200">
                  <Clock className="w-5 h-5 text-[#E43D12]" /> PS Selection Window Control
                </h3>

                <div className="space-y-3">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Selection Window Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setTimerMinutes(mins)}
                        className={`py-2 rounded-xl font-bold text-xs border ${
                          timerMinutes === mins
                            ? 'gradient-bg-flame text-white border-[#E43D12] shadow-md'
                            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {mins} Mins
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    {selectionWindow?.isOpen ? (
                      <button
                        onClick={() => handleToggleWindow(false)}
                        className="w-full py-3 rounded-xl bg-red-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 hover:bg-red-700"
                      >
                        <Lock className="w-4 h-4" /> Close Selection Window Now
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleWindow(true)}
                        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 hover:bg-emerald-700"
                      >
                        <Unlock className="w-4 h-4" /> Open Selection Window ({timerMinutes} Mins)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Add New PS Form */}
              <form onSubmit={handleAddPs} className="card-3d p-6 rounded-3xl bg-white border-slate-200 space-y-4 shadow-sm">
                <h3 className="font-black text-slate-900 text-base border-b pb-2 border-slate-200">
                  Upload New Problem Statement
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
                  <label className="block text-xs font-black text-black mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Problem Statement Title"
                    value={newPs.title}
                    onChange={(e) => setNewPs({ ...newPs, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Detailed problem description..."
                    value={newPs.description}
                    onChange={(e) => setNewPs({ ...newPs, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black mb-1">Google Drive Resource Link</label>
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
                  className="w-full py-2.5 rounded-xl btn-3d-primary text-white font-extrabold text-xs shadow-md"
                >
                  Publish Problem Statement
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: LANDING PAGE CMS EDITOR WITH SUB-TABS */}
        {activeTab === 'cms' && (
          <form onSubmit={handleSaveCms} className="card-3d p-6 sm:p-10 rounded-3xl bg-white border-slate-200 space-y-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-slate-200">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#E43D12]" /> Dynamic Landing Page CMS Settings
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Manage hero titles, payment QR code & bank accounts, eligibility rules, and event agenda in dedicated sub-tabs.
                </p>
              </div>

              {/* CMS Sub-Tabs Control Pills */}
              <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1 overflow-x-auto shadow-inner">
                {[
                  { id: 'hero', label: 'Hero & Overview', icon: Sparkles },
                  { id: 'payment', label: 'Payment & Bank', icon: CreditCard },
                  { id: 'rules', label: 'Rules & Guidelines', icon: ShieldAlert },
                  { id: 'agenda', label: 'Agenda & Timeline', icon: Calendar },
                ].map((subTab) => {
                  const SubIcon = subTab.icon;
                  const isSubActive = cmsSubTab === subTab.id;
                  return (
                    <button
                      key={subTab.id}
                      type="button"
                      onClick={() => setCmsSubTab(subTab.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${
                        isSubActive
                          ? 'bg-[#E43D12] text-white shadow-md shadow-[#E43D12]/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                      }`}
                    >
                      <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? 'text-white' : 'text-[#E43D12]'}`} />
                      <span>{subTab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SUB-TAB 1: HERO & OVERVIEW */}
            {cmsSubTab === 'hero' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                <h4 className="font-extrabold text-[#E43D12] text-sm uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E43D12]" /> Hero Banner & Basic Event Info
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 p-4 rounded-2xl bg-white border-2 border-slate-300 space-y-2">
                    <label className="block text-xs font-black uppercase text-[#E43D12]">
                      Website & Navbar Logo Image URL (Shown in Header & Hero Badge)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://... or /images/logo.png"
                      value={cmsContent.logoUrl || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, logoUrl: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                    />
                    {cmsContent.logoUrl && (
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-200">
                        <span className="text-[11px] font-bold text-slate-700">Preview:</span>
                        <img src={cmsContent.logoUrl} alt="Logo Preview" className="w-8 h-8 object-contain rounded-full bg-white p-0.5 border border-slate-300 shadow-xs" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1">Hero Main Headline</label>
                    <input
                      type="text"
                      value={cmsContent.heroHeadline || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, heroHeadline: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1">Event Date Text</label>
                    <input
                      type="text"
                      value={cmsContent.eventDate || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, eventDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1">Event Time / Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 08:30 AM IST (24 Hours Live Code)"
                      value={cmsContent.eventTime || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, eventTime: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1">Venue Name & Location</label>
                    <input
                      type="text"
                      value={cmsContent.venue || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, venue: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-black uppercase text-black mb-1">Hero Subtitle</label>
                    <textarea
                      rows={3}
                      value={cmsContent.heroSubtitle || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, heroSubtitle: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: PAYMENT & BANK DETAILS */}
            {cmsSubTab === 'payment' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                <h4 className="font-extrabold text-[#D6536D] text-sm uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#D6536D]" /> Registration Fee, Bank Accounts & Payment QR Code
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-black mb-1">
                      Registration Fee Display (Per Team / Per Head)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹300 / Team or ₹100 / Head"
                      value={cmsContent.regFee || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, regFee: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-black mb-1">UPI ID</label>
                    <input
                      type="text"
                      placeholder="e.g. glitch10@upi"
                      value={cmsContent.upiId || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, upiId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold font-mono placeholder-slate-500 focus:border-[#E43D12]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-black mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. State Bank of India"
                      value={cmsContent.bankName || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, bankName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-black mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. GLITCH HACKATHON COMMITTEE"
                      value={cmsContent.bankAccountName || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, bankAccountName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-black mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 98765432109876"
                      value={cmsContent.bankAccountNumber || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, bankAccountNumber: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold font-mono placeholder-slate-500 focus:border-[#E43D12]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-black mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SBIN0001234"
                      value={cmsContent.bankIfsc || ''}
                      onChange={(e) => setCmsContent({ ...cmsContent, bankIfsc: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold font-mono placeholder-slate-500 focus:border-[#E43D12]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-black mb-1">
                      Payment QR Code Image (Upload Image File or Paste URL)
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <label className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-black cursor-pointer flex items-center justify-center gap-2 border-2 border-slate-300 shrink-0 transition-colors shadow-xs">
                        <Upload className="w-4 h-4 text-[#E43D12]" />
                        {uploadingQr ? 'Uploading QR Image...' : 'Upload QR Image File'}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingQr}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadingQr(true);
                              try {
                                const url = await uploadQrCodeImage(file);
                                setCmsContent({ ...cmsContent, qrCodeUrl: url });
                                setMessage('QR Code image uploaded successfully!');
                              } catch (err: any) {
                                setError('QR upload failed: ' + err.message);
                              } finally {
                                setUploadingQr(false);
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>

                      <input
                        type="text"
                        placeholder="Or paste QR Code Image URL directly..."
                        value={cmsContent.qrCodeUrl || ''}
                        onChange={(e) => setCmsContent({ ...cmsContent, qrCodeUrl: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-extrabold placeholder-slate-500 focus:border-[#E43D12]"
                      />
                    </div>

                    {cmsContent.qrCodeUrl && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={cmsContent.qrCodeUrl}
                            alt="QR Preview"
                            className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-white p-1 shadow-xs"
                          />
                          <div>
                            <span className="text-xs font-extrabold text-emerald-700 block">✓ Custom QR Code Loaded</span>
                            <span className="text-[11px] text-slate-600 font-mono block truncate max-w-md">
                              {cmsContent.qrCodeUrl}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCmsContent({ ...cmsContent, qrCodeUrl: '' })}
                          className="px-3 py-1 rounded-lg bg-red-100 text-red-700 border border-red-300 text-xs font-bold hover:bg-red-200"
                        >
                          Remove QR
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: RULES & GUIDELINES */}
            {cmsSubTab === 'rules' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                <h4 className="font-extrabold text-[#E43D12] text-sm uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#E43D12]" /> Hackathon Rules & Registration Guidelines
                </h4>

                <div>
                  <label className="block text-xs font-black text-black mb-1">
                    Team & Eligibility Rules (Enter one rule per line)
                  </label>
                  <textarea
                    rows={5}
                    value={cmsContent.rulesEligibility || ''}
                    onChange={(e) => setCmsContent({ ...cmsContent, rulesEligibility: e.target.value })}
                    placeholder="Team Size: Strictly 1 to 3 members per team...&#10;Institutional Uniformity: All team members..."
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
                    placeholder="Problem Statement Lock: Selection window...&#10;Originality: Fresh work only..."
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-mono font-extrabold focus:border-[#E43D12]"
                  />
                </div>
              </div>
            )}

            {/* SUB-TAB 4: AGENDA & TIMELINE */}
            {cmsSubTab === 'agenda' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                <h4 className="font-extrabold text-[#D6536D] text-sm uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D6536D]" /> Event Agenda & Timeline Schedule
                </h4>

                <div>
                  <label className="block text-xs font-black text-black mb-1">
                    Day 1 Agenda Items (Format per line: Time | Event Title | Description)
                  </label>
                  <textarea
                    rows={6}
                    value={cmsContent.agendaDay1 || ''}
                    onChange={(e) => setCmsContent({ ...cmsContent, agendaDay1: e.target.value })}
                    placeholder="08:30 AM | Reporting & Badge Verification | Check-in at venue&#10;09:30 AM | Inauguration | Welcome address..."
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
                    placeholder="09:00 AM | Final Sprint | Code freeze warning&#10;11:30 AM | Jury Presentation | Pitch to judges..."
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-black text-xs font-mono font-extrabold focus:border-[#E43D12]"
                  />
                </div>
              </div>
            )}

            <div className="border-t pt-4 border-slate-200">
              <button
                type="submit"
                disabled={savingCms}
                className="px-6 py-3 rounded-xl btn-3d-primary text-white font-extrabold text-xs shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-white" /> Save All CMS Changes
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: COORDINATORS MANAGER */}
        {activeTab === 'coordinators' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card-3d p-6 rounded-3xl bg-white border-slate-200 space-y-4 shadow-sm">
                <h3 className="font-black text-slate-900 text-lg border-b pb-3 border-slate-200">
                  Active Event Coordinators ({coordinators.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coordinators.map((c) => (
                    <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
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
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                  onChange={(e) => setNewCoord({ ...newCoord, type: e.target.value })}
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
                className="w-full py-2.5 rounded-xl btn-3d-primary text-white font-extrabold text-xs shadow-md"
              >
                Add Coordinator
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: RESULT PUBLISHING */}
        {activeTab === 'results' && (
          <div className="card-3d p-6 sm:p-10 rounded-3xl bg-white border-slate-200 space-y-6 shadow-sm">
            <h3 className="text-xl font-black text-black border-b pb-3 border-slate-200 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#EFB11D]" /> Result Management & Announcements
            </h3>

            <p className="text-xs text-black font-extrabold">
              Assign result prize tiers (First Prize, Second Prize, Third Prize, Participated) to approved hackathon teams. Results will appear automatically in team leader dashboards.
            </p>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-4">
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
                    setMessage('Results updated!');
                  }}
                  className="px-5 py-2 rounded-xl btn-3d-primary text-white font-extrabold text-xs shadow-md"
                >
                  Publish Result to Selected Teams
                </button>
              </div>

              <div className="space-y-2">
                {['t-1', 't-2'].map((id) => (
                  <label key={id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 text-xs font-black text-black cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTeamResultIds([...selectedTeamResultIds, id]);
                        else setSelectedTeamResultIds(selectedTeamResultIds.filter((i) => i !== id));
                      }}
                    />
                    <span>Team {id === 't-1' ? 'GL-01 (Neural Knights)' : 'CyberShield'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REVIEW REGISTRATION MODAL */}
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
              </div>

              <div className="flex items-center justify-between border-t pt-4 border-slate-200">
                <button
                  onClick={() => handleRejectTeam(selectedTeamModal.id)}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-extrabold text-xs shadow-md hover:bg-red-700"
                >
                  Reject Registration
                </button>
                <button
                  onClick={() => handleApproveTeam(selectedTeamModal.id)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md hover:bg-emerald-700"
                >
                  Approve & Assign Team ID
                </button>
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
