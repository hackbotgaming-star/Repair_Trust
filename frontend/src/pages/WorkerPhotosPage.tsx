import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ShieldCheck,
  ArrowRight,
  Layers,
  Info
} from 'lucide-react';

export const WorkerPhotosPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [activeStage, setActiveStage] = useState<'before' | 'during' | 'after'>('before');

  // Media capture & upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const initialTaskId = searchParams.get('task') || 'WO-2026-003';

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.workOrders.myTasks();
      const myTasks = res.data || [];
      setTasks(myTasks);
      const found = myTasks.find((t: any) => t.workOrderId === initialTaskId) || myTasks[0];
      setSelectedTask(found || null);
    } catch (err) {
      console.error('Error loading tasks:', err);
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

  // Browser Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      alert('Camera access denied or unavailable. Please use file upload.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `worker_${activeStage}_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setPhotoFile(file);
          setPhotoPreview(URL.createObjectURL(blob));
        }
      }, 'image/jpeg');
    }
    const stream = videoRef.current.srcObject as MediaStream;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setIsCameraActive(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setPhotoFile(f);
      setPhotoPreview(URL.createObjectURL(f));
    }
  };

  const handleUploadEvidence = async () => {
    if (!selectedTask) return;
    if (!photoFile) {
      alert('Please snap or select a photo first.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('stage', activeStage);
      formData.append('caption', caption || `${activeStage.toUpperCase()} evidence for ${selectedTask.workOrderId}`);
      formData.append('file', photoFile);

      await api.workOrders.addEvidence(selectedTask.workOrderId, formData);

      // Refresh task
      const updated = await api.workOrders.get(selectedTask.workOrderId);
      setSelectedTask(updated.data);

      // Reset upload state
      setPhotoFile(null);
      setPhotoPreview(null);
      setCaption('');
      alert(`Successfully saved ${activeStage} evidence photo to ${selectedTask.workOrderId}!`);
    } catch (err: any) {
      alert('Error uploading evidence: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const stageEvidenceList =
    activeStage === 'before'
      ? selectedTask?.beforeEvidence || []
      : activeStage === 'during'
      ? selectedTask?.duringEvidence || []
      : selectedTask?.afterEvidence || [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Camera className="w-6 h-6 text-teal-600" />
            Before / During / After Photos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture and upload multi-stage photographic evidence with cryptographic hash integrity and duplicate screening.
          </p>
        </div>

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

      {/* 3-Stage Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => {
            setActiveStage('before');
            setPhotoFile(null);
            setPhotoPreview(null);
          }}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeStage === 'before'
              ? 'bg-white text-teal-900 shadow-sm border border-slate-200/80 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>📸 1. Before Repair</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
            {selectedTask?.beforeEvidence?.length || 0} Photos
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveStage('during');
            setPhotoFile(null);
            setPhotoPreview(null);
          }}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeStage === 'during'
              ? 'bg-white text-teal-900 shadow-sm border border-slate-200/80 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>⚙ 2. During Operations</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
            {selectedTask?.duringEvidence?.length || 0} Photos
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveStage('after');
            setPhotoFile(null);
            setPhotoPreview(null);
          }}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeStage === 'after'
              ? 'bg-white text-teal-900 shadow-sm border border-slate-200/80 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>✓ 3. After Repair & Flow Test</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
            {selectedTask?.afterEvidence?.length || 0} Photos
          </span>
        </button>
      </div>

      {/* Stage Explanatory Callout */}
      <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-950 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="block font-bold">
            {activeStage === 'before'
              ? 'Mandatory Baseline Condition Documentation'
              : activeStage === 'during'
              ? 'Active Operation & Extraction Proof'
              : 'Post-Completion Hydraulic Invert Verification'}
          </strong>
          <p className="text-teal-900/90 leading-relaxed">
            {activeStage === 'before'
              ? 'Photographs of the pre-existing blockage, silt depth, structural cracks, or choked grates before commencing work.'
              : activeStage === 'during'
              ? 'Photographs documenting gully sucker operation, high-pressure jetting, debris extraction, or mortar patching in progress.'
              : 'Photographs proving the culvert flume and drain invert are completely clean with restored stormwater flow.'}
          </p>
        </div>
      </div>

      {/* Capture / Upload Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Upload className="w-4 h-4 text-teal-600" />
          Add {activeStage.toUpperCase()} Evidence Photo to {selectedTask?.workOrderId}
        </h3>

        {/* Live Camera Viewport */}
        {isCameraActive && (
          <div className="relative bg-slate-950 rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-slate-800">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
            <button
              type="button"
              onClick={capturePhoto}
              className="absolute bottom-4 px-6 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg flex items-center gap-2"
            >
              <Camera className="w-4 h-4" /> Snap Photo Now
            </button>
          </div>
        )}

        {/* Photo Preview */}
        {photoPreview && !isCameraActive && (
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden aspect-video max-h-64 bg-slate-100 border border-slate-200">
              <img src={photoPreview} alt="Evidence preview" className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 font-medium">
                Ready for upload: <strong>{photoFile?.name}</strong> ({(photoFile ? photoFile.size / 1024 : 0).toFixed(1)} KB)
              </span>
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="text-rose-600 hover:underline font-bold"
              >
                Cancel & Retake
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Caption / Observation Note:
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Invert cleared to bare concrete. Flow unobstructed."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="button"
              onClick={handleUploadEvidence}
              disabled={uploading}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Screening & Saving Evidence...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Upload {activeStage.toUpperCase()} Evidence
                </>
              )}
            </button>
          </div>
        )}

        {/* Camera or File Buttons */}
        {!photoPreview && !isCameraActive && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={startCamera}
              className="p-5 rounded-2xl border-2 border-dashed border-teal-500 bg-teal-50/50 hover:bg-teal-100/50 text-teal-900 font-bold text-xs flex flex-col items-center justify-center gap-2 transition"
            >
              <Camera className="w-6 h-6 text-teal-600" />
              <span>Use Device Camera</span>
              <span className="text-[10px] text-teal-600/80 font-normal">Take photo directly at site</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex flex-col items-center justify-center gap-2 transition"
            >
              <Upload className="w-6 h-6 text-slate-500" />
              <span>Upload Photo From Device</span>
              <span className="text-[10px] text-slate-400 font-normal">JPEG, PNG, WebP supported</span>
            </button>
          </div>
        )}
      </div>

      {/* Existing Evidence Photos Gallery for this Stage */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <span>{activeStage.toUpperCase()} Photos Attached ({stageEvidenceList.length})</span>
        </h3>

        {stageEvidenceList.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No {activeStage} photos recorded yet</p>
            <p className="text-[11px] text-slate-400">Use the buttons above to attach evidence.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {stageEvidenceList.map((item: any, idx: number) => (
              <div key={idx} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-xs space-y-2">
                <div className="aspect-video bg-slate-900 relative">
                  <img src={item.url} alt={item.caption || 'Evidence'} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {new Date(item.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
                <div className="p-3 text-xs space-y-1">
                  <p className="font-semibold text-slate-800 line-clamp-1">{item.caption || 'Field evidence'}</p>
                  {item.sha256Hash && (
                    <div className="font-mono text-[10px] text-slate-400 truncate">
                      SHA: {item.sha256Hash.slice(0, 16)}...
                    </div>
                  )}
                  {item.screeningStatus && (
                    <div className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-teal-600" /> {item.screeningStatus}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
