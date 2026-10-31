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
  ArrowRight
} from 'lucide-react';

export const WorkerLiveWorkProofPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const initialTaskId = searchParams.get('task') || 'WO-2026-003';

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, videosRes] = await Promise.all([
        api.workOrders.myTasks(),
        api.videos.list()
      ]);
      const myTasks = tasksRes.data || [];
      setTasks(myTasks);

      const found = myTasks.find((t: any) => t.workOrderId === initialTaskId) || myTasks[0];
      setSelectedTask(found || null);
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
    if (t) setSelectedTask(t);
  };

  const relevantVideos = videos.filter(
    (v) => selectedTask && v.workOrderId === selectedTask.workOrderId
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
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
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-mono font-bold outline-none focus:ring-2 focus:ring-teal-500"
            >
              {tasks.map((t) => (
                <option key={t.workOrderId} value={t.workOrderId}>
                  {t.workOrderId} — {t.assetId} ({t.status})
                </option>
              ))}
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
      {selectedTask && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Target Repair Assignment:</span>
              <h3 className="text-sm font-bold text-slate-900">
                {selectedTask.workOrderId}: {selectedTask.repairType} on Asset {selectedTask.assetId}
              </h3>
            </div>
            <Link
              to={`/worker/tasks/${selectedTask.workOrderId}`}
              className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
            >
              Task Details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <CameraRecorder
            workOrderId={selectedTask.workOrderId}
            assetId={selectedTask.assetId}
            onUploadSuccess={() => loadData()}
          />
        </div>
      )}

      {/* Submitted Proof Footage for Active Task */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Video className="w-4 h-4 text-rose-600" />
            Submitted Proof Footage for {selectedTask?.workOrderId || 'Current Task'} ({relevantVideos.length})
          </h3>
          <button
            onClick={loadData}
            disabled={loading}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {relevantVideos.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No Video Proof Submitted Yet</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              This task currently flags a Closure Auditor missing video proof warning. Record a live video or upload a file above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantVideos.map((vid) => (
              <VideoPlayer key={vid.videoId} video={vid} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
