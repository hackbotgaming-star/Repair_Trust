import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Search,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Info,
  Clock,
  Layers,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';

export const CitizenDisputePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [complaintId, setComplaintId] = useState(searchParams.get('id') || '');
  const [complaintData, setComplaintData] = useState<any>(null);
  const [loadingComplaint, setLoadingComplaint] = useState(false);

  // Form state
  const [disputeReasonPreset, setDisputeReasonPreset] = useState('Water accumulated immediately after next rain');
  const [customReason, setCustomReason] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchComplaint = async (targetId: string) => {
    if (!targetId.trim()) return;
    setLoadingComplaint(true);
    setErrorMsg(null);
    try {
      const res = await api.complaints.v1Get(targetId.trim());
      setComplaintData(res.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Complaint ID not found in municipal registry.');
      setComplaintData(null);
    } finally {
      setLoadingComplaint(false);
    }
  };

  useEffect(() => {
    if (complaintId) {
      fetchComplaint(complaintId);
    }
  }, [complaintId]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintData) return;

    const finalReason = customReason.trim()
      ? `${disputeReasonPreset}: ${customReason}`
      : disputeReasonPreset;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('reason', finalReason);
      formData.append('notes', customReason);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await api.complaints.reopen(complaintData.complaintId, formData);
      setSuccessResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit dispute/reopening.');
    } finally {
      setSubmitting(false);
    }
  };

  const presets = [
    'Water accumulated immediately after next rain',
    'Pothole filled with loose gravel only; disintegrated under traffic',
    'Debris was only cleared on the surface; deep culvert remains blocked',
    'Marked completed without crew present on site',
    'Structural hazard or damaged grate left unaddressed',
    'Other failure recurrence'
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            Citizen Oversight & Accountability
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Reopen or Dispute an Incomplete Repair</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            A department marking work "completed" does not mean the issue is fixed. If the underlying problem continues, challenge the repair with new evidence to generate an immutable recurrence record.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Success Screen */}
        {successResult ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 rounded-2xl border border-emerald-300 shadow-md text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Repair Dispute Registered!</h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Original complaint <span className="font-mono font-bold text-slate-800">{successResult.complaint?.complaintId}</span> has been permanently re-opened and updated to <strong>REOPENED</strong> status.
            </p>

            {successResult.followUpComplaint && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Linked Follow-Up Recurrence:</span>
                <div className="font-mono text-base font-extrabold text-teal-700">
                  {successResult.followUpComplaint.complaintId}
                </div>
                <div className="text-xs text-slate-500">
                  Preserved in the municipal provenance graph and assigned for independent engineering investigation.
                </div>
              </div>
            )}

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/track/${successResult.complaint?.complaintId}`}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                Track Original Complaint
                <ArrowRight className="w-4 h-4 text-teal-300" />
              </Link>
              <Link
                to="/citizen/my-complaints"
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition"
              >
                View My Complaints
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Step 1: Select Complaint */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-teal-600" />
                1. Select Complaint Reference ID to Challenge
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value.toUpperCase())}
                  placeholder="e.g. CMP-2026-0045 or CMP-2026-0089"
                  className="flex-1 p-3 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono uppercase focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => fetchComplaint(complaintId)}
                  disabled={loadingComplaint || !complaintId.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5"
                >
                  {loadingComplaint ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Load Details'}
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Complaint summary preview if loaded */}
              {complaintData && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-sm">{complaintData.complaintId}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">
                      Current Status: {complaintData.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Category:</span> {complaintData.category}
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Location:</span> {complaintData.location?.street} (
                    {complaintData.location?.ward})
                  </div>
                  <p className="text-slate-600 italic">"{complaintData.description}"</p>
                </div>
              )}
            </div>

            {/* Step 2: Dispute Grounds & Evidence */}
            {complaintData && (
              <form onSubmit={handleSubmitReopen} className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  2. Grounds for Reopening / Post-Repair Failure Evidence
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Select Primary Failure Mode *
                  </label>
                  <select
                    value={disputeReasonPreset}
                    onChange={(e) => setDisputeReasonPreset(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
                  >
                    {presets.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Detailed Observations / Conditions When Failure Re-occurred
                  </label>
                  <textarea
                    rows={4}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="e.g., During rainfall today at 2 PM, water accumulated again within 20 minutes to a depth of 25cm. The drain grate was cleaned on the surface, but the underlying pipe appears blocked downstream."
                    className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>

                {/* Evidence Photo Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Attach Recent Photo Evidence of Continued Failure (Recommended)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-rose-400 bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition">
                      <Camera className="w-4 h-4 text-rose-600" />
                      <span>{photoFile ? photoFile.name : 'Choose or capture photo'}</span>
                      <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                    </label>
                    {photoPreview && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-300 shadow-xs">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Uploaded photos will undergo SHA-256 screening and perceptual duplicate validation.
                  </p>
                </div>

                {/* Legal & Civic Transparency Notice */}
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    Civic Right to Real Fixes
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Submitting this form re-opens complaint {complaintData.complaintId} and logs an append-only event in the tamper-evident ledger. Municipal officers are notified to schedule a targeted engineering inspection rather than re-authorizing superficial surface work.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Recording Dispute & Chained Event...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Confirm Dispute & Reopen Repair
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
