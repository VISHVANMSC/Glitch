'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronDown,
  Activity,
  Users,
} from 'lucide-react';

interface TeamTrackingViewProps {
  teamId?: string;
}

export default function TeamTrackingView({ teamId }: TeamTrackingViewProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const fetchTrackingData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      try {
        const url = teamId
          ? `/api/team/tracking?teamId=${encodeURIComponent(teamId)}`
          : '/api/team/tracking';
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || 'Failed to load tracking data.');
        }
        setData(json);
        setError(null);

        // Auto-select first event if not selected yet
        if (json.events && json.events.length > 0) {
          setSelectedEventId((prev) =>
            prev && json.events.some((e: any) => e.id === prev) ? prev : json.events[0].id
          );
        }
      } catch (err: any) {
        setError(err.message || 'Error loading team tracking data.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [teamId]
  );

  useEffect(() => {
    fetchTrackingData();
    const interval = setInterval(() => {
      fetchTrackingData();
    }, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [fetchTrackingData]);

  if (loading) {
    return (
      <div className="card-3d p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-4 border-[#E43D12] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-black uppercase tracking-wider text-[#E43D12]">
          Loading Track Your Team...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-3d p-6 rounded-3xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-2">
        <p className="font-bold">{error}</p>
        <button
          onClick={() => fetchTrackingData(true)}
          className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data?.team) {
    return null;
  }

  const { team, events = [], attendanceRecords = [] } = data;
  const members = team.members || [];

  // Currently selected event
  const currentEvent =
    events.find((e: any) => e.id === selectedEventId) || events[0];

  // Records for selected event
  const currentEventRecords = currentEvent
    ? attendanceRecords.filter(
        (r: any) =>
          r.eventId === currentEvent.id ||
          (currentEvent.type && r.event?.type === currentEvent.type)
      )
    : [];

  // Completed count for selected event
  const completedCount = members.filter((m: any) =>
    currentEventRecords.some(
      (r: any) => r.memberId === m.id && r.status === 'PRESENT'
    )
  ).length;

  return (
    <div className="card-3d p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b pb-4 border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#E43D12]" /> Track Your Team
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Select an activity to view check-in status for team members.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchTrackingData(true)}
          disabled={refreshing}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold flex items-center gap-1.5 border border-slate-300 transition-all active:scale-95 disabled:opacity-50"
          title="Refresh Status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {events.length > 0 ? (
        <div className="space-y-5">
          {/* Dropdown Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Select Scanning Activity:
            </label>
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 font-extrabold text-slate-900 text-sm appearance-none focus:outline-none focus:border-[#E43D12] transition-all pr-10 cursor-pointer shadow-xs"
              >
                {events.map((evt: any) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Activity Progress Summary Banner */}
          {currentEvent && (
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold">
              <span className="text-slate-600">
                Selected Activity: <strong className="text-slate-900">{currentEvent.name}</strong>
              </span>
              <span className="font-mono text-slate-900 bg-white px-3 py-1 rounded-full border border-slate-300 shadow-2xs">
                Completed: <span className="text-emerald-600 font-black">{completedCount}</span> / {members.length}
              </span>
            </div>
          )}

          {/* Members Status List */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" /> Team Member Status
            </h3>

            <div className="space-y-2.5">
              {members.map((member: any) => {
                const rec = currentEventRecords.find(
                  (r: any) => r.memberId === member.id && r.status === 'PRESENT'
                );
                const isScanned = Boolean(rec);

                return (
                  <div
                    key={member.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isScanned
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-red-50/50 border-red-200 text-red-950'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm break-words">
                          {member.name}
                        </span>
                        {member.isLeader && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-[#E43D12]/10 text-[#E43D12] border border-[#E43D12]/30 px-2 py-0.5 rounded shrink-0">
                            Team Leader
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-semibold truncate">
                        {member.department} • {member.year}
                      </p>
                      <p className="text-xs text-[#E43D12] font-extrabold break-words">
                        🏫 {member.college}
                      </p>
                    </div>

                    <div className="shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                      {isScanned ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Completed</span>
                          {rec?.scannedAt && (
                            <span className="text-[10px] opacity-90 font-mono">
                              ({new Date(rec.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-100 text-red-800 border border-red-300 font-black text-xs">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>Missed</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-semibold">
          No scanning activities have been added to the system yet.
        </div>
      )}
    </div>
  );
}
