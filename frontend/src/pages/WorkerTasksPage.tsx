import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Search,
  Filter,
  Play,
  Pause,
  Send,
  Camera,
  Video,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export const WorkerTasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Pause modal
  const [pauseModalTask, setPauseModalTask] = useState<any | null>(null);
  const [pauseReason, setPauseReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.workOrders.myTasks();
      setTasks(res.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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
      alert('Please enter a valid pause reason.');
      return;
    }
    try {
      setActionLoading(true);
      await api.workOrders.updateStatus(pauseModalTask.workOrderId, {
        status: 'Paused',
        pauseReason: pauseReason.trim(),
        note: `Paused: ${pauseReason.trim()}`
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

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.workOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.problemDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-teal-600" />
            My Assigned Tasks
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accept, execute, pause, and submit assigned municipal infrastructure repair tasks.
          </p>
        </div>

        <button
          onClick={fetchTasks}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Tasks
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by WO#, Asset ID, or description..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 text-xs border border-slate-200 rounded-xl outline-none bg-white font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Assigned">Assigned (Ready to Start)</option>
              <option value="In Progress">In Progress (Active)</option>
              <option value="Paused">Paused (On Hold)</option>
              <option value="Submitted for Review">Submitted for Review</option>
              <option value="Approved">Approved (Verified)</option>
              <option value="Returned for More Evidence">Returned for More Evidence</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium shrink-0">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full p-2 text-xs border border-slate-200 rounded-xl outline-none bg-white font-medium"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600" />
          <p className="text-xs font-semibold">Loading assigned tasks from municipal database...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Matching Tasks Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You do not have any tasks matching the current filters. Adjust your filters or check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isAssigned = task.status === 'Assigned';
            const isInProgress = task.status === 'In Progress';
            const isPaused = task.status === 'Paused';
            const isSubmitted = task.status === 'Submitted for Review';
            const isApproved = task.status === 'Approved';
            const isReturned = task.status === 'Returned for More Evidence';

            return (
              <div
                key={task.workOrderId}
                className={`bg-white rounded-2xl border p-5 transition shadow-xs hover:shadow-md space-y-3 ${
                  task.priority === 'Urgent'
                    ? 'border-rose-200 bg-rose-50/20'
                    : isInProgress
                    ? 'border-teal-300'
                    : 'border-slate-200'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-extrabold text-sm text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                      {task.workOrderId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      Asset: {task.assetId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        task.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : task.priority === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                    {task.linkedComplaintIds && task.linkedComplaintIds.length > 0 && (
                      <span className="text-[11px] text-slate-500">
                        ({task.linkedComplaintIds.length} Linked Citizen Report{task.linkedComplaintIds.length > 1 ? 's' : ''})
                      </span>
                    )}
                  </div>

                  {/* Status Pill */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isInProgress
                          ? 'bg-blue-100 text-blue-800'
                          : isPaused
                          ? 'bg-orange-100 text-orange-800'
                          : isSubmitted
                          ? 'bg-purple-100 text-purple-800'
                          : isReturned
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isInProgress && <Clock className="w-3.5 h-3.5 animate-spin" />}
                      {isPaused && <Pause className="w-3.5 h-3.5" />}
                      {task.status}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{task.repairType}</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{task.problemDescription}</p>
                </div>

                {/* Pause Reason if paused */}
                {isPaused && task.pauseReason && (
                  <div className="p-2.5 bg-orange-50 rounded-xl border border-orange-200 text-xs text-orange-900 flex items-center gap-2">
                    <Pause className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>
                      <strong>Pause Reason:</strong> {task.pauseReason}
                    </span>
                  </div>
                )}

                {/* Returned Comments if returned */}
                {isReturned && (
                  <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      <strong>Engineer Returned Task:</strong> {task.engineerComments || 'Additional proof of clear culvert invert required.'}
                    </span>
                  </div>
                )}

                {/* Metadata & Actions row */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-slate-500">
                    <span>Deadline: {new Date(task.dueDate || Date.now()).toLocaleDateString()}</span>
                    <span>Auditor: <strong className="text-slate-800">{task.closureAuditorStatus}</strong></span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status action buttons */}
                    {isAssigned && (
                      <button
                        onClick={() => handleStartTask(task.workOrderId)}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" /> Accept & Start
                      </button>
                    )}

                    {isInProgress && (
                      <>
                        <button
                          onClick={() => setPauseModalTask(task)}
                          disabled={actionLoading}
                          className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs"
                        >
                          <Pause className="w-3.5 h-3.5" /> Pause
                        </button>
                        <Link
                          to={`/worker/tasks/${task.workOrderId}`}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit for Review
                        </Link>
                      </>
                    )}

                    {isPaused && (
                      <button
                        onClick={() => handleResumeTask(task.workOrderId)}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" /> Resume Work
                      </button>
                    )}

                    {isReturned && (
                      <Link
                        to={`/worker/tasks/${task.workOrderId}`}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Submit Revision
                      </Link>
                    )}

                    <Link
                      to={`/worker/photos?task=${task.workOrderId}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1 transition"
                      title="Upload Photos"
                    >
                      <Camera className="w-3.5 h-3.5 text-teal-600" /> Photos
                    </Link>

                    <Link
                      to={`/worker/tasks/${task.workOrderId}`}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center gap-1 transition"
                    >
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
