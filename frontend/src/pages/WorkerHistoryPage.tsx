import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  Search,
  Filter,
  RefreshCw,
  Send,
  Eye,
  FileText
} from 'lucide-react';

export const WorkerHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Revision Modal State
  const [revisionTask, setRevisionTask] = useState<any | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.workOrders.myTasks();
      setTasks(res.data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenRevisionModal = (task: any) => {
    setRevisionTask(task);
    setRevisionNotes('');
  };

  const handleSubmitRevision = async () => {
    if (!revisionTask || !revisionNotes.trim()) {
      alert('Please describe what revisions or additional evidence you are providing.');
      return;
    }

    setSubmittingRevision(true);
    try {
      await api.workOrders.submitRevision(revisionTask.workOrderId, { notes: revisionNotes.trim() });
      alert(`Revision successfully recorded and resubmitted for engineering review.`);
      setRevisionTask(null);
      setRevisionNotes('');
      await fetchTasks();
    } catch (err: any) {
      alert('Error submitting revision: ' + err.message);
    } finally {
      setSubmittingRevision(false);
    }
  };

  const filtered = tasks.filter((t) => {
    const matchesSearch =
      t.workOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.problemDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-teal-600" />
            Inspection History & Revisions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historical record of previous assignments, engineer review feedback, and auditable revision resubmissions.
          </p>
        </div>

        <button
          onClick={fetchTasks}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh History
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past work orders by ID or Asset..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 text-xs border border-slate-200 rounded-xl outline-none bg-white font-medium"
          >
            <option value="All">All Records</option>
            <option value="Approved">Approved (Verified Complete)</option>
            <option value="Submitted for Review">Submitted for Review</option>
            <option value="Returned for More Evidence">Returned for More Evidence</option>
            <option value="In Progress">In Progress</option>
            <option value="Paused">Paused</option>
          </select>
        </div>
      </div>

      {/* History Cards */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600" />
          <p className="text-xs font-semibold">Loading inspection history...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No History Records Found</h3>
          <p className="text-xs text-slate-500">No work orders match the selected filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((task) => {
            const isApproved = task.status === 'Approved';
            const isReturned = task.status === 'Returned for More Evidence';
            const revisions = task.revisions || [];

            return (
              <div
                key={task.workOrderId}
                className={`bg-white rounded-2xl border p-5 transition shadow-xs space-y-3 ${
                  isReturned
                    ? 'border-rose-300 bg-rose-50/10'
                    : isApproved
                    ? 'border-emerald-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-extrabold text-sm text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                      {task.workOrderId}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      Asset {task.assetId}
                    </span>
                    <span className="text-xs text-slate-500">
                      Completed: {new Date(task.reviewedAt || task.updatedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      isApproved
                        ? 'bg-emerald-100 text-emerald-800'
                        : isReturned
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {isReturned && <AlertTriangle className="w-3.5 h-3.5" />}
                    {task.status}
                  </span>
                </div>

                {/* Description & Repair Type */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{task.repairType}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{task.problemDescription}</p>
                </div>

                {/* Engineer Comments / Feedback Box */}
                {task.engineerComments && (
                  <div
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      isReturned
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {isReturned ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      <span>Municipal Engineer Review Feedback:</span>
                    </div>
                    <p className="leading-relaxed pl-5">{task.engineerComments}</p>
                  </div>
                )}

                {/* Revisions History Log (if any) */}
                {revisions.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <span className="font-bold text-slate-700 block">
                      Auditable Revision History ({revisions.length}):
                    </span>
                    <ul className="space-y-1 pl-2">
                      {revisions.map((rev: any, rIdx: number) => (
                        <li key={rIdx} className="text-slate-600 flex items-start gap-2">
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded shrink-0">
                            Rev #{rev.revisionNumber || rIdx + 1}
                          </span>
                          <span>{rev.notes}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions row */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>Before Photos: <strong>{task.beforeEvidence?.length || 0}</strong></span>
                    <span>After Photos: <strong>{task.afterEvidence?.length || 0}</strong></span>
                    <span>Videos: <strong>{task.videoEvidence?.length || 0}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* If task is returned, worker can submit an auditable revision */}
                    {isReturned && (
                      <button
                        onClick={() => handleOpenRevisionModal(task)}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Submit Revision
                      </button>
                    )}

                    <Link
                      to={`/worker/tasks/${task.workOrderId}`}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> Full Audit Record
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Auditable Revision Modal */}
      {revisionTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600">
              <RotateCcw className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">
                Submit Auditable Revision ({revisionTask.workOrderId})
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Municipal engineering requested additional evidence. Rather than overwriting past records, this
              submission logs an immutable revision entry and resubmits the task for engineering review.
            </p>

            {revisionTask.engineerComments && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-0.5">
                <strong className="block">Engineer Feedback Note:</strong>
                <p>{revisionTask.engineerComments}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Correction & Revision Notes: <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Describe corrective actions taken, additional downstream photos attached, flume velocity test re-performed..."
                className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRevisionTask(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!revisionNotes.trim() || submittingRevision}
                onClick={handleSubmitRevision}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                {submittingRevision ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Recording Revision...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Submit Revision for Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
