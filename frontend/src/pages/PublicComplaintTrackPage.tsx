import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  FileCheck2,
  RefreshCw,
  Camera,
  MessageSquare,
  ThumbsUp,
  RotateCcw,
  Hash,
  ExternalLink,
  ChevronRight,
  Info,
  Building,
  UserCheck
} from 'lucide-react';
import { api } from '../api/client';

const LIFECYCLE_STAGES = [
  { key: 'SUBMITTED', label: 'Submitted', desc: 'Complaint registered and timestamped' },
  { key: 'UNDER_REVIEW', label: 'Under Review', desc: 'Assigned for engineering triage' },
  { key: 'ASSIGNED', label: 'Work Assigned', desc: 'Work order dispatched to field team' },
  { key: 'WORK_IN_PROGRESS', label: 'In Progress', desc: 'Crews operating on-site' },
  { key: 'REPAIR_SUBMITTED', label: 'Repair Submitted', desc: 'Field evidence awaiting sign-off' },
  { key: 'VERIFIED_RESOLVED', label: 'Verified Resolved', desc: 'Independent verification confirmed' }
];

export const PublicComplaintTrackPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState(id || '');
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState<any>(null);
  const [eventData, setEventData] = useState<{ events: any[]; chainIntegrity: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dispute Modal
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  // Feedback Modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackOutcome, setFeedbackOutcome] = useState('Issue resolved satisfactorily');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // Success notifications
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [allComplaints, setAllComplaints] = useState<any[]>([]);
  const [showCatalog, setShowCatalog] = useState(true);

  const loadAllComplaints = async () => {
    try {
      const res = await api.complaints.list({ limit: 30 });
      if (res && res.data) {
        setAllComplaints(res.data);
      }
    } catch (e) {
      console.warn('Could not load public complaints list:', e);
    }
  };

  const fetchComplaintData = async (targetId: string) => {
    if (!targetId.trim()) return;
    setLoading(true);
    setError(null);
    setActionSuccess(null);

    try {
      // 1. Fetch complaint
      const compRes = await api.complaints.v1Get(targetId.trim());
      setComplaint(compRes.data);

      // 2. Fetch event chain
      try {
        const evRes = await api.complaints.getEvents(targetId.trim());
        setEventData({ events: evRes.events || [], chainIntegrity: evRes.chainIntegrity || null });
      } catch (evErr) {
        console.warn('Events fetch warning:', evErr);
        setEventData(null);
      }
    } catch (err: any) {
      setError(err.message || 'Complaint reference not found.');
      setComplaint(null);
      setEventData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllComplaints();
    if (id) {
      setSearchId(id);
      fetchComplaintData(id);
    } else {
      // Auto-load premier demo showcase CMP-2026-0089 so the page is never blank!
      setSearchId('CMP-2026-0089');
      fetchComplaintData('CMP-2026-0089');
    }
  }, [id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    navigate(`/track/${searchId.trim().toUpperCase()}`);
    fetchComplaintData(searchId.trim().toUpperCase());
  };

  // Submit Dispute
  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim() || !complaint) return;
    setDisputeSubmitting(true);
    try {
      await api.complaints.dispute(complaint.complaintId, { reason: disputeReason });
      setShowDisputeModal(false);
      setDisputeReason('');
      setActionSuccess('Your closure dispute has been registered and re-opened for municipal review.');
      await fetchComplaintData(complaint.complaintId);
    } catch (err: any) {
      alert('Failed to submit dispute: ' + err.message);
    } finally {
      setDisputeSubmitting(false);
    }
  };

  // Submit Feedback
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setFeedbackSubmitting(true);
    try {
      await api.complaints.feedback(complaint.complaintId, {
        outcome: feedbackOutcome,
        notes: feedbackNotes
      });
      setShowFeedbackModal(false);
      setFeedbackNotes('');
      setActionSuccess('Thank you! Your post-repair verification feedback has been permanently recorded in the ledger.');
      await fetchComplaintData(complaint.complaintId);
    } catch (err: any) {
      alert('Failed to submit feedback: ' + err.message);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const getStageIndex = (status: string) => {
    if (status === 'Resolved' || status === 'VERIFIED_RESOLVED') return 5;
    if (status === 'REPAIR_SUBMITTED') return 4;
    if (status === 'In Progress' || status === 'WORK_IN_PROGRESS') return 3;
    if (status === 'Assigned' || status === 'ASSIGNED') return 2;
    if (status === 'Under Review' || status === 'UNDER_REVIEW') return 1;
    return 0; // SUBMITTED or default
  };

  const currentStageIndex = complaint ? getStageIndex(complaint.status) : -1;
  const isDisputed = complaint?.status === 'DISPUTED';
  const isReopened = complaint?.status === 'REOPENED';
  const isRejected = complaint?.status === 'REJECTED_WITH_REASON';
  const isResolved = complaint?.status === 'VERIFIED_RESOLVED' || complaint?.status === 'Resolved';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header bar */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                Public Accountability Portal
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Track Complaint & Repair Verification</h1>
              <p className="text-sm text-slate-300 mt-1">
                Transparent lifecycle tracking with tamper-evident SHA-256 event chaining.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/report"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs shadow-xs transition"
              >
                <Camera className="w-4 h-4" />
                Report New Issue
              </Link>
            </div>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-xl flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Complaint ID (e.g., CMP-2026-0089)"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-400 text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition flex items-center gap-1.5 shrink-0"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Track'}
            </button>
          </form>

          {/* Quick 1-Click Demo Showcase Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Demo Showcase:
            </span>
            {[
              { id: 'CMP-2026-0089', label: 'Drain Overflow', stage: 'Active Task', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500/30' },
              { id: 'CMP-2026-0101', label: 'Road Pothole', stage: 'In Progress', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' },
              { id: 'CMP-2026-0103', label: 'Open Manhole', stage: 'Submitted', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30' },
              { id: 'CMP-2026-0107', label: 'Citizen Dispute', stage: 'Reopened', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30' },
              { id: 'CMP-2026-0045', label: 'Culvert Clear', stage: 'Verified', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' }
            ].map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => {
                  setSearchId(demo.id);
                  navigate(`/track/${demo.id}`);
                  fetchComplaintData(demo.id);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition flex items-center gap-1.5 ${demo.color} ${
                  searchId === demo.id ? 'ring-2 ring-teal-400 font-bold shadow-sm shadow-teal-500/30' : ''
                }`}
              >
                <span className="font-bold">{demo.id}</span>
                <span className="text-[11px] opacity-80">· {demo.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Success Alert */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900 font-bold text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-2xl bg-white border border-rose-200 text-center shadow-xs">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">Complaint Not Found</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mt-1 mb-4">{error}</p>
            <p className="text-xs text-slate-400">
              Try searching for demo scenario <span className="font-mono font-bold text-teal-600">CMP-2026-0089</span> or{' '}
              <span className="font-mono font-bold text-teal-600">CMP-2026-0045</span>.
            </p>
          </div>
        )}

        {/* Main Complaint View */}
        {complaint && (
          <div className="space-y-8">
            {/* Top Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xl font-extrabold text-slate-900 tracking-tight">
                      {complaint.complaintId}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        complaint.status === 'VERIFIED_RESOLVED' || complaint.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : complaint.status === 'DISPUTED' || complaint.status === 'REOPENED'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : complaint.status === 'REJECTED_WITH_REASON'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-teal-50 text-teal-700 border-teal-200'
                      }`}
                    >
                      {complaint.status.replace(/_/g, ' ')}
                    </span>
                    {complaint.severity && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                        {complaint.severity} Severity
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">{complaint.category}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Observed at {complaint.location?.street || complaint.publicLocation?.generalizedStreet} (
                    {complaint.location?.ward || complaint.publicLocation?.ward})
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Target Asset</div>
                  <Link
                    to={`/memory-graph?assetId=${complaint.assetId}`}
                    className="inline-flex items-center gap-1 font-mono font-bold text-sm text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    {complaint.assetId}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Filed on {new Date(complaint.createdAt).toLocaleDateString()} at{' '}
                    {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Status Banner / Public Explanation */}
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Current Status Summary</h4>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">
                      {complaint.publicStatusUpdate ||
                        'Your report is securely queued and visible in the public municipal infrastructure accountability ledger.'}
                    </p>
                    {complaint.rejectionReason && (
                      <div className="mt-2 text-xs text-rose-700 font-semibold bg-rose-50 p-2 rounded border border-rose-200">
                        Official Decision Reason: {complaint.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar / Lifecycle Stages */}
              <div className="mt-8">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Lifecycle Progress & Verification Gates
                </h4>
                <div className="relative">
                  <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                  <div
                    className="hidden sm:block absolute top-4 left-6 h-0.5 bg-teal-500 transition-all duration-500 -z-0"
                    style={{
                      width: `${
                        currentStageIndex < 0
                          ? 0
                          : (currentStageIndex / (LIFECYCLE_STAGES.length - 1)) * 100
                      }%`
                    }}
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                    {LIFECYCLE_STAGES.map((stage, idx) => {
                      const isCompleted = idx <= currentStageIndex;
                      const isCurrent = idx === currentStageIndex;

                      return (
                        <div key={stage.key} className="flex flex-col items-start sm:items-center text-left sm:text-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs mb-2 ${
                              isCompleted
                                ? 'bg-teal-600 text-white ring-4 ring-teal-50'
                                : 'bg-slate-100 text-slate-400 border border-slate-300'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              isCurrent ? 'text-teal-700 font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                            }`}
                          >
                            {stage.label}
                          </span>
                          <span className="text-[11px] text-slate-400 leading-tight mt-0.5 hidden sm:block">
                            {stage.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Exceptional Status Badges */}
                {(isDisputed || isReopened) && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Notice:</strong> This complaint is currently in <strong>{complaint.status}</strong> status.
                      Citizen challenge or recurrence has triggered re-investigation.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence Comparison: Citizen Report vs. Municipal Repair */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-600" />
                Visual Evidence & Authenticity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Citizen Submitted Evidence */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Citizen Initial Evidence
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">At Submission</span>
                  </div>

                  {complaint.photos && complaint.photos.length > 0 ? (
                    <div className="space-y-3">
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-300 relative">
                        <img
                          src={complaint.photos[0]}
                          alt="Citizen evidence"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback graphic if file not loaded
                            (e.target as any).src =
                              'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-mono">
                          SHA-256 Screened
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 italic">"{complaint.description}"</p>
                    </div>
                  ) : (
                    <div className="h-40 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                      No photo submitted
                    </div>
                  )}
                </div>

                {/* Municipal Repair Evidence */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Municipal Repair Verification
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Post-Work Audit</span>
                  </div>

                  {complaint.closureVerification &&
                  complaint.closureVerification.afterPhotos &&
                  complaint.closureVerification.afterPhotos.length > 0 ? (
                    <div className="space-y-3">
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-300 relative">
                        <img
                          src={complaint.closureVerification.afterPhotos[0]}
                          alt="Repair evidence"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).src =
                              'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] font-mono border border-emerald-500/50">
                          Verified by {complaint.closureVerification.verifiedBy || 'Municipal Engineer'}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">
                        {complaint.closureVerification.notes || 'Repairs completed and inspected by municipal staff.'}
                      </p>
                    </div>
                  ) : (
                    <div className="h-40 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-xs text-slate-400 p-4 text-center">
                      <Clock className="w-6 h-6 mb-2 text-slate-400" />
                      <span>Repair completion evidence not yet submitted by field crews.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Citizen Actions: Post-Repair Feedback & Dispute */}
            <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-teal-400" />
                    Citizen Voice & Post-Repair Oversight
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Municipal accountability requires public confirmation. Tell us if the issue was resolved properly,
                    or challenge superficial repairs.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Submit Post-Repair Feedback
                  </button>

                  <button
                    onClick={() => setShowDisputeModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Dispute / Challenge Closure
                  </button>
                </div>
              </div>

              {/* Existing Citizen Feedback List */}
              {complaint.citizenFeedback && complaint.citizenFeedback.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <div className="text-xs font-bold text-teal-400 uppercase tracking-wide mb-3">
                    Submitted Citizen Feedback ({complaint.citizenFeedback.length})
                  </div>
                  <div className="space-y-2">
                    {complaint.citizenFeedback.map((fb: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="font-bold text-teal-300">{fb.outcome}</span>
                          <span>{new Date(fb.submittedAt).toLocaleString()}</span>
                        </div>
                        {fb.notes && <p className="text-slate-300 italic">"{fb.notes}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Disputes List */}
              {complaint.disputes && complaint.disputes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-3">
                    Recorded Closure Disputes ({complaint.disputes.length})
                  </div>
                  <div className="space-y-2">
                    {complaint.disputes.map((dsp: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs">
                        <div className="flex items-center justify-between text-rose-300 mb-1">
                          <span className="font-mono font-bold">{dsp.disputeId}</span>
                          <span className="px-2 py-0.5 rounded bg-rose-900/80 text-[10px] text-white">
                            {dsp.status}
                          </span>
                        </div>
                        <p className="text-slate-200">"{dsp.reason}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tamper-Evident SHA-256 Chained Event Ledger */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-teal-600" />
                    Tamper-Evident Chained Event Ledger
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Every lifecycle transition is cryptographically chained using SHA-256 to ensure municipal integrity.
                  </p>
                </div>

                {eventData?.chainIntegrity && (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${
                      eventData.chainIntegrity.valid
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    {eventData.chainIntegrity.valid ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Cryptographic Ledger: Valid ({eventData.chainIntegrity.chainLength} Chained Blocks)</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        <span>Chain Discrepancy Detected!</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {eventData?.events && eventData.events.length > 0 ? (
                <div className="relative border-l-2 border-teal-500/40 ml-4 pl-6 space-y-6">
                  {eventData.events.map((ev: any, idx: number) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-teal-500 ring-4 ring-teal-50" />
                      <div className="bg-slate-50 hover:bg-slate-100/70 transition p-4 rounded-xl border border-slate-200">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-1">
                          <span className="font-bold text-slate-900 font-mono">{ev.eventType}</span>
                          <span className="text-slate-500">
                            {new Date(ev.timestamp).toLocaleDateString()} {new Date(ev.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 font-medium">{ev.changeSummary}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            Actor: <strong>{ev.actorName || 'System'}</strong> ({ev.actorRole || 'System'})
                          </span>
                          {ev.newStatus && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                              Status: {ev.newStatus}
                            </span>
                          )}
                        </div>

                        {/* Hash details */}
                        <div className="mt-3 pt-2 border-t border-slate-200/60 font-mono text-[10px] text-slate-400 space-y-0.5 break-all">
                          <div>
                            <span className="text-slate-500 font-semibold">Current Hash:</span> {ev.eventHash}
                          </div>
                          <div>
                            <span className="text-slate-500 font-semibold">Previous Hash:</span>{' '}
                            {ev.previousEventHash || '0000000000000000000000000000000000000000000000000000000000000000 (GENESIS)'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No event records currently retrieved for this complaint.
                </div>
              )}
            </div>
          </div>
        )}
      </div>


        {/* Public Complaints Explorer Catalog */}
        <div className="mt-10 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Public Infrastructure Complaints Directory
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                  {allComplaints.length} Public Cases
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Click any complaint below to track its complete cryptographic SHA-256 event chain, field photos, and repair audit status.
              </p>
            </div>
            <button
              onClick={() => setShowCatalog(!showCatalog)}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline"
            >
              {showCatalog ? 'Hide Directory ▲' : 'Show All Complaints ▼'}
            </button>
          </div>

          {showCatalog && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              {allComplaints.map((item) => (
                <div
                  key={item.complaintId}
                  onClick={() => {
                    setSearchId(item.complaintId);
                    navigate(`/track/${item.complaintId}`);
                    fetchComplaintData(item.complaintId);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer hover:shadow-md hover:border-teal-400 ${
                    complaint?.complaintId === item.complaintId
                      ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-extrabold text-teal-700">
                      {item.complaintId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.status === 'VERIFIED_RESOLVED' || item.status === 'Resolved' || item.status === 'Closed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'DISPUTED' || item.status === 'REOPENED'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : item.status === 'In Progress' || item.status === 'WORK_IN_PROGRESS'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-teal-50 text-teal-700 border-teal-200'
                      }`}
                    >
                      {(item.status || 'SUBMITTED').replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                    {item.category}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-200/60">
                    <span className="truncate max-w-[140px]">
                      {item.location?.street || item.location?.ward || 'Ward 4'}
                    </span>
                    <span className="text-teal-600 font-bold flex items-center gap-1 hover:underline">
                      Track Now ➔
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* DISPUTE CLOSURE MODAL */}
      <AnimatePresence>
        {showDisputeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
                  <AlertTriangle className="w-5 h-5" />
                  Dispute Closure / Challenge Repair
                </div>
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDisputeSubmit} className="mt-4 space-y-4">
                <p className="text-xs text-slate-600">
                  If the municipal repair was inadequate, superficial, or marked resolved prematurely, specify your
                  findings. This will re-open the complaint under <strong>DISPUTED</strong> status and record an append-only
                  event.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Reason for Dispute *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="e.g., Drain was cleaned at surface level, but deep silt and downstream culvert remains blocked. Water accumulated during rain today."
                    className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowDisputeModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={disputeSubmitting || !disputeReason.trim()}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    {disputeSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Dispute'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FEEDBACK MODAL */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-base">
                  <ThumbsUp className="w-5 h-5" />
                  Citizen Post-Repair Feedback
                </div>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Repair Verification Outcome *
                  </label>
                  <select
                    value={feedbackOutcome}
                    onChange={(e) => setFeedbackOutcome(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-white"
                  >
                    <option value="Issue resolved satisfactorily">Issue resolved satisfactorily (Verified)</option>
                    <option value="Issue partially resolved">Issue partially resolved</option>
                    <option value="Issue still exists">Issue still exists (Auto-reopens complaint)</option>
                    <option value="Issue returned after rain or normal usage">
                      Issue returned after rain or normal usage (Auto-reopens complaint)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Notes or Observations (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="e.g., Grate replaced and water is flowing smoothly, no standing puddle observed."
                    className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={feedbackSubmitting}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    {feedbackSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
