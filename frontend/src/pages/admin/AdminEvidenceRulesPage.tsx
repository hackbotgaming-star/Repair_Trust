import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Video,
  FileText,
  Clock,
  Lock,
  Info
} from 'lucide-react';

export const AdminEvidenceRulesPage: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [rules, setRules] = useState<any>({
    repairTypes: [],
    maxFileSizeMb: 25,
    allowedFormats: ['image/jpeg', 'image/png', 'video/webm', 'video/mp4'],
    retentionDays: 180,
    reviewThresholds: {
      autoFlagRepeatIntervalDays: 60,
      minWorkerNotesLength: 20,
      strictMonsoonEnforcement: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getConfig();
      setConfig(res.data);
      if (res.data.evidenceVerificationRules) {
        setRules(res.data.evidenceVerificationRules);
      }
    } catch (err) {
      console.error('Failed to load evidence rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleToggleChecklist = (index: number, field: string) => {
    const updated = [...(rules.repairTypes || [])];
    updated[index] = {
      ...updated[index],
      [field]: !updated[index][field]
    };
    setRules({ ...rules, repairTypes: updated });
  };

  const handleSaveRules = async () => {
    try {
      setSaving(true);
      setSuccessMsg(null);
      await api.admin.updateConfig('evidence-rules', {
        evidenceVerificationRules: rules
      });
      setSuccessMsg('Evidence verification criteria updated and cryptographically journaled.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" /> Core Module 5: Quality & Evidence Integrity
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Evidence Verification Rules & Standards
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Configure mandatory tri-stage photo requirements, video proof mandates, maximum payload limits, and retention periods.
              Under system rules, configuration updates apply forward and <strong>never silently rewrite past verification determinations</strong>.
            </p>
          </div>

          <button
            onClick={handleSaveRules}
            disabled={saving}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Commit Evidence Policies'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Mandatory Requirements by Repair Type */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-600" /> Mandatory Evidence Matrix by Repair Type
          </h2>
          <p className="text-xs text-slate-500">
            Specify which evidence stages the Closure Auditor strictly enforces for each maintenance classification.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Repair Type Classification</th>
                <th className="p-3 text-center">Before Photo</th>
                <th className="p-3 text-center">During Photo</th>
                <th className="p-3 text-center">After Photo (Clear Invert)</th>
                <th className="p-3 text-center">LiveWork Video Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {rules.repairTypes?.map((rt: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-bold text-slate-900">{rt.repairType}</td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={rt.beforePhotoRequired}
                      onChange={() => handleToggleChecklist(idx, 'beforePhotoRequired')}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={rt.duringPhotoRequired}
                      onChange={() => handleToggleChecklist(idx, 'duringPhotoRequired')}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={rt.afterPhotoRequired}
                      onChange={() => handleToggleChecklist(idx, 'afterPhotoRequired')}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={rt.videoProofRequired}
                      onChange={() => handleToggleChecklist(idx, 'videoProofRequired')}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Limits and Review Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload Specs */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Upload Limits & Retention Policies</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Max Evidence File Size (MB)</label>
              <input
                type="number"
                value={rules.maxFileSizeMb || 25}
                onChange={(e) => setRules({ ...rules, maxFileSizeMb: parseInt(e.target.value, 10) || 25 })}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Video Evidence Archival Retention (Days)</label>
              <input
                type="number"
                value={rules.retentionDays || 180}
                onChange={(e) => setRules({ ...rules, retentionDays: parseInt(e.target.value, 10) || 180 })}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Post-closure window before heavy video buffers are transitioned to cold storage while preserving hashes.
              </p>
            </div>
          </div>
        </div>

        {/* Audit Thresholds */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Closure Auditor Sensitivity Controls</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Repeat Failure Observation Window (Days)</label>
              <input
                type="number"
                value={rules.reviewThresholds?.autoFlagRepeatIntervalDays || 60}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    reviewThresholds: {
                      ...rules.reviewThresholds,
                      autoFlagRepeatIntervalDays: parseInt(e.target.value, 10) || 60
                    }
                  })
                }
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rules.reviewThresholds?.strictMonsoonEnforcement !== false}
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      reviewThresholds: {
                        ...rules.reviewThresholds,
                        strictMonsoonEnforcement: e.target.checked
                      }
                    })
                  }
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="font-bold text-slate-800">Enforce Monsoon Strictness Mode</span>
              </label>
              <p className="text-[11px] text-slate-500 mt-1 pl-6">
                Requires explicit clear-invert photographs before work orders in critical flood zones can be approved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Non-Destructive Invariant Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900">Historical Integrity Guarantee:</strong>
          <p className="mt-0.5 leading-relaxed">
            Changing verification rules takes effect immediately for future submissions and pending reviews.
            Historical records signed off or marked Unverified under prior policies retain their original auditor determinations in the immutable ledger.
          </p>
        </div>
      </div>
    </div>
  );
};
