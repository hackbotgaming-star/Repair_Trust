import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Camera,
  Search,
  MapPin,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
  TrendingUp,
  Activity,
  Layers,
  FileText,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const CitizenPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState('All');
  const [trackSearchId, setTrackSearchId] = useState('');

  const fetchRecentComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.complaints.list({ limit: 20 });
      setComplaints(res.data || []);
    } catch (err) {
      console.error('Failed to load public complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentComplaints();
  }, []);

  // Compute live counts
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' || c.status === 'Submitted' || c.status === 'Reviewed'
  ).length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'WORK_IN_PROGRESS' || c.status === 'In Progress' || c.status === 'ASSIGNED' || c.status === 'Assigned'
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === 'VERIFIED_RESOLVED' || c.status === 'Resolved'
  ).length;
  const reopenedCount = complaints.filter(
    (c) => c.status === 'REOPENED' || c.status === 'DISPUTED'
  ).length;

  const wards = ['All', 'Ward 1 (North Gate)', 'Ward 2 (Market East)', 'Ward 3 (Lakeside West)', 'Ward 4 (Central)', 'Ward 5 (Old Town)', 'Ward 6 (Industrial South)'];

  const filteredComplaints = complaints.filter((c) => {
    if (selectedWard === 'All') return true;
    const wardName = c.location?.ward || c.publicLocation?.ward || '';
    return wardName === selectedWard;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Light Themed Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-teal-50/40 to-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 shadow-2xs">
                <Compass className="w-3.5 h-3.5 text-teal-600" />
                Citizen Public Portal &bull; Open Access
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Report, Track & Verify <span className="text-teal-700">Neighborhood Repairs</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Citizens submit verified infrastructure evidence, track real-time repair progress, and hold municipal departments accountable without requiring prior government permission.
              </p>
            </div>

            {/* Quick Track Input Pill */}
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-md max-w-sm w-full card-pop">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-teal-600" />
                Quick Complaint Lookup
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackSearchId}
                  onChange={(e) => setTrackSearchId(e.target.value)}
                  placeholder="e.g. CMP-2026-0089"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 uppercase"
                />
                <Link
                  to={trackSearchId.trim() ? `/track/${trackSearchId.trim().toUpperCase()}` : '/track'}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1 btn-pop"
                >
                  Track
                </Link>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Try demo scenario <span className="font-mono text-teal-700 font-semibold">CMP-2026-0089</span> or <span className="font-mono text-teal-700 font-semibold">CMP-2026-0045</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover-pop">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
              <span>Submitted / In Triage</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{pendingCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Awaiting engineering review</div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover-pop">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
              <span>Active Repairs</span>
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{inProgressCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Crews active in the field</div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover-pop">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
              <span>Verified Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{resolvedCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Evidence confirmed by audit</div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover-pop">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
              <span>Reopened / Disputed</span>
              <RotateCcw className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{reopenedCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Citizen challenged repairs</div>
          </div>
        </div>

        {/* 4 Core Citizen Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/report"
            className="group glass-panel hover:bg-teal-50/50 p-6 rounded-2xl border border-teal-200/80 shadow-xs transition hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-sm">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition">
                Report an Issue
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Upload authentic photo evidence, pin exact coordinates on Municipal Cadastral GIS, and receive an instant tracking ID.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600">
              <span>Start Report Wizard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/track"
            className="group glass-panel hover:bg-blue-50/50 p-6 rounded-2xl border border-blue-200/80 shadow-xs transition hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-sm">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition">
                Track Complaint
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Follow lifecycle progress, inspect before/after photos, and verify the tamper-evident SHA-256 event ledger.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>View Progress Ledger</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/citizen/map"
            className="group glass-panel hover:bg-indigo-50/50 p-6 rounded-2xl border border-indigo-200/80 shadow-xs transition hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-700 transition">
                Public Infrastructure Map
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Explore nearby issues, repeat-failure hotspots, and active repair crews with privacy-safe generalized locations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Open Public Map</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/citizen/dispute"
            className="group glass-panel hover:bg-rose-50/50 p-6 rounded-2xl border border-rose-200/80 shadow-xs transition hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-sm">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-700 transition">
                Reopen / Dispute Repair
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                If water accumulated again after rain or repair was superficial, dispute the closure and generate a linked recurrence.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
              <span>Challenge Repair</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>

        {/* Recently Reported Public Issues Feed with Ward Filter */}
        <div className="glass-panel rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" />
                Recent Neighborhood Infrastructure Reports
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live public registry of resident complaints and verified repairs across municipal wards.
              </p>
            </div>

            {/* Ward Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Ward:
              </span>
              {wards.map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWard(w)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    selectedWard === w
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
              <span>Loading public complaints...</span>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No reported issues found for the selected ward.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredComplaints.slice(0, 9).map((c) => (
                <div
                  key={c.complaintId}
                  className="bg-white/90 rounded-xl border border-slate-200 p-4 shadow-xs hover:border-teal-300 transition flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-slate-700">{c.complaintId}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          c.status === 'VERIFIED_RESOLVED' || c.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : c.status === 'REOPENED' || c.status === 'DISPUTED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : c.status === 'WORK_IN_PROGRESS' || c.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-teal-50 text-teal-700 border-teal-200'
                        }`}
                      >
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{c.category}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {c.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-600 font-medium truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {c.location?.street || c.publicLocation?.generalizedStreet || 'Location Pinned'}
                      </span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {c.location?.ward || c.publicLocation?.ward || 'Ward 4'}
                      </span>
                      <Link
                        to={`/track/${c.complaintId}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700"
                      >
                        Track Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View More Link */}
          <div className="pt-2 text-center">
            <Link
              to="/citizen/map"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              Explore All Issues on Public Infrastructure Map
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
