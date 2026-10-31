import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { CameraRecorder } from '../components/livework/CameraRecorder';
import { VideoPlayer } from '../components/livework/VideoPlayer';
import {
  Video,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Info,
  ArrowRight,
  Filter,
  Film
} from 'lucide-react';

export const WorkerLiveWorkProofPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewScope, setViewScope] = useState<'ACTIVE_TASK' | 'ALL_VIDEOS'>('ACTIVE_TASK');

  const initialTaskId = searchParams.get('task') || 'WO-2026-003';

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Try myTasks first
      const tasksRes = await api.workOrders.myTasks();
      let taskList = tasksRes.data || [];

      // 2. Fall back to all active work orders so any role (engineer, admin, worker) can operate the station
      if (taskList.length === 0) {
        const allRes = await api.workOrders.list({ limit: 50 });
        taskList = allRes.data || [];
      }
      setTasks(taskList);

      const targetId = searchParams.get('task') || initialTaskId;
      const found = taskList.find((t: any) => t.workOrderId === targetId) || taskList[0] || null;
      setSelectedTask(found);

      // 3. Load all videos
      const videosRes = await api.videos.list();
      setVideos(videosRes.data || []);
    } catch (err) {
      console.error('Error loading tasks or videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTaskChange = (taskId: string) => {
    const t = tasks.find((item) => item.workOrderId === taskId);
    if (t) {
      setSelectedTask(t);
      setSearchParams({ task: taskId });
    }
  };

  const relevantVideos = videos.filter(
    (v) => selectedTask && v.workOrderId === selectedTask.workOrderId
  );

  const displayedVideos = viewScope === 'ALL_VIDEOS' ? videos : relevantVideos;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              CORE MODULE 3
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500">LiveWork Proof Video Verification</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Video className="w-6 h-6 text-rose-600" />
            LiveWork Proof Video Station
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture or upload authentic before, during, and after repair video walkthroughs for municipal engineering audit.
          </p>
        </div>

        {/* Task Selector */}
        {tasks.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Active Work Order:</span>
            <select
              value={selectedTask?.workOrderId || ''}
              onChange={(e) => handleTaskChange(e.target.value)}
              className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-xs"
            >
              {tasks.map((t) => {
                const vidCount = videos.filter((v) => v.workOrderId === t.workOrderId).length;
                return (
                  <option key={t.workOrderId} value={t.workOrderId}>
                    {t.workOrderId} &bull; {t.assetId} — {t.repairType || t.status} {vidCount > 0 ? `(${vidCount} video${vidCount > 1 ? 's' : ''})` : ''}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* Mandatory Scientific Integrity Disclaimer */}
      <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-950 space-y-1 shadow-xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Scientific Media Authenticity Disclaimer</span>
        </div>
        <p className="text-teal-900/90 leading-relaxed">
          In accordance with municipal accountability standards, <strong>a GPS coordinate or camera timestamp does not
          prove authenticity on its own</strong>. Video submissions undergo cryptographic SHA-256 binary validation,
          and final verification requires independent physical inspection and sign-off by a licensed Municipal Engineer.
        </p>
      </div>

      {/* Recorder Component */}
      {selectedTask ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Target Repair Assignment:</span>
              <h3 className="text-sm font-bold text-slate-900">
                {selectedTask.workOrderId}: {selectedTask.repairType} on Asset {selectedTask.assetId}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedTask.problemDescription}</p>
            </div>
            <Link
              to={`/work-orders/${selectedTask.workOrderId}`}
              className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200 transition"
            >
              Inspect Work Order <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <CameraRecorder
            workOrderId={selectedTask.workOrderId}
            assetId={selectedTask.assetId}
            onUploadSuccess={() => loadData()}
          />
        </div>
      ) : loading ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 animate-pulse text-slate-400">
          Loading assigned work order details...
        </div>
      ) : null}

      {/* Submitted Proof Footage Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4 text-rose-600" />
              {viewScope === 'ACTIVE_TASK'
                ? `Submitted Proof Footage for ${selectedTask?.workOrderId || 'Current Task'} (${relevantVideos.length})`
                : `All Municipal Proof Footage (${videos.length})`}
            </h3>

            {/* Scope Filter Buttons */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewScope('ACTIVE_TASK')}
                className={`px-2.5 py-1 rounded-md transition ${
                  viewScope === 'ACTIVE_TASK'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Current Task ({relevantVideos.length})
              </button>
              <button
                type="button"
                onClick={() => setViewScope('ALL_VIDEOS')}
                className={`px-2.5 py-1 rounded-md transition ${
                  viewScope === 'ALL_VIDEOS'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Videos ({videos.length})
              </button>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {displayedVideos.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No Video Proof Submitted Yet for this Task</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              This task currently flags a Closure Auditor missing video proof warning. Record a live video walkthrough above or upload a footage file.
            </p>
            {videos.length > 0 && viewScope === 'ACTIVE_TASK' && (
              <button
                type="button"
                onClick={() => setViewScope('ALL_VIDEOS')}
                className="mt-2 text-xs font-bold text-teal-600 hover:underline inline-flex items-center gap-1"
              >
                View {videos.length} other verified videos in the registry &rarr;
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedVideos.map((vid) => (
              <VideoPlayer key={vid.videoId} video={vid} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
