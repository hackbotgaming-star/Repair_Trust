import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GoogleMapStaticViewer } from '../components/map/GoogleMapStaticViewer';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  Camera,
  Video,
  Play,
  Pause,
  MapPin,
  ArrowLeft,
  FileSpreadsheet,
  ShieldCheck,
  RefreshCw,
  Info,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

export const WorkerTaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [targetId, setTargetId] = useState<string>(id || 'WO-2026-003');
  const [order, setOrder] = useState<any | null>(null);
  const [asset, setAsset] = useState<any | null>(null);
  const [auditorResult, setAuditorResult] = useState<any | null>(null);
  const [linkedComplaints, setLinkedComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Status & modal states
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrderDetails = async (workOrderId: string) => {
    try {
      setLoading(true);
      const res = await api.workOrders.get(workOrderId);
      setOrder(res.data);
      setAuditorResult(res.auditorEvaluation);

      if (res.data?.assetId) {
        const assetRes = await api.assets.get(res.data.assetId);
        setAsset(assetRes.data);
      }

      // Fetch linked complaints if any
      if (res.data?.linkedComplaintIds?.length > 0) {
        const fetched: any[] = [];
        for (const cId of res.data.linkedComplaintIds) {
          try {
            const cRes = await api.complaints.v1Get(cId);
            if (cRes.data) fetched.push(cRes.data);
          } catch {}
        }
        setLinkedComplaints(fetched);
      }
    } catch (err: any) {
      console.error('Error fetching task details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails(id || 'WO-2026-003');
  }, [id]);

  const handleStartWork = async () => {
    if (!order) return;
    try {
      setActionLoading(true);
      await api.workOrders.updateStatus(order.workOrderId, { status: 'In Progress', note: 'Worker started work on site' });
      await fetchOrderDetails(order.workOrderId);
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseWork = async () => {
    if (!order || !pauseReason.trim()) {
      alert('Please enter a pause reason.');
      return;
    }
    try {
      setActionLoading(true);
      await api.workOrders.updateStatus(order.workOrderId, {
        status: 'Paused',
        pauseReason: pauseReason.trim(),
        note: `Paused: ${pauseReason.trim()}`
      });
      setIsPauseOpen(false);
      setPauseReason('');
      await fetchOrderDetails(order.workOrderId);
    } catch (err: any) {
      alert('Error pausing work: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!order) return;
    if (!window.confirm('Are you ready to submit this work order for independent engineering review?')) return;
    try {
      setActionLoading(true);
      await api.workOrders.submitForReview(order.workOrderId);
      await fetchOrderDetails(order.workOrderId);
      alert('Work order successfully submitted for engineering review.');
    } catch (err: any) {
      alert('Error submitting work order: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600" />
        <p className="text-xs font-semibold">Loading Work Order details and asset history...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-2xl border border-slate-200 mt-8 space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="font-bold text-slate-800 text-sm">Work Order Not Found</h3>
        <p className="text-xs text-slate-500">Could not retrieve work order details for ID {targetId}.</p>
        <Link to="/worker/tasks" className="inline-block px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold">
          Return to My Tasks
        </Link>
      </div>
    );
  }

  const coordinates = asset?.location?.coordinates || { lat: 12.9716, lng: 77.5946 };
  const checklist = order.requiredEvidenceChecklist || {};

  const hasBefore = order.beforeEvidence && order.beforeEvidence.length > 0;
  const hasDuring = order.duringEvidence && order.duringEvidence.length > 0;
  const hasAfter = order.afterEvidence && order.afterEvidence.length > 0;
  const hasVideo = order.videoEvidence && order.videoEvidence.length > 0;
  const hasNotes = Boolean(order.completionNotes && order.completionNotes.trim().length > 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top back & actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/worker/tasks"
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Tasks
        </Link>

        {/* Status transition action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {order.status === 'Assigned' && (
            <button
              onClick={handleStartWork}
              disabled={actionLoading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5" /> Accept & Start Work
            </button>
          )}

          {order.status === 'In Progress' && (
            <>
              <button
                onClick={() => setIsPauseOpen(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Pause className="w-3.5 h-3.5" /> Pause Work Order
              </button>
              <button
                onClick={handleSubmitForReview}
                disabled={actionLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Submit for Engineer Review
              </button>
            </>
          )}

          {order.status === 'Paused' && (
            <button
              onClick={handleStartWork}
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5" /> Resume Work Order
            </button>
          )}
        </div>
      </div>

      {/* Main Work Order Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-xl font-mono font-extrabold text-teal-900 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
              {order.workOrderId}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {order.priority} Priority
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
              Status: {order.status}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Assigned: <strong>{order.assignedWorkerName}</strong></span>
            <span>Target Deadline: <strong>{new Date(order.dueDate || Date.now()).toLocaleDateString()}</strong></span>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">{order.repairType}</h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-4xl">{order.problemDescription}</p>
        </div>

        {/* CRITICAL MUNICIPAL RULE: Distinction between Task and Verified Outcome */}
        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block font-bold">Public Verification Notice (MERN Municipal Standard)</strong>
            <p className="text-teal-900/90 leading-relaxed">
              Completing a repair task does <em>not</em> mark an infrastructure failure as verified. In accordance with
              scientific accountability rules, a work order transitions to <strong>"Submitted for Review"</strong> and must
              be independently inspected and signed off by a licensed Municipal Engineer before closure.
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Checklist, Photos, Notes, Linked Reports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Required Evidence Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Required Evidence Checklist
              </h3>
              <span className="text-xs font-bold text-slate-600">
                Auditor Status:{' '}
                <strong
                  className={
                    order.closureAuditorStatus === 'Approved'
                      ? 'text-emerald-700'
                      : order.closureAuditorStatus === 'Complete'
                      ? 'text-teal-700'
                      : 'text-amber-700'
                  }
                >
                  {order.closureAuditorStatus}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  hasBefore ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>Pre-Repair Baseline Photo</span>
                </div>
                <span className={`font-bold ${hasBefore ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {hasBefore ? '✓ Attached' : 'Missing'}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  hasDuring ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>During-Operation Photo</span>
                </div>
                <span className={`font-bold ${hasDuring ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {hasDuring ? '✓ Attached' : 'Missing'}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  hasAfter ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>Post-Repair Flow Test Photo</span>
                </div>
                <span className={`font-bold ${hasAfter ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {hasAfter ? '✓ Attached' : 'Missing'}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  hasVideo ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-slate-500" />
                  <span>LiveWork Proof Video</span>
                </div>
                <span className={`font-bold ${hasVideo ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {hasVideo ? '✓ Attached' : 'Missing'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <Link
                to={`/worker/photos?task=${order.workOrderId}`}
                className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold border border-teal-200 flex items-center gap-1.5 transition"
              >
                <Camera className="w-3.5 h-3.5" /> Manage Photos Station
              </Link>
              <Link
                to={`/worker/livework?task=${order.workOrderId}`}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-bold border border-rose-200 flex items-center gap-1.5 transition"
              >
                <Video className="w-3.5 h-3.5" /> Record LiveWork Video
              </Link>
              <Link
                to={`/worker/materials?task=${order.workOrderId}`}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Log Materials & Diary
              </Link>
            </div>
          </div>

          {/* Linked Citizen Complaints Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              Linked Citizen Reports ({linkedComplaints.length})
            </h3>

            {linkedComplaints.length === 0 ? (
              <p className="text-xs text-slate-400">No linked citizen reports for this work order.</p>
            ) : (
              <div className="space-y-3">
                {linkedComplaints.map((c) => (
                  <div key={c.complaintId} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-teal-900">{c.complaintId}</span>
                      <span className="text-slate-500">Reported: {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{c.description}</p>
                    {c.photos && c.photos.length > 0 && (
                      <div className="flex gap-2 pt-1 overflow-x-auto">
                        {c.photos.map((p: string, idx: number) => (
                          <img
                            key={idx}
                            src={p}
                            alt="Citizen photo"
                            className="w-16 h-12 object-cover rounded-lg border border-slate-300 shrink-0"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Asset Location & Memory Graph info */}
        <div className="space-y-6">
          {/* Asset Location Mini Map */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-600" />
              Site Location ({order.assetId})
            </h3>

            <GoogleMapStaticViewer
              position={{ lat: coordinates.lat, lng: coordinates.lng }}
              title={order.assetId}
              height="192px"
            />

            <div className="text-xs space-y-1 text-slate-600">
              <div>Street: <strong className="text-slate-800">{asset?.location?.street || '12th Cross, MG Avenue'}</strong></div>
              <div>Ward: <strong className="text-slate-800">{asset?.location?.ward || 'Ward 4 (Central)'}</strong></div>
              <div>Coordinates: <span className="font-mono text-[11px]">{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</span></div>
            </div>

            <Link
              to="/worker/check-in"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-400" /> Go to Site Check-in
            </Link>
          </div>

          {/* Asset Provenance & History Summary */}
          {asset && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Asset History & Characteristics
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Asset Type:</span>
                  <strong className="text-slate-800">{asset.type}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Capacity Ratio:</span>
                  <strong className="text-slate-800">{asset.capacityRatio || '0.62'}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Debris Severity Index:</span>
                  <strong className="text-rose-700">{asset.debrisSeverityIndex || '78'}/100</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Repeat Failure Pattern:</span>
                  <span className="font-bold text-amber-700">
                    {asset.repeatFailureFlag ? `Yes (${asset.repeatFailureCount || 3} incidents)` : 'None'}
                  </span>
                </div>
              </div>

              {asset.repeatFailureFlag && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                  <strong>Warning from Municipal Engineering:</strong>
                  <p>
                    This asset has experienced recurring overflow despite multiple cleanings. LiveWork Proof video and
                    downstream invert flow test are strictly mandatory before submission.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pause Modal */}
      {isPauseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-orange-600">
              <Pause className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Pause Work Order</h3>
            </div>

            <p className="text-xs text-slate-500">
              Please enter the operational reason for pausing field work. This note will be recorded in the audit trail.
            </p>

            <div>
              <textarea
                rows={3}
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                placeholder="e.g. Heavy rain flooding work area; excavator malfunction; awaiting traffic police clearance..."
                className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPauseOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!pauseReason.trim() || actionLoading}
                onClick={handlePauseWork}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Confirm Pause
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
