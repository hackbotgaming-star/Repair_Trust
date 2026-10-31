import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { WorkOrder, Asset, AuditorFlag } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { AuditorEvaluationPanel } from '../components/auditor/AuditorEvaluationPanel';
import { CameraRecorder } from '../components/livework/CameraRecorder';
import { VideoPlayer } from '../components/livework/VideoPlayer';
import {
  Wrench,
  Calendar,
  Layers,
  ArrowRight,
  HardHat,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Plus,
  RefreshCw,
  Clock,
  Compass
} from 'lucide-react';

export const WorkOrderDetailPage: React.FC = () => {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const { role, user } = useAuth();

  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [auditorData, setAuditorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Worker inputs
  const [notes, setNotes] = useState('');
  const [materials, setMaterials] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoStage, setPhotoStage] = useState<'before' | 'during' | 'after'>('before');
  const [photoCaption, setPhotoCaption] = useState('');
  const [submittingPhoto, setSubmittingPhoto] = useState(false);

  // Engineer review inputs
  const [engineerDecision, setEngineerDecision] = useState<'Approved' | 'Returned'>('Approved');
  const [engineerComments, setEngineerComments] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!workOrderId) return;
    try {
      setLoading(true);
      const res = await api.workOrders.get(workOrderId);
      setOrder(res.data);
      setAuditorData(res.auditorEvaluation);
      setNotes(res.data.completionNotes || '');

      // Also fetch linked asset details
      if (res.data.assetId) {
        const assetRes = await api.assets.get(res.data.assetId);
        setAsset(assetRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch work order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [workOrderId]);

  // Worker adds photo evidence
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workOrderId || !photoUrl.trim()) return;
    setSubmittingPhoto(true);
    try {
      const res = await api.workOrders.addEvidence(workOrderId, {
        stage: photoStage,
        url: photoUrl.trim(),
        caption: photoCaption.trim()
      });
      setOrder(res.data);
      setAuditorData(res.auditorEvaluation);
      setPhotoUrl('');
      setPhotoCaption('');
    } catch (err: any) {
      alert('Error adding evidence: ' + err.message);
    } finally {
      setSubmittingPhoto(false);
    }
  };

  // Worker updates progress and notes
  const handleSaveProgress = async () => {
    if (!workOrderId) return;
    try {
      const res = await api.workOrders.updateProgress(workOrderId, {
        status: 'In Progress',
        completionNotes: notes,
        materialsUsed: materials ? [{ item: materials, quantity: '1 set' }] : undefined
      });
      setOrder(res.data);
      setAuditorData(res.auditorEvaluation);
      alert('Work order progress saved.');
    } catch (err: any) {
      alert('Error saving progress: ' + err.message);
    }
  };

  // Worker submits for review (Core Module 21 Step 7)
  const handleSubmitForReview = async () => {
    if (!workOrderId) return;
    if (!window.confirm('Submit work order for Municipal Engineer review?')) return;
    try {
      const res = await api.workOrders.submitForReview(workOrderId);
      setOrder(res.data);
      setAuditorData(res.auditorEvaluation);
      alert(res.message);
    } catch (err: any) {
      alert('Error submitting: ' + err.message);
    }
  };

  // Engineer review decision (Core Module 21 Step 10)
  const handleEngineerReview = async () => {
    if (!workOrderId) return;
    setReviewing(true);
    try {
      const res = await api.workOrders.review(workOrderId, {
        decision: engineerDecision,
        comments: engineerComments
      });
      setOrder(res.data);
      setReviewSuccess(`Decision '${engineerDecision}' successfully recorded!`);
      setTimeout(() => {
        setReviewSuccess(null);
      }, 4000);
    } catch (err: any) {
      alert('Review error: ' + err.message);
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="h-48 bg-slate-200 rounded-2xl"></div>
        <div className="h-96 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-slate-500 max-w-md mx-auto">
        <p className="font-bold text-slate-800 text-lg">Work Order Not Found</p>
        <Link to="/work-orders" className="text-teal-600 font-semibold text-xs mt-2 block">
          &larr; Back to Work Orders List
        </Link>
      </div>
    );
  }

  const evidenceCounts = {
    beforeCount: order.beforeEvidence?.length || 0,
    duringCount: order.duringEvidence?.length || 0,
    afterCount: order.afterEvidence?.length || 0,
    videoCount: order.videoEvidence?.length || 0,
    hasNotes: Boolean(order.completionNotes && order.completionNotes.trim().length > 10)
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link to="/work-orders" className="text-xs text-slate-400 hover:text-slate-600">
              Work Orders
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-mono text-xs font-bold text-teal-800">{order.workOrderId}</span>
            <span className="text-slate-300">&bull;</span>
            <StatusBadge status={order.status} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{order.repairType}</h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Asset: <strong className="text-slate-700">{order.assetId}</strong>
            <span className="text-slate-300">&bull;</span>
            <span>Squad: {order.assignedTeam}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/memory-graph?assetId=${order.assetId}`}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-teal-400" /> View {order.assetId} Memory Graph
          </Link>
          <Link
            to={`/investigations?assetId=${order.assetId}`}
            className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" /> Root Cause Engine
          </Link>
        </div>
      </div>

      {/* Asset Repeat Failure Context Banner */}
      {asset && asset.repeatFailureFlag && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-4 text-xs text-amber-900 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-amber-950 block mb-0.5">
                Repeat Failure Flagged on Asset {asset.assetId} ({asset.name})
              </strong>
              <p className="opacity-90 leading-relaxed">
                This asset has undergone {asset.repeatFailureCount} previous cleaning cycles with recurring overflow reports. The Evidence-Gap Engine recommends inspecting the downstream connection to determine if backflow is causing the recurring blockage.
              </p>
            </div>
          </div>
          <Link
            to={`/investigations?assetId=${asset.assetId}`}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 transition"
          >
            See Root Cause
          </Link>
        </div>
      )}

      {/* Two Column Layout: Main Workspace + Closure Auditor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Evidence Submission & Review */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Order Problem Description & Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Problem Description</h3>
            <p className="text-sm text-slate-800 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-200">
              {order.problemDescription}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-2">
              <div>
                <span className="text-slate-400 block mb-0.5">Assigned Worker</span>
                <span className="font-semibold text-slate-800">{order.assignedWorkerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Priority</span>
                <span className="font-semibold text-rose-600 uppercase font-mono">{order.priority}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Due Date</span>
                <span className="font-semibold text-slate-800">
                  {new Date(order.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* LiveWork Proof Video Section */}
          <div className="space-y-4">
            <CameraRecorder
              workOrderId={order.workOrderId}
              assetId={order.assetId}
              onUploadSuccess={() => fetchOrder()}
            />

            {/* Existing Submitted Videos */}
            {order.videoEvidence && order.videoEvidence.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">
                  Submitted LiveWork Proof Footage ({order.videoEvidence.length})
                </h4>
                {order.videoEvidence.map((vid) => (
                  <VideoPlayer key={vid.videoId || vid._id} video={vid} />
                ))}
              </div>
            )}
          </div>

          {/* Photo Evidence Submission Form (Before, During, After) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Photographic Evidence Documentation</h3>
              <span className="text-xs text-slate-400 font-mono">
                {evidenceCounts.beforeCount + evidenceCounts.afterCount} Photos Logged
              </span>
            </div>

            {/* Add Photo Form */}
            <form onSubmit={handleAddPhoto} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <select
                  value={photoStage}
                  onChange={(e) => setPhotoStage(e.target.value as any)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-semibold text-slate-700 outline-none"
                >
                  <option value="before">Pre-Work (Before)</option>
                  <option value="during">In-Progress (During)</option>
                  <option value="after">Post-Repair (After)</option>
                </select>

                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Photo URL or CDN reference..."
                  className="md:col-span-2 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="Caption (e.g. Cleared culvert invert bed with unobstructed invert flow)..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={submittingPhoto || !photoUrl.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Photo
                </button>
              </div>

              {/* Sample Photo Presets for quick hackathon evaluation */}
              <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span className="font-semibold">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoStage('before');
                    setPhotoUrl('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80');
                    setPhotoCaption('Pre-work silt accumulation blocking 60% of inlet');
                  }}
                  className="text-teal-600 hover:underline"
                >
                  + Before Photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoStage('after');
                    setPhotoUrl('https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=600&q=80');
                    setPhotoCaption('Post-cleaning clear concrete invert with active drainage');
                  }}
                  className="text-teal-600 hover:underline"
                >
                  + After Photo
                </button>
              </div>
            </form>

            {/* Display Photos Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before Gallery */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Pre-Repair Baseline ({order.beforeEvidence?.length || 0})
                </span>
                {order.beforeEvidence && order.beforeEvidence.length > 0 ? (
                  <div className="space-y-2">
                    {order.beforeEvidence.map((ev, i) => (
                      <div key={i} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        {ev.type === 'video' || (ev.url && (ev.url.endsWith('.webm') || ev.url.endsWith('.mp4'))) ? (
                          <video src={ev.url} controls className="w-full h-32 object-contain bg-slate-950" />
                        ) : (
                          <img src={ev.url} alt="Before evidence" className="w-full h-32 object-cover" />
                        )}
                        <div className="p-2 text-[11px] text-slate-600">{ev.caption}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs italic">
                    No before photos submitted yet.
                  </div>
                )}
              </div>

              {/* After Gallery */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Post-Repair Invert ({order.afterEvidence?.length || 0})
                </span>
                {order.afterEvidence && order.afterEvidence.length > 0 ? (
                  <div className="space-y-2">
                    {order.afterEvidence.map((ev, i) => (
                      <div key={i} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        {ev.type === 'video' || (ev.url && (ev.url.endsWith('.webm') || ev.url.endsWith('.mp4'))) ? (
                          <video src={ev.url} controls className="w-full h-32 object-contain bg-slate-950" />
                        ) : (
                          <img src={ev.url} alt="After evidence" className="w-full h-32 object-cover" />
                        )}
                        <div className="p-2 text-[11px] text-slate-600">{ev.caption}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs italic">
                    No after photos submitted yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Worker Completion Notes Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900">Worker Field Notes & Materials Used</h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe actions taken, approximate cubic meters of silt extracted, invert flow condition..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <input
                type="text"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="Materials / Equipment used (e.g. Vacuum Tanker, High Pressure Jetting Hose)..."
                className="flex-1 min-w-[200px] px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveProgress}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Save Field Progress
                </button>
                <button
                  type="button"
                  onClick={handleSubmitForReview}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Work Order for Review
                </button>
              </div>
            </div>
          </div>

          {/* Engineer Review & Sign-Off Section (Core Module 21 Step 8 & 10) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md border border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div>
                <h3 className="text-base font-bold">Municipal Engineer Decision & Sign-Off</h3>
                <p className="text-xs text-slate-400">
                  Authorized engineer evaluation following review of LiveWork Proof video and Closure Auditor report.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-900/50 px-2 py-0.5 rounded border border-teal-700">
                ENGINEER PORTAL
              </span>
            </div>

            {reviewSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{reviewSuccess}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Engineering Decision:
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEngineerDecision('Approved')}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      engineerDecision === 'Approved'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Sign Off Repair
                  </button>

                  <button
                    type="button"
                    onClick={() => setEngineerDecision('Returned')}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      engineerDecision === 'Returned'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> Return for More Evidence
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Engineer Comments & Review Findings:
                </label>
                <textarea
                  rows={3}
                  value={engineerComments}
                  onChange={(e) => setEngineerComments(e.target.value)}
                  placeholder="Record verification notes, invert clearance confirmation, or specific required additional evidence..."
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-400">
                  Current Status: <span className="font-semibold text-white">{order.status}</span>
                </div>
                <button
                  type="button"
                  onClick={handleEngineerReview}
                  disabled={reviewing}
                  className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  {reviewing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Recording Decision...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Record Official Engineering Decision
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Closure Auditor & Audit Log */}
        <div className="space-y-6">
          {/* Closure Auditor Live Verification Panel */}
          <AuditorEvaluationPanel
            status={auditorData?.closureAuditorStatus || order.closureAuditorStatus}
            flags={auditorData?.closureAuditorFlags || order.closureAuditorFlags}
            checklist={order.requiredEvidenceChecklist}
            evidenceCounts={evidenceCounts}
          />

          {/* Audit History Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Work Order Audit Trail
            </h3>

            <div className="space-y-3">
              {order.auditLog && order.auditLog.map((log, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.action.replace('_', ' ')}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.note || 'Status updated'}</p>
                  <div className="text-[10px] text-slate-400 font-mono">
                    By: {log.performedBy} ({log.role})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
