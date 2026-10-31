import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck,
  ShieldCheck,
  Building2,
  Lock,
  Sliders,
  CheckCircle2,
  FileText,
  Key,
  HardHat,
  Bell,
  Smartphone,
  Save
} from 'lucide-react';

export const EngineerProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Engineer config state
  const [closureThreshold, setClosureThreshold] = useState('2');
  const [observationWindow, setObservationWindow] = useState('60');
  const [requireLiveVideo, setRequireLiveVideo] = useState(true);
  const [autoFlagRepeats, setAutoFlagRepeats] = useState(true);
  const [monsoonStrictMode, setMonsoonStrictMode] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5 text-teal-300" /> Executive Engineering Profile
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300">
                Verified Sign-Off Authority
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Engineer Identity & Verification Settings
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manage your engineering credentials, digital closure seal, and decision-support parameters for the Evidence-Gap Engine and Closure Auditor.
            </p>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">Engineering verification settings updated and stored securely.</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{user?.name || 'Municipal Engineer'}</h2>
              <p className="text-xs text-slate-500">{user?.email || 'engineer@repairtrust.gov'}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-100 text-teal-800">
                  Role: Municipal Engineer
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                  ID: ENG-402
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
            <div className="text-slate-400 font-semibold text-[10px] uppercase">Jurisdiction & Division</div>
            <div className="font-bold text-slate-800">Zone 4 (Central & Industrial Wards)</div>
            <div className="text-slate-500">Stormwater Drainage & Arterial Fluvial Management</div>
          </div>
        </div>

        {/* Digital Signature & Verification Key Status */}
        <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-teal-900 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-teal-700" /> Digital Closure Signing Key
            </span>
            <p className="text-slate-600">
              Active cryptographic key utilized to seal approved work orders and hash verify closure determinations.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-teal-300 font-mono text-teal-800 font-bold shrink-0 text-center">
            SHA-256 Seal: ENG-402-ACTIVE
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSaveSettings} className="space-y-6 pt-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Decision-Support Engine Rules Configuration</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize algorithmic sensitivity thresholds applied across the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Repeat Failure Threshold */}
            <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">
                Repeat Failure Trigger Count:
              </label>
              <select
                value={closureThreshold}
                onChange={(e) => setClosureThreshold(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-medium bg-white"
              >
                <option value="1">&gt; 1 failure within observation window</option>
                <option value="2">&gt; 2 failures within observation window (Standard)</option>
                <option value="3">&gt; 3 failures within observation window (Tolerant)</option>
              </select>
              <p className="text-slate-400 text-[11px]">
                Assets exceeding this count trigger an automatic CCTV probe recommendation by the Evidence-Gap Engine.
              </p>
            </div>

            {/* Observation Window */}
            <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">
                Observation Window (Days):
              </label>
              <select
                value={observationWindow}
                onChange={(e) => setObservationWindow(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-medium bg-white"
              >
                <option value="30">30 Days (Short-term)</option>
                <option value="60">60 Days (Municipal Standard)</option>
                <option value="90">90 Days (Quarterly Monsoonal)</option>
              </select>
              <p className="text-slate-400 text-[11px]">
                Window period used to compute eligible asset recurrence rates and correlation with rainfall events.
              </p>
            </div>
          </div>

          {/* Verification Toggles */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800">Verification Strictness Toggles</h4>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900 text-xs">Mandatory LiveWork Video Proof</div>
                  <div className="text-[11px] text-slate-500">Require video proof before work orders can be marked Complete.</div>
                </div>
                <input
                  type="checkbox"
                  checked={requireLiveVideo}
                  onChange={(e) => setRequireLiveVideo(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900 text-xs">Monsoon Strictness Mode</div>
                  <div className="text-[11px] text-slate-500">Enforces cross-sectional flow inspection on all arterial storm drains.</div>
                </div>
                <input
                  type="checkbox"
                  checked={monsoonStrictMode}
                  onChange={(e) => setMonsoonStrictMode(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900 text-xs">Citizen Recurrence Reopening Protocol</div>
                  <div className="text-[11px] text-slate-500">Allows citizens to reopen complaints with new photos within 30 days of closure.</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoFlagRepeats}
                  onChange={(e) => setAutoFlagRepeats(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Engineering Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
