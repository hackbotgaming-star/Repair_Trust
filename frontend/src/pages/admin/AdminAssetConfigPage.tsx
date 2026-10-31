import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Layers,
  Plus,
  Save,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Clock,
  Compass,
  Wrench,
  ShieldCheck
} from 'lucide-react';

export const AdminAssetConfigPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [newCat, setNewCat] = useState({
    categoryId: '',
    name: '',
    description: '',
    defaultMaintenanceIntervalDays: 60,
    unitOfMeasure: 'Meters',
    inspectionTypeRequired: 'Physical Site & Silt Measurement'
  });

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getConfig();
      setCategories(res.data.assetCategories || []);
    } catch (err) {
      console.error('Failed to load asset categories config:', err);
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
      await api.admin.updateConfig('asset-categories', {
        assetCategories: categories
      });
      setSuccessMsg('Asset categories & maintenance specifications saved and journaled in audit log.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.categoryId || !newCat.name) return;
    setCategories([...categories, newCat]);
    setNewCat({
      categoryId: '',
      name: '',
      description: '',
      defaultMaintenanceIntervalDays: 60,
      unitOfMeasure: 'Meters',
      inspectionTypeRequired: 'Physical Site & Silt Measurement'
    });
  };

  const handleRemoveCategory = (id: string) => {
    setCategories(categories.filter((c) => c.categoryId !== id));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-300" /> Core Module 4: Infrastructure Asset Standards
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Asset Categories & Maintenance Configuration
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Define infrastructure asset classifications, baseline preventative maintenance intervals, units of measurement, and mandatory inspection probe protocols.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Commit Asset Standards'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.categoryId}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3 relative group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                {cat.categoryId}
              </span>
              <button
                onClick={() => handleRemoveCategory(cat.categoryId)}
                className="text-slate-400 hover:text-rose-600 transition p-1"
                title="Remove Category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{cat.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Maintenance Cycle</span>
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-600" />
                  Every {cat.defaultMaintenanceIntervalDays} Days
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Unit of Measure</span>
                <div className="font-bold text-slate-800">{cat.unitOfMeasure}</div>
              </div>
            </div>

            <div className="p-2.5 bg-teal-50/50 border border-teal-100 rounded-xl text-xs space-y-0.5">
              <span className="text-[10px] text-teal-800 font-bold uppercase">Required Inspection Protocol</span>
              <div className="font-bold text-teal-900">{cat.inspectionTypeRequired}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Category Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-600" /> Add New Asset Standard Category
        </h3>

        <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category Code *</label>
              <input
                type="text"
                placeholder="e.g. CAT-FLM (Flume & Sluice)"
                required
                value={newCat.categoryId}
                onChange={(e) => setNewCat({ ...newCat, categoryId: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category Name *</label>
              <input
                type="text"
                placeholder="e.g. Hydraulic Sluice Gate"
                required
                value={newCat.name}
                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description</label>
            <input
              type="text"
              placeholder="Engineering description of this asset type and its role in flood prevention..."
              value={newCat.description}
              onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Cycle (Days)</label>
              <input
                type="number"
                value={newCat.defaultMaintenanceIntervalDays}
                onChange={(e) => setNewCat({ ...newCat, defaultMaintenanceIntervalDays: parseInt(e.target.value, 10) || 60 })}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Unit of Measure</label>
              <input
                type="text"
                value={newCat.unitOfMeasure}
                onChange={(e) => setNewCat({ ...newCat, unitOfMeasure: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Inspection Protocol</label>
              <select
                value={newCat.inspectionTypeRequired}
                onChange={(e) => setNewCat({ ...newCat, inspectionTypeRequired: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white font-medium"
              >
                <option value="Physical Site & Silt Measurement">Physical Site & Silt Measurement</option>
                <option value="Downstream CCTV / Camera Probe">Downstream CCTV / Camera Probe</option>
                <option value="Cross-Section & Hydraulic Flow Survey">Cross-Section & Hydraulic Flow Survey</option>
                <option value="Visual Surface Pavement Survey">Visual Surface Pavement Survey</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Asset Category
          </button>
        </form>
      </div>
    </div>
  );
};
