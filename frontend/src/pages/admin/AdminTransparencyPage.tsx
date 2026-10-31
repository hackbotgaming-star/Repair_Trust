import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Eye,
  ShieldCheck,
  Save,
  CheckCircle2,
  Lock,
  Globe,
  UserX,
  MapPin,
  RotateCcw,
  Info
} from 'lucide-react';

export const AdminTransparencyPage: React.FC = () => {
  const [transparency, setTransparency] = useState<any>({
    maskCitizenNames: true,
    showExactCoordinates: true,
    allowPublicDisputes: true,
    hidePersonalPhone: true,
    publicDashboardCacheMins: 5,
    showClosureAuditorEvaluationPublicly: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getConfig();
      if (res.data.transparencySettings) {
        setTransparency(res.data.transparencySettings);
      }
    } catch (err) {
      console.error('Failed to load transparency settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMsg(null);
      await api.admin.updateConfig('transparency', {
        transparencySettings: transparency
      });
      setSuccessMsg('Civic transparency and privacy redaction policies successfully saved.');
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
                <Eye className="w-3.5 h-3.5 text-indigo-300" /> Core Module 11: Public Transparency & Redaction
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300">
                Privacy-First Municipal Governance
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Public Transparency & Civic Oversight Settings
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Configure open governance policies, citizen privacy redactions, and public tracking visibility.
              Personal phone numbers and contact emails are strictly sanitized before records are published on public dashboards.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Commit Transparency Policies'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Redaction Toggles */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserX className="w-4 h-4 text-indigo-600" /> Citizen Privacy & PII Redaction Controls
          </h2>
          <p className="text-xs text-slate-500">
            Automated redactors that scrub personally identifiable information before public API serialization.
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
            <div>
              <div className="font-bold text-slate-900 text-xs">Mask Citizen Reporter Names</div>
              <div className="text-[11px] text-slate-500">
                Renders citizen identities as "Resident Reporter (Ward 4)" unless explicitly opted-in by the user.
              </div>
            </div>
            <input
              type="checkbox"
              checked={transparency.maskCitizenNames !== false}
              onChange={(e) => setTransparency({ ...transparency, maskCitizenNames: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
            <div>
              <div className="font-bold text-slate-900 text-xs">Sanitize Contact Phone & Email from Public API</div>
              <div className="text-[11px] text-slate-500">
                Completely removes contact phone numbers and personal emails from public track queries.
              </div>
            </div>
            <input
              type="checkbox"
              checked={transparency.hidePersonalPhone !== false}
              onChange={(e) => setTransparency({ ...transparency, hidePersonalPhone: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
            <div>
              <div className="font-bold text-slate-900 text-xs">Publish Closure Auditor Evidence Status</div>
              <div className="text-[11px] text-slate-500">
                Allows citizens to view whether repairs were marked "Approved" or "Unverified" on public complaint tracking.
              </div>
            </div>
            <input
              type="checkbox"
              checked={transparency.showClosureAuditorEvaluationPublicly !== false}
              onChange={(e) =>
                setTransparency({ ...transparency, showClosureAuditorEvaluationPublicly: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
            <div>
              <div className="font-bold text-slate-900 text-xs">Enable Open Dispute & Recurrence Reopening</div>
              <div className="text-[11px] text-slate-500">
                Empowers citizens to reopen resolved complaints without needing prior municipal permission.
              </div>
            </div>
            <input
              type="checkbox"
              checked={transparency.allowPublicDisputes !== false}
              onChange={(e) => setTransparency({ ...transparency, allowPublicDisputes: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Mandatory Public Access Policy */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3 text-xs text-indigo-950">
        <Globe className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900">Democratized Infrastructure Governance:</strong>
          <p className="mt-0.5 leading-relaxed">
            The RepairTrust mandate guarantees that municipal officials cannot hide infrastructure failures from public transparency maps.
            All open and recurring drain blockages are published with street locations to ensure collective municipal accountability.
          </p>
        </div>
      </div>
    </div>
  );
};
