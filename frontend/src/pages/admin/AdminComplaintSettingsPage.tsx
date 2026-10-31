import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
  Lock,
  GitBranch
} from 'lucide-react';

export const AdminComplaintSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    categories: [],
    prioritySlaHours: { Low: 168, Medium: 72, High: 24, Urgent: 8 },
    autoConsolidateProximityMeters: 30,
    allowedStatusTransitions: [],
    publicReportingEnabled: true,
    requireReasonOnRejection: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [newCat, setNewCat] = useState('');

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getConfig();
      if (res.data.complaintWorkOrderSettings) {
        setSettings(res.data.complaintWorkOrderSettings);
      }
    } catch (err) {
      console.error('Failed to load complaint settings:', err);
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
      await api.admin.updateConfig('complaint-settings', {
        complaintWorkOrderSettings: {
          ...settings,
          publicReportingEnabled: true // Invariant: Cannot be disabled
        }
      });
      setSuccessMsg('Complaint & Work Order SLA configurations saved to database.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    setSettings({
      ...settings,
      categories: [...(settings.categories || []), newCat.trim()]
    });
    setNewCat('');
  };

  const handleRemoveCategory = (cat: string) => {
    setSettings({
      ...settings,
      categories: settings.categories.filter((c: string) => c !== cat)
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-300" /> Core Module 6: Operational Workflow Policies
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Complaint & Work Order Settings
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Configure allowed categories, SLA resolution targets by priority tier, and permitted state machine transitions.
              The system strictly preserves public submission rights and forbids hidden complaint suppression.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Commit Operational Policies'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* SLA Targets Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" /> Service Level Agreement (SLA) Targets by Priority Tier
          </h2>
          <p className="text-xs text-slate-500">
            Maximum target response and verification hours permitted before cases are escalated to the Executive Engineer.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="font-bold text-slate-700">Urgent Priority (Emergency)</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={settings.prioritySlaHours?.Urgent || 8}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    prioritySlaHours: { ...settings.prioritySlaHours, Urgent: parseInt(e.target.value, 10) || 8 }
                  })
                }
                className="w-20 p-2 border border-slate-300 rounded-lg bg-white font-bold text-rose-600"
              />
              <span className="text-slate-500">Hours</span>
            </div>
            <p className="text-[11px] text-slate-400">Arterial flash flood & hazardous open manholes</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="font-bold text-slate-700">High Priority</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={settings.prioritySlaHours?.High || 24}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    prioritySlaHours: { ...settings.prioritySlaHours, High: parseInt(e.target.value, 10) || 24 }
                  })
                }
                className="w-20 p-2 border border-slate-300 rounded-lg bg-white font-bold text-amber-600"
              />
              <span className="text-slate-500">Hours</span>
            </div>
            <p className="text-[11px] text-slate-400">Severe road pavement crater & choked inlets</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="font-bold text-slate-700">Medium Priority</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={settings.prioritySlaHours?.Medium || 72}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    prioritySlaHours: { ...settings.prioritySlaHours, Medium: parseInt(e.target.value, 10) || 72 }
                  })
                }
                className="w-20 p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-800"
              />
              <span className="text-slate-500">Hours</span>
            </div>
            <p className="text-[11px] text-slate-400">Standard localized silt buildup</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="font-bold text-slate-700">Low Priority</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={settings.prioritySlaHours?.Low || 168}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    prioritySlaHours: { ...settings.prioritySlaHours, Low: parseInt(e.target.value, 10) || 168 }
                  })
                }
                className="w-20 p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-800"
              />
              <span className="text-slate-500">Hours</span>
            </div>
            <p className="text-[11px] text-slate-400">Routine curb and grate repainting</p>
          </div>
        </div>
      </div>

      {/* Allowed Incident Categories */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Allowed Citizen Incident Categories</h2>
          <p className="text-xs text-slate-500">Taxonomy of problems reportable through the public portal and mobile app.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {settings.categories?.map((cat: string) => (
            <span
              key={cat}
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-2 border border-slate-200"
            >
              <span>{cat}</span>
              <button
                onClick={() => handleRemoveCategory(cat)}
                className="text-slate-400 hover:text-rose-600 transition"
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2 pt-2 max-w-md">
          <input
            type="text"
            placeholder="Add new category (e.g. Broken Storm Sewer Grate)..."
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            className="flex-1 p-2 text-xs border border-slate-200 rounded-xl outline-none"
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      {/* Public Transparency Charter Guarantee */}
      <div className="p-5 bg-teal-50 border border-teal-200 rounded-3xl space-y-2 text-xs">
        <div className="flex items-center gap-2 text-teal-900 font-bold">
          <Lock className="w-4 h-4 text-teal-700" />
          <span>Non-Subvertible Governance Guarantee</span>
        </div>
        <p className="text-slate-700 leading-relaxed">
          The RepairTrust platform architecture prohibits administrative bypass of public complaint intake.
          All valid complaints submitted by citizens are assigned an immutable sequence ID and journaled in the public ledger.
          Rejections must provide documented public reasons, preserving the complete chain of custody for civic oversight.
        </p>
      </div>
    </div>
  );
};
