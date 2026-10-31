import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { WorkOrder } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Camera,
  Video,
  FileText,
  Search,
  Filter,
  Sliders,
  ChevronDown,
  ChevronUp,
  XCircle,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Eye,
  Send
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ClosureAuditorPage: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Engineer decision modal state
  const [modalTask, setModalTask] = useState<WorkOrder | null>(null);
  const [modalType, setModalType] = useState<'Approve' | 'Unverified' | 'Return' | 'Reopen' | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  // Policy rules drawer state
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyConfig, setPolicyConfig] = useState({
    strictMonsoonMode: true,
    requireVideoProof: true,
    requireBeforeAfterPhotos: true,
    flagRepeatFailureAssets: true,
    minWorkerNotesLength: 20
  });

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const res = await api.workOrders.list({ limit: 50 });
      setWorkOrders(res.data);
    } catch (err) {
      console.error('Failed to load work orders for auditor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const handleOpenDecisionModal = (task: WorkOrder, type: 'Approve' | 'Unverified' | 'Return' | 'Reopen') => {
    setModalTask(task);
    setModalType(type);
    if (type === 'Approve') {
      setDecisionNotes('Workmanship verified against asset baseline; clear invert and flow restored.');
    } else if (type === 'Unverified') {
      setDecisionNotes('Repair marked Unverified: Missing mandatory post-repair culvert invert photograph or live video proof. Work order remains non-approved.');
    } else if (type === 'Return') {
      setDecisionNotes('Returned for crew revision: Please provide additional clear-angle photograph proving downstream culvert flow.');
    } else if (type === 'Reopen') {
      setDecisionNotes('Reopened due to recurring overflow reported by citizen following recent localized rain event.');
    }
  };

  const handleExecuteDecision = async () => {
    if (!modalTask || !modalType || !decisionNotes.trim()) {
      alert('Please provide a documented engineering reason for this closure decision.');
      return;
    }

    try {
      setSubmittingDecision(true);
      if (modalType === 'Reopen') {
        await api.workOrders.reopen(modalTask.workOrderId, {
          reason: decisionNotes.trim()
        });
      } else {
        const decisionPayload =
          modalType === 'Approve'
            ? 'Approved'
            : modalType === 'Unverified'
            ? 'Unverified'
            : 'Returned';

        await api.workOrders.review(modalTask.workOrderId, {
          decision: decisionPayload,
          comments: decisionNotes.trim()
        });
      }

      setModalTask(null);
      setModalType(null);
      setDecisionNotes('');
      await fetchWorkOrders();
    } catch (err: any) {
      alert('Error recording decision: ' + (err.message || 'Operation failed'));
    } finally {
      setSubmittingDecision(false);
    }
  };

  // Filter list
  const filteredOrders = workOrders.filter((wo) => {
    const matchesSearch =
      wo.workOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.repairType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (wo.assignedWorkerName && wo.assignedWorkerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Under Review' && wo.closureAuditorStatus === 'Under Review') ||
      (statusFilter === 'Unverified' && wo.closureAuditorStatus === 'Unverified') ||
      (statusFilter === 'Incomplete' && wo.closureAuditorStatus === 'Incomplete') ||
      (statusFilter === 'Approved' && wo.closureAuditorStatus === 'Approved') ||
      (statusFilter === 'Reopened' && (wo.closureAuditorStatus === 'Reopened' || wo.status === 'Reopened'));

    return matchesSearch && matchesStatus;
  });

  // KPI counts
  const countUnderReview = workOrders.filter((w) => w.closureAuditorStatus === 'Under Review').length;
  const countUnverified = workOrders.filter((w) => w.closureAuditorStatus === 'Unverified').length;
  const countIncomplete = workOrders.filter((w) => w.closureAuditorStatus === 'Incomplete').length;
  const countApproved = workOrders.filter((w) => w.closureAuditorStatus === 'Approved').length;
  const countReopened = workOrders.filter((w) => w.closureAuditorStatus === 'Reopened' || w.status === 'Reopened').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" /> Core Module 10: Closure Auditor
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300">
                Rule-Based Independent Verification
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Evidence-Grounded Repair Verification
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Verify work orders against mandatory photographic standards, video proof, and asset recurrence history before granting official closure.
              When proof is inadequate, repairs are classified as <strong>Unverified</strong> without presumption of fault.
            </p>
          </div>

          <button
            onClick={() => setShowPolicyModal(!showPolicyModal)}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-2"
          >
            <Sliders className="w-4 h-4 text-teal-300" />
            Configurable Verification Rules
          </button>
        </div>
      </div>

      {/* Policy Rules Drawer / Box (if opened) */}
      {showPolicyModal && (
        <div className="bg-slate-50 border border-teal-300 rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Municipal Verification Policy Rules</h3>
              <p className="text-xs text-slate-500">Configurable threshold parameters applied by the backend auditor engine.</p>
            </div>
            <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 text-[11px] font-bold rounded-lg">
              Policy Set: Zone 4 Drainage Standard v2026.3
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Video Proof Requirement</span>
              <p className="text-slate-500">LiveWork video walkthrough mandatory for all de-silting and culvert operations.</p>
              <div className="text-teal-600 font-bold text-[11px]">Enforced: Active</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Tri-Stage Photo Set</span>
              <p className="text-slate-500">Requires minimum 1 Before, 1 During, and 1 After photo.</p>
              <div className="text-teal-600 font-bold text-[11px]">Enforced: Active</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Repeat-Failure Warning</span>
              <p className="text-slate-500">Flags assets with &gt;1 failure in 60-day window for mandatory engineer review.</p>
              <div className="text-amber-600 font-bold text-[11px]">Enforced: Warning Flag</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Unverified Grace Status</span>
              <p className="text-slate-500">Missing evidence flags task as Unverified; does not issue disciplinary charge.</p>
              <div className="text-emerald-600 font-bold text-[11px]">Fairness Policy: Enabled</div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter(statusFilter === 'Under Review' ? 'All' : 'Under Review')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'Under Review'
              ? 'bg-blue-600 text-white shadow-md border-blue-600'
              : 'bg-white border-slate-200 text-slate-900 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Clock className={`w-4 h-4 ${statusFilter === 'Under Review' ? 'text-white' : 'text-blue-600'}`} />
            <span className="text-xl font-black">{countUnderReview}</span>
          </div>
          <div className="text-xs font-bold mt-2">Under Review</div>
          <div className={`text-[10px] ${statusFilter === 'Under Review' ? 'text-blue-100' : 'text-slate-400'}`}>Submitted by field crew</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'Unverified' ? 'All' : 'Unverified')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'Unverified'
              ? 'bg-amber-600 text-white shadow-md border-amber-600'
              : 'bg-white border-slate-200 text-slate-900 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <AlertTriangle className={`w-4 h-4 ${statusFilter === 'Unverified' ? 'text-white' : 'text-amber-600'}`} />
            <span className="text-xl font-black">{countUnverified}</span>
          </div>
          <div className="text-xs font-bold mt-2">Unverified</div>
          <div className={`text-[10px] ${statusFilter === 'Unverified' ? 'text-amber-100' : 'text-slate-400'}`}>Insufficient evidence</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'Incomplete' ? 'All' : 'Incomplete')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'Incomplete'
              ? 'bg-rose-600 text-white shadow-md border-rose-600'
              : 'bg-white border-slate-200 text-slate-900 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <XCircle className={`w-4 h-4 ${statusFilter === 'Incomplete' ? 'text-white' : 'text-rose-600'}`} />
            <span className="text-xl font-black">{countIncomplete}</span>
          </div>
          <div className="text-xs font-bold mt-2">Incomplete</div>
          <div className={`text-[10px] ${statusFilter === 'Incomplete' ? 'text-rose-100' : 'text-slate-400'}`}>Missing required photos/notes</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'Approved' ? 'All' : 'Approved')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'Approved'
              ? 'bg-emerald-600 text-white shadow-md border-emerald-600'
              : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <CheckCircle2 className={`w-4 h-4 ${statusFilter === 'Approved' ? 'text-white' : 'text-emerald-600'}`} />
            <span className="text-xl font-black">{countApproved}</span>
          </div>
          <div className="text-xs font-bold mt-2">Approved</div>
          <div className={`text-[10px] ${statusFilter === 'Approved' ? 'text-emerald-100' : 'text-slate-400'}`}>Engineer signed-off</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'Reopened' ? 'All' : 'Reopened')}
          className={`p-4 rounded-2xl border text-left transition col-span-2 sm:col-span-1 ${
            statusFilter === 'Reopened'
              ? 'bg-purple-600 text-white shadow-md border-purple-600'
              : 'bg-white border-slate-200 text-slate-900 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <RotateCcw className={`w-4 h-4 ${statusFilter === 'Reopened' ? 'text-white' : 'text-purple-600'}`} />
            <span className="text-xl font-black">{countReopened}</span>
          </div>
          <div className="text-xs font-bold mt-2">Reopened</div>
          <div className={`text-[10px] ${statusFilter === 'Reopened' ? 'text-purple-100' : 'text-slate-400'}`}>Recurrence alert</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by WO#, Asset ID, or worker name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 text-xs border border-slate-200 rounded-xl outline-none bg-white font-medium"
          >
            <option value="All">All Audited Cases</option>
            <option value="Under Review">Under Review</option>
            <option value="Unverified">Unverified (Insufficient Evidence)</option>
            <option value="Incomplete">Incomplete</option>
            <option value="Approved">Approved</option>
            <option value="Reopened">Reopened</option>
          </select>

          <button
            onClick={fetchWorkOrders}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
            <RefreshCw className="w-6 h-6 text-teal-600 animate-spin mx-auto" />
            <p className="text-xs font-bold">Evaluating closure rules against database evidence...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            No work orders match the selected filter criteria.
          </div>
        ) : (
          filteredOrders.map((wo) => {
            const isExpanded = expandedId === wo.workOrderId;
            const auditorStatus = wo.closureAuditorStatus || 'Incomplete';
            const beforeCount = wo.beforeEvidence?.length || 0;
            const duringCount = wo.duringEvidence?.length || 0;
            const afterCount = wo.afterEvidence?.length || 0;
            const videoCount = wo.videoEvidence?.length || 0;
            const hasNotes = Boolean(wo.completionNotes && wo.completionNotes.trim().length > 10);

            return (
              <div
                key={wo.workOrderId}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden"
              >
                {/* Main Card Summary */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                        {wo.workOrderId}
                      </span>
                      <Link
                        to={`/assets`}
                        className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md hover:bg-slate-200 transition"
                      >
                        Asset: {wo.assetId}
                      </Link>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          wo.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {wo.priority} Priority
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{wo.repairType}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Assigned Squad: <strong className="text-slate-700">{wo.assignedWorkerName || 'Field Squad'}</strong> • Status:{' '}
                        <span className="font-semibold text-slate-800">{wo.status}</span>
                      </p>
                    </div>

                    {/* Evidence Checklist Mini Indicators */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                          beforeCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        <Camera className="w-3 h-3" /> Before ({beforeCount})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                          duringCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Camera className="w-3 h-3" /> During ({duringCount})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                          afterCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        <Camera className="w-3 h-3" /> After ({afterCount})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                          videoCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        <Video className="w-3 h-3" /> Video ({videoCount > 0 ? 'Submitted' : 'Missing'})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                          hasNotes ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        <FileText className="w-3 h-3" /> Notes ({hasNotes ? 'Logged' : 'Missing'})
                      </span>
                    </div>
                  </div>

                  {/* Auditor Status Pill & Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="text-left sm:text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          auditorStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : auditorStatus === 'Under Review'
                            ? 'bg-blue-100 text-blue-800'
                            : auditorStatus === 'Unverified'
                            ? 'bg-amber-100 text-amber-800'
                            : auditorStatus === 'Reopened'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {auditorStatus === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {auditorStatus === 'Under Review' && <Clock className="w-3.5 h-3.5" />}
                        {auditorStatus === 'Unverified' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {auditorStatus === 'Incomplete' && <XCircle className="w-3.5 h-3.5" />}
                        {auditorStatus === 'Reopened' && <RotateCcw className="w-3.5 h-3.5" />}
                        Auditor: {auditorStatus}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {wo.closureAuditorFlags?.length || 0} Rule Flags Recorded
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : wo.workOrderId)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isExpanded ? 'Hide Evidence' : 'Inspect Evidence'}
                      </button>

                      {/* Quick decision triggers */}
                      {wo.status !== 'Approved' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenDecisionModal(wo, 'Approve')}
                            className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-xs"
                            title="Sign-off and Approve"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenDecisionModal(wo, 'Unverified')}
                            className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition shadow-xs"
                            title="Mark Unverified (Insufficient Evidence)"
                          >
                            Unverified
                          </button>
                          <button
                            onClick={() => handleOpenDecisionModal(wo, 'Return')}
                            className="px-3 py-1.5 text-xs font-bold bg-slate-700 hover:bg-slate-800 text-white rounded-xl transition shadow-xs"
                            title="Return for Revisions"
                          >
                            Return
                          </button>
                        </div>
                      )}

                      {wo.status === 'Approved' && (
                        <button
                          onClick={() => handleOpenDecisionModal(wo, 'Reopen')}
                          className="px-3 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition shadow-xs flex items-center gap-1"
                          title="Reopen Work Order"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reopen
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Evidence & Rule Violations Tray */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-5 space-y-4">
                    {/* Auditor Flags */}
                    {wo.closureAuditorFlags && wo.closureAuditorFlags.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Auditor Flag Evaluation ({wo.closureAuditorFlags.length})
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {wo.closureAuditorFlags.map((flag: any, i: number) => (
                            <div
                              key={i}
                              className={`p-3 rounded-xl border text-xs space-y-1 ${
                                flag.severity === 'error'
                                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                                  : flag.severity === 'warning'
                                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                                  : 'bg-blue-50 border-blue-200 text-blue-900'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold">
                                <span>{flag.rule}</span>
                                <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.2 rounded bg-white/70">
                                  {flag.severity}
                                </span>
                              </div>
                              <p className="text-slate-600 leading-normal">{flag.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>All mandatory closure evidence criteria passed without rule violations.</span>
                      </div>
                    )}

                    {/* Photo Previews */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>Before Photos</span>
                          <span className="text-slate-400 font-mono">({beforeCount})</span>
                        </span>
                        {beforeCount > 0 ? (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {wo.beforeEvidence.map((ev: any, idx: number) => (
                              <img
                                key={idx}
                                src={ev.url}
                                alt="Before evidence"
                                className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-rose-600 italic">No pre-repair baseline photos submitted.</p>
                        )}
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>During Photos</span>
                          <span className="text-slate-400 font-mono">({duringCount})</span>
                        </span>
                        {duringCount > 0 ? (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {wo.duringEvidence.map((ev: any, idx: number) => (
                              <img
                                key={idx}
                                src={ev.url}
                                alt="During evidence"
                                className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No in-progress photos recorded.</p>
                        )}
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>After Photos</span>
                          <span className="text-slate-400 font-mono">({afterCount})</span>
                        </span>
                        {afterCount > 0 ? (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {wo.afterEvidence.map((ev: any, idx: number) => (
                              <img
                                key={idx}
                                src={ev.url}
                                alt="After evidence"
                                className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-rose-600 italic">No post-repair clear-invert photos submitted.</p>
                        )}
                      </div>
                    </div>

                    {/* Worker Notes & Materials */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <span className="font-bold text-slate-800">Field Crew Completion Notes:</span>
                      <p className="text-slate-600 italic leading-relaxed">
                        {wo.completionNotes || 'No narrative notes logged by field crew.'}
                      </p>
                      {wo.materialsUsed && wo.materialsUsed.length > 0 && (
                        <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="font-semibold text-slate-500">Materials:</span>
                          {wo.materialsUsed.map((m: any, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {m.name} ({m.quantity} {m.unit})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Decision Modal */}
      {modalTask && modalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                  {modalTask.workOrderId}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {modalType === 'Approve' && 'Official Repair Closure Approval'}
                  {modalType === 'Unverified' && 'Label Repair as Unverified'}
                  {modalType === 'Return' && 'Return Work Order for Revisions'}
                  {modalType === 'Reopen' && 'Reopen Work Order (Recurrence Alert)'}
                </h3>
              </div>
              <button
                onClick={() => setModalTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                <strong>Asset:</strong> {modalTask.assetId} • <strong>Repair Type:</strong> {modalTask.repairType}
              </p>
              {modalType === 'Unverified' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                  <strong>Fairness Policy Notice:</strong> Marking this repair as unverified documents that the photographic or video proof is insufficient to verify clear invert. It does not issue a formal breach against the worker.
                </div>
              )}
              {modalType === 'Reopen' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900">
                  <strong>Recurrence Alert:</strong> Reopening this task will reset its status to Reopened, trigger a repeat failure alert, and update linked citizen complaints.
                </div>
              )}
            </div>

            {/* Documented Engineering Reason Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Documented Reason & Audit Log Justification: <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Enter engineering rationale for this closure status decision..."
                className="w-full p-3 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-normal leading-relaxed"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setModalTask(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>

              <button
                onClick={handleExecuteDecision}
                disabled={submittingDecision || !decisionNotes.trim()}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl transition shadow-md flex items-center gap-1.5 disabled:opacity-50 ${
                  modalType === 'Approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : modalType === 'Unverified'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : modalType === 'Reopen'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-slate-800 hover:bg-slate-900'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                {submittingDecision ? 'Recording Decision...' : 'Commit Closure Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
