import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Video,
  Camera,
  MapPin,
  ArrowRight,
  RefreshCw,
  Play,
  Pause,
  Send,
  ShieldCheck,
  User,
  HardHat,
  Compass,
  FileSpreadsheet
} from 'lucide-react';

export const FieldWorkerHomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pauseModalTask, setPauseModalTask] = useState<any | null>(null);
  const [pauseReason, setPauseReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.workOrders.myTasks();
      setTasks(res.data || []);
    } catch (err) {
      console.error('Error fetching worker tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Compute metrics
  const assignedCount = tasks.filter((t) => t.status === 'Assigned').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const pausedCount = tasks.filter((t) => t.status === 'Paused').length;
  const submittedCount = tasks.filter((t) => t.status === 'Submitted for Review').length;
  const approvedCount = tasks.filter((t) => t.status === 'Approved').length;
  const urgentCount = tasks.filter((t) => t.priority === 'Urgent').length;

  // Active priority task (e.g. WO-2026-003 or first in progress/assigned)
  const activeTask =
    tasks.find((t) => t.workOrderId === 'WO-2026-003') ||
    tasks.find((t) => t.status === 'In Progress') ||
    tasks.find((t) => t.status === 'Assigned') ||
    tasks[0];

  const handleStartTask = async (workOrderId: string) => {
    try {
      setActionLoading(true);
      await api.workOrders.updateStatus(workOrderId, { status: 'In Progress', note: 'Worker started field operation' });
      await fetchTasks();
    } catch (err: any) {
      alert('Error starting task: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseTask = async () => {
    if (!pauseModalTask || !pauseReason.trim()) {
      alert('Please provide a reason for pausing the task.');
      return;
    }
    try {
      setActionLoading(true);
      await api.workOrders.updateStatus(pauseModalTask.workOrderId, {
        status: 'Paused',
        pauseReason: pauseReason.trim(),
        note: `Paused work: ${pauseReason.trim()}`
      });
      setPauseModalTask(null);
      setPauseReason('');
      await fetchTasks();
    } catch (err: any) {
      alert('Error pausing task: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeTask = async (workOrderId: string) => {
    try {
      setActionLoading(true);
      await api.workOrders.updateStatus(workOrderId, { status: 'In Progress', note: 'Worker resumed field operation' });
      await fetchTasks();
    } catch (err: any) {
      alert('Error resuming task: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Worker Banner - Light Civic Theme */}
      <div className="bg-gradient-to-br from-amber-500/10 via-teal-50/50 to-emerald-500/10 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-teal-200/70 relative overflow-hidden card-pop">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-600/10 text-teal-800 text-xs font-bold border border-teal-500/30">
              <HardHat className="w-3.5 h-3.5 text-teal-600" />
              <span>Zone 4 Field Maintenance Squad B</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back, {user?.name || 'Ramesh Kumar'}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium">
              Field Worker Station: Track assigned infrastructure repair tasks, record authentic multi-stage evidence,
              conduct mobile site inspections, and submit completed work for independent engineering review.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              to="/worker/tasks"
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition btn-pop"
            >
              <Wrench className="w-4 h-4" /> My Tasks ({tasks.length})
            </Link>
            <Link
              to="/worker/check-in"
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 flex items-center gap-2 transition hover-pop shadow-xs"
            >
              <MapPin className="w-4 h-4 text-teal-600" /> Site Check-in
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs card-pop hover-pop">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assigned</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{assignedCount}</div>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">Ready to start</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs card-pop hover-pop">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-900">{inProgressCount}</div>
          <p className="text-[11px] text-blue-600 font-medium mt-0.5">Active on site</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs card-pop hover-pop">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">On Hold</span>
            <Pause className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-extrabold text-orange-900">{pausedCount}</div>
          <p className="text-[11px] text-orange-600 font-medium mt-0.5">Paused with reason</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs card-pop hover-pop">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Under Review</span>
            <Send className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-900">{submittedCount}</div>
          <p className="text-[11px] text-purple-600 font-medium mt-0.5">Awaiting engineer</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs card-pop hover-pop">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-900">{approvedCount}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Verified complete</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs card-pop hover-pop">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Urgent Priority</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-900">{urgentCount}</div>
          <p className="text-[11px] text-rose-600 font-medium mt-0.5">High hazard tasks</p>
        </div>
      </div>

      {/* Active Priority Work Order Feature Card */}
      {activeTask && (
        <div className="bg-white rounded-2xl border-2 border-teal-600/30 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold bg-teal-100 text-teal-900">
                {activeTask.workOrderId}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  activeTask.priority === 'Urgent'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {activeTask.priority} Priority
              </span>
              <span className="text-xs font-semibold text-slate-500">Asset: {activeTask.assetId}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Current Status:</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800">
                {activeTask.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {activeTask.repairType}: {activeTask.problemDescription}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Crew</span>
                  <strong className="text-slate-800 font-semibold">{activeTask.assignedWorkerName}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Deadline</span>
                  <strong className="text-slate-800 font-semibold">
                    {new Date(activeTask.dueDate || Date.now()).toLocaleDateString()}
                  </strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Closure Auditor</span>
                  <span
                    className={`font-bold ${
                      activeTask.closureAuditorStatus === 'Approved'
                        ? 'text-emerald-700'
                        : activeTask.closureAuditorStatus === 'Complete'
                        ? 'text-teal-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {activeTask.closureAuditorStatus || 'Incomplete'}
                  </span>
                </div>
              </div>

              {/* Closure Auditor flags notice */}
              {activeTask.closureAuditorFlags && activeTask.closureAuditorFlags.length > 0 && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Required Evidence Actions Before Sign-Off:
                  </span>
                  <ul className="list-disc pl-4 text-amber-800 space-y-0.5">
                    {activeTask.closureAuditorFlags.slice(0, 3).map((f: any, idx: number) => (
                      <li key={idx}>
                        <strong>{f.rule}:</strong> {f.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quick Actions for active task */}
            <div className="flex flex-col justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Field Operations Actions:
              </span>

              <div className="flex flex-col gap-2">
                {activeTask.status === 'Assigned' && (
                  <button
                    onClick={() => handleStartTask(activeTask.workOrderId)}
                    disabled={actionLoading}
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" /> Accept & Start Work
                  </button>
                )}

                {activeTask.status === 'In Progress' && (
                  <>
                    <button
                      onClick={() => setPauseModalTask(activeTask)}
                      disabled={actionLoading}
                      className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Pause className="w-3.5 h-3.5" /> Pause Work Order
                    </button>
                    <Link
                      to={`/worker/tasks/${activeTask.workOrderId}`}
                      className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit for Review
                    </Link>
                  </>
                )}

                {activeTask.status === 'Paused' && (
                  <button
                    onClick={() => handleResumeTask(activeTask.workOrderId)}
                    disabled={actionLoading}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" /> Resume Work
                  </button>
                )}

                <Link
                  to={`/worker/photos?task=${activeTask.workOrderId}`}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5 text-teal-600" /> Before/After Photos
                </Link>

                <Link
                  to={`/worker/livework?task=${activeTask.workOrderId}`}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Video className="w-3.5 h-3.5 text-rose-600" /> Record LiveWork Proof
                </Link>

                <Link
                  to={`/worker/tasks/${activeTask.workOrderId}`}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 text-center"
                >
                  Full Work Order Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Field Worker Functional Hub Navigation Tiles (11 Sections) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Field Worker Operations Hub</h2>
          <span className="text-xs text-slate-400">Select an operational module to open directly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Link
            to="/worker/tasks"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition">
              <Wrench className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">My Assigned Tasks</h4>
            <p className="text-[11px] text-slate-500">
              Filter by priority, accept, pause with reason, and submit active tasks.
            </p>
          </Link>

          <Link
            to="/worker/work-order"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Work Order Details</h4>
            <p className="text-[11px] text-slate-500">
              Inspect linked complaints, asset profile, engineer notes, and repair checklist.
            </p>
          </Link>

          <Link
            to="/worker/inspection"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Site Inspection</h4>
            <p className="text-[11px] text-slate-500">
              Log silt depth, flow velocity, damage notes, and auto-captured GPS fixes.
            </p>
          </Link>

          <Link
            to="/worker/livework"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition">
              <Video className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">LiveWork Proof</h4>
            <p className="text-[11px] text-slate-500">
              Record live camera walkthroughs with tamper-evident SHA-256 checksums.
            </p>
          </Link>

          <Link
            to="/worker/photos"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <Camera className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Before / During / After Photos</h4>
            <p className="text-[11px] text-slate-500">
              Multi-stage photo gallery satisfying mandatory closure auditor checklists.
            </p>
          </Link>

          <Link
            to="/worker/materials"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Repair Materials & Notes</h4>
            <p className="text-[11px] text-slate-500">
              Record equipment utilized, bags of mortar, replacement grates, and field diary.
            </p>
          </Link>

          <Link
            to="/worker/check-in"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition space-y-2 group card-pop hover-pop"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Location & Check-in</h4>
            <p className="text-[11px] text-slate-500">
              Municipal Cadastral GIS navigation and GPS check-in with manual override fallback.
            </p>
          </Link>

          <Link
            to="/worker/history"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Inspection History & Revisions</h4>
            <p className="text-[11px] text-slate-500">
              View past verified repairs, engineer review decisions, and revision notes.
            </p>
          </Link>
        </div>
      </div>

      {/* Pause Reason Modal */}
      {pauseModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-orange-600">
              <Pause className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">
                Pause Work Order ({pauseModalTask.workOrderId})
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              In accordance with municipal accountability standards, pausing an active field task requires a clear
              recorded explanation in the audit log.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Pause:
              </label>
              <textarea
                rows={3}
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                placeholder="e.g. Heavy torrential rain causing safety hazard; waiting for high-capacity submersible pump; utility electrical cable exposed in trench..."
                className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPauseModalTask(null);
                  setPauseReason('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!pauseReason.trim() || actionLoading}
                onClick={handlePauseTask}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
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
