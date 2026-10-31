import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  MapPin,
  Camera,
  RefreshCw,
  PlusCircle,
  Eye,
  Calendar
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const MyComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.complaints.myComplaints();
      setComplaints(res.data || []);
    } catch (err) {
      console.error('Failed to load my complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter === 'ACTIVE' && (c.status === 'VERIFIED_RESOLVED' || c.status === 'Resolved')) {
      return false;
    }
    if (statusFilter === 'RESOLVED' && c.status !== 'VERIFIED_RESOLVED' && c.status !== 'Resolved') {
      return false;
    }
    if (statusFilter === 'REOPENED' && c.status !== 'REOPENED' && c.status !== 'DISPUTED') {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.complaintId?.toLowerCase().includes(q);
      const matchCategory = c.category?.toLowerCase().includes(q);
      const matchStreet = (c.location?.street || '').toLowerCase().includes(q);
      if (!matchId && !matchCategory && !matchStreet) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 mb-2">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              Authenticated Citizen Archive
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">My Infrastructure Reports</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Complete private view of your reported complaints, assigned departments, and resolution evidence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/report"
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Report New Issue
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            {[
              { id: 'ALL', label: `All (${complaints.length})` },
              { id: 'ACTIVE', label: 'Active / In Progress' },
              { id: 'RESOLVED', label: 'Verified Resolved' },
              { id: 'REOPENED', label: 'Reopened / Disputed' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or street..."
              className="pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 w-60 bg-white"
            />
          </div>
        </div>

        {/* Complaints List */}
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
            <span>Loading your registered complaints...</span>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No complaints found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't submitted any complaints matching this filter. Any issue you report with your authenticated account will be securely listed here.
            </p>
            <div className="pt-2">
              <Link
                to="/report"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shadow-xs hover:bg-teal-400 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Report an Issue Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((c) => {
              const isResolved = c.status === 'VERIFIED_RESOLVED' || c.status === 'Resolved';
              const isReopened = c.status === 'REOPENED' || c.status === 'DISPUTED';

              return (
                <div
                  key={c.complaintId}
                  className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-base font-extrabold text-slate-900">
                          {c.complaintId}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            isResolved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isReopened
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-teal-50 text-teal-700 border-teal-200'
                          }`}
                        >
                          {c.status.replace(/_/g, ' ')}
                        </span>
                        {c.severity && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                            {c.severity} Severity
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm">{c.category}</h3>
                      <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                        "{c.description}"
                      </p>
                    </div>

                    <div className="text-right text-xs space-y-1">
                      <div className="text-slate-400 flex items-center justify-end gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-slate-600 font-medium">
                        Target Asset: <span className="font-mono font-bold text-teal-700">{c.assetId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location & Department Metadata */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>
                        <strong>Location:</strong> {c.location?.street} ({c.location?.ward})
                      </span>
                    </div>

                    {c.assignedDepartment && (
                      <div className="text-slate-500">
                        <strong>Assigned:</strong> {c.assignedDepartment}
                      </div>
                    )}
                  </div>

                  {/* Photos Preview & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {c.photos && c.photos.length > 0 ? (
                        c.photos.map((p: string, idx: number) => (
                          <div
                            key={idx}
                            className="w-12 h-12 rounded-lg overflow-hidden border border-slate-300 shadow-xs relative bg-slate-900"
                          >
                            <img src={p} alt="Thumbnail" className="w-full h-full object-cover" />
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No photos attached</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/track/${c.complaintId}`}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-400" />
                        Track Lifecycle & Events
                      </Link>

                      {(isResolved || c.status === 'REPAIR_SUBMITTED') && (
                        <Link
                          to={`/citizen/dispute?id=${c.complaintId}`}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Dispute / Reopen
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
