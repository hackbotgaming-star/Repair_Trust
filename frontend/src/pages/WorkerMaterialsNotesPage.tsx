import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  RefreshCw,
  HardHat,
  ArrowRight,
  ShieldCheck,
  Wrench
} from 'lucide-react';

export const WorkerMaterialsNotesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [materials, setMaterials] = useState<{ item: string; quantity: string }[]>([]);
  const [completionNotes, setCompletionNotes] = useState('');
  const [saving, setSaving] = useState(false);
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

      if (found) {
        setMaterials(found.materialsUsed || [{ item: 'Vacuum Gully Sucker Unit', quantity: '1 shift' }]);
        setCompletionNotes(found.completionNotes || '');
      }
    } catch (err) {
      console.error('Error loading materials:', err);
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
      setMaterials(t.materialsUsed?.length ? t.materialsUsed : [{ item: '', quantity: '' }]);
      setCompletionNotes(t.completionNotes || '');
    }
  };

  const addMaterialRow = () => {
    setMaterials([...materials, { item: '', quantity: '' }]);
  };

  const removeMaterialRow = (idx: number) => {
    setMaterials(materials.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setSaving(true);
    try {
      const filteredMaterials = materials.filter((m) => m.item.trim().length > 0);
      await api.workOrders.updateMaterials(selectedTask.workOrderId, {
        materialsUsed: filteredMaterials,
        completionNotes: completionNotes.trim()
      });

      alert(`Successfully saved materials and work notes for ${selectedTask.workOrderId}!`);
      // Reload task
      const updated = await api.workOrders.get(selectedTask.workOrderId);
      setSelectedTask(updated.data);
    } catch (err: any) {
      alert('Error saving materials: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-teal-600" />
            Repair Materials & Work Notes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain an auditable log of supplies consumed, equipment utilized, and daily field crew diaries.
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

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Assigned Work Order:</span>
            <h3 className="text-sm font-bold text-slate-900">
              {selectedTask?.workOrderId}: {selectedTask?.repairType} on Asset {selectedTask?.assetId}
            </h3>
          </div>
          <Link
            to={`/worker/tasks/${selectedTask?.workOrderId}`}
            className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
          >
            Open Task <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Section 1: Materials Consumed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Materials Consumed on Site:
            </label>
            <button
              type="button"
              onClick={addMaterialRow}
              className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Material Row
            </button>
          </div>

          <div className="space-y-2">
            {materials.map((m, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={m.item}
                  onChange={(e) => {
                    const updated = [...materials];
                    updated[idx].item = e.target.value;
                    setMaterials(updated);
                  }}
                  placeholder="Material / Supply (e.g. Hydraulic cement, Cast iron grate 600x600mm)"
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                  required
                />
                <input
                  type="text"
                  value={m.quantity}
                  onChange={(e) => {
                    const updated = [...materials];
                    updated[idx].quantity = e.target.value;
                    setMaterials(updated);
                  }}
                  placeholder="Quantity (e.g. 3 Bags, 1 Unit)"
                  className="w-40 px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                  required
                />
                {materials.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMaterialRow(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Equipment Utilized Presets */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Major Equipment Utilized:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              'Vacuum Gully Sucker Unit',
              'High-Pressure Water Jetter',
              'Submersible De-watering Pump',
              'Hydraulic Trench Jack / Shoring',
              'Confined Space Safety Tripod',
              'CCTV Pipe Crawler Probe',
              'Diamond Concrete Saw Cutter',
              'Heavy Excavator Bucket'
            ].map((eq) => {
              const isSelected = materials.some((m) => m.item.toLowerCase().includes(eq.toLowerCase().slice(0, 10)));
              return (
                <button
                  key={eq}
                  type="button"
                  onClick={() => {
                    if (!isSelected) {
                      setMaterials([...materials.filter((m) => m.item.trim().length > 0), { item: eq, quantity: '1 Unit / Shift' }]);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-[11px] font-semibold text-left transition ${
                    isSelected
                      ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs ring-1 ring-teal-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '} {eq}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Field Diary & Work Completion Notes */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            3. Work Notes & Field Crew Diary:
          </label>
          <textarea
            rows={5}
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Document key milestones, site conditions, unforeseen utility lines encountered, water discharge rates, and crew members present..."
            className="w-full p-3.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
            required
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            Changes will update Closure Auditor completion checklist immediately.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving Notes & Materials...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Materials & Notes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
