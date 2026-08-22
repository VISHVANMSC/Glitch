'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Eye,
  CheckCircle2,
  Clock,
  RefreshCw,
  Utensils,
  Coffee,
  UserCheck,
  Calendar,
  Sparkles,
  Info,
  Shield,
  Activity,
  ChevronRight,
} from 'lucide-react';

interface TeamTrackingViewProps {
  teamId?: string;
}

export default function TeamTrackingView({ teamId }: TeamTrackingViewProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const fetchTrackingData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const url = teamId ? `/api/team/tracking?teamId=${encodeURIComponent(teamId)}` : '/api/team/tracking';
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load tracking data.');
      }
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error loading team tracking data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTrackingData();
    const interval = setInterval(() => {
      fetchTrackingData();
    }, 15000); // Live poll every 15s
    return () => clearInterval(interval);
  }, [fetchTrackingData]);

  if (loading) {
    return (
      <div className="card-3d p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#E43D12] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-black uppercase tracking-widest text-[#E43D12]">Loading View-Only Tracking System...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-3d p-6 rounded-3xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold space-y-2">
        <div className="flex items-center gap-2 font-black text-sm text-red-700">
          <Info className="w-4 h-4" /> Tracking System Notice
        </div>
        <p>{error}</p>
        <button
          onClick={() => fetchTrackingData(true)}
          className="mt-2 px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow hover:bg-red-700 transition-colors"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  if (!data?.team) {
    return (
      <div className="card-3d p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
        <Shield className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-base font-black text-slate-800">No Team Tracking Data Available</h3>
        <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
          Tracking data will become active once your team registration is approved and event scanners record check-ins.
        </p>
      </div>
    );
  }

  const { team, summary = [], attendanceRecords = [] } = data;
  const members = team.members || [];

  // Categorized Summaries
  const checkInEvents = summary.filter((s: any) => s.eventType === 'CHECK_IN');
  const mealEvents = summary.filter((s: any) => s.eventType === 'LUNCH' || s.eventType === 'BREAKFAST');
  const snackEvents = summary.filter((s: any) => s.eventType === 'REFRESHMENT' || s.eventType === 'BREAK');
  const otherEvents = summary.filter((s: any) => !['CHECK_IN', 'LUNCH', 'BREAKFAST', 'REFRESHMENT', 'BREAK'].includes(s.eventType));

  // Filtered Summary List
  const filteredEvents = summary.filter((s: any) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'CHECK_IN') return s.eventType === 'CHECK_IN';
    if (selectedFilter === 'MEALS') return s.eventType === 'LUNCH' || s.eventType === 'BREAKFAST';
    if (selectedFilter === 'SNACKS') return s.eventType === 'REFRESHMENT' || s.eventType === 'BREAK';
    if (selectedFilter === 'OTHER') return !['CHECK_IN', 'LUNCH', 'BREAKFAST', 'REFRESHMENT', 'BREAK'].includes(s.eventType);
    return true;
  });

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'CHECK_IN':
      case 'CHECK_OUT':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'LUNCH':
      case 'BREAKFAST':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'REFRESHMENT':
      case 'BREAK':
        return <Coffee className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getStatusBadge = (status: string, scannedCount: number, totalMembers: number) => {
    if (status === 'COMPLETED') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> All Scanned ({scannedCount}/{totalMembers})
        </span>
      );
    }
    if (status === 'PARTIAL') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Partial ({scannedCount}/{totalMembers})
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-300 text-[11px] font-black uppercase tracking-wider">
        Not Scanned Yet ({scannedCount}/{totalMembers})
      </span>
    );
  };

  return (
    <div className="card-3d p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-600" /> View-Only Access
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-bold">
              Team ID: {team.teamId || 'GL-01'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            Participant & Team Tracking System
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Live check-in & event activity status for members of <span className="font-extrabold text-slate-800">{team.teamName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => fetchTrackingData(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center gap-2 border border-slate-300 transition-transform active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Status'}
          </button>
        </div>
      </div>

      {/* Read-Only Notice Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md flex items-start gap-3 border border-indigo-800/40">
        <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <p className="font-black uppercase tracking-wider text-indigo-300">Read-Only Permission Scope</p>
          <p className="text-slate-300 font-medium leading-relaxed">
            As a Team Leader / Participant, you have <strong className="text-white">view-only access</strong> to view whether team members have checked in for events, meals, and refreshments. Tracking data is logged exclusively by official venue scanners.
          </p>
        </div>
      </div>

      {/* Quick Status Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Check-In Card */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-emerald-900">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" /> Venue Check-In
            </span>
            <span className="font-mono text-emerald-700">
              {checkInEvents.reduce((acc: number, e: any) => acc + e.scannedCount, 0)}/{members.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            {checkInEvents.some((e: any) => e.status === 'COMPLETED')
              ? '✅ All members checked in'
              : checkInEvents.some((e: any) => e.status === 'PARTIAL')
              ? '⏳ Check-in in progress'
              : '❌ Pending venue entry scan'}
          </p>
        </div>

        {/* Meals Card */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-amber-900">
            <span className="flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-amber-600" /> Meals (Lunch/B-fast)
            </span>
            <span className="font-mono text-amber-700">
              {mealEvents.reduce((acc: number, e: any) => acc + e.scannedCount, 0)}/
              {mealEvents.length ? mealEvents.length * members.length : members.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            {mealEvents.length === 0
              ? 'No active meal events yet'
              : mealEvents.some((e: any) => e.status === 'COMPLETED')
              ? '🍱 Meal scan completed'
              : mealEvents.some((e: any) => e.status === 'PARTIAL')
              ? '🍲 Partial meal scans'
              : '🍽️ Waiting for meal scanning'}
          </p>
        </div>

        {/* Snacks Card */}
        <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-orange-900">
            <span className="flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-orange-600" /> Snacks & Tea
            </span>
            <span className="font-mono text-orange-700">
              {snackEvents.reduce((acc: number, e: any) => acc + e.scannedCount, 0)}/
              {snackEvents.length ? snackEvents.length * members.length : members.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            {snackEvents.length === 0
              ? 'No active snack events yet'
              : snackEvents.some((e: any) => e.status === 'COMPLETED')
              ? '☕ Refreshments scanned'
              : '⏳ Refreshment pending'}
          </p>
        </div>

        {/* Other Activities Card */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-indigo-900">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Other Activities
            </span>
            <span className="font-mono text-indigo-700">{otherEvents.length} Events</span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            {otherEvents.length === 0
              ? 'No custom activity events'
              : `${otherEvents.filter((e: any) => e.status === 'COMPLETED').length}/${otherEvents.length} completed`}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {[
          { id: 'ALL', label: 'All Activities', count: summary.length },
          { id: 'CHECK_IN', label: 'Venue Check-in', count: checkInEvents.length },
          { id: 'MEALS', label: 'Lunch / Meals', count: mealEvents.length },
          { id: 'SNACKS', label: 'Snacks & Refreshment', count: snackEvents.length },
          { id: 'OTHER', label: 'Other Activities', count: otherEvents.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
              selectedFilter === tab.id
                ? 'gradient-bg-primary text-white border-[#E43D12] shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                selectedFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Activities & Scanning Summary List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-semibold">
            No scanning events match the selected category.
          </div>
        ) : (
          filteredEvents.map((eventSummary: any) => (
            <div
              key={eventSummary.eventId}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all space-y-4 shadow-xs"
            >
              {/* Event Header Line */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    {getEventTypeIcon(eventSummary.eventType)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      {eventSummary.eventName}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Type: {eventSummary.eventType} • {eventSummary.isActive ? '🟢 Active Event' : '⚪ Closed Event'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(eventSummary.status, eventSummary.scannedCount, eventSummary.totalMembers)}
                  {eventSummary.lastScannedAt && (
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Last scan: {new Date(eventSummary.lastScannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Roster Member Breakdown Matrix */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Team Roster Check-In Status
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {members.map((member: any) => {
                    const record = eventSummary.records?.find((r: any) => r.memberId === member.id && r.status === 'PRESENT');
                    const isScanned = Boolean(record);

                    return (
                      <div
                        key={member.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                          isScanned
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className="space-y-0.5 truncate">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-extrabold text-slate-900 text-xs truncate">{member.name}</span>
                            {member.isLeader && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                                Leader
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium truncate">
                            {member.department} ({member.year})
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          {isScanned ? (
                            <div className="space-y-0.5">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1 shadow-xs">
                                <CheckCircle2 className="w-3 h-3" /> Scanned
                              </span>
                              <span className="block text-[10px] font-mono text-emerald-800 font-semibold">
                                {new Date(record.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                              Not Scanned
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Scan History Feed */}
      {attendanceRecords.length > 0 && (
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#E43D12]" /> Recent Team Scan Activity Feed
          </h3>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {attendanceRecords.slice(0, 10).map((record: any) => (
              <div
                key={record.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-semibold gap-3 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <span className="font-extrabold text-slate-900">{record.member?.name || 'Team Member'}</span>
                    <span className="text-slate-500 text-[11px]"> scanned for </span>
                    <span className="font-bold text-[#E43D12]">{record.event?.name || 'Activity'}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-[11px] text-slate-600 block">
                    {new Date(record.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  {record.notes && (
                    <span className="text-[9px] text-slate-500 font-normal italic block">{record.notes}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
