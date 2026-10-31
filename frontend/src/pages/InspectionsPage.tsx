import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Inspection, Asset } from '../types';
import { useAuth } from '../context/AuthContext';
import { ClipboardCheck, Plus, Search, CheckCircle2, XCircle, X } from 'lucide-react';

export const InspectionsPage: React.FC = () => {
  const { role } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [assetId, setAssetId] = useState('DR-001');
  const [inspectionType, setInspectionType] = useState('Downstream CCTV / Camera Probe');
  const [debrisLevel, setDebrisLevel] = useState<'Clean' | 'Light' | 'Moderate' | 'Heavy / Choked'>('Moderate');
  const [downstreamFlowClear, setDownstreamFlowClear] = useState(true);
  const [siltDepthCm, setSiltDepthCm] = useState(15);
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const res = await api.inspections.list();
      setInspections(res.data);
    } catch (err) {
      console.error('Failed to load inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
    api.assets.list({ limit: 50 }).then((res) => setAssets(res.data)).catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.inspections.create({
        assetId,
        inspectionType,
        findings: {
          debrisLevel,
          downstreamFlowClear,
          siltDepthCm: Number(siltDepthCm),
          notes
        }
      });
      setShowModal(false);
      setNotes('');
      fetchInspections();
      alert('Inspection report logged successfully!');
    } catch (err: any) {
      alert('Error creating inspection: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              PHYSICAL VERIFICATION
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500">Field Diagnostics & CCTV Probes</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-teal-600" />
            Infrastructure Inspections Log
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Downstream camera probes, sedimentation depth audits, and post-repair physical verifications.
          </p>
        </div>

        {(role === 'engineer' || role === 'administrator') && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Record Inspection Audit
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Inspection ID</th>
                <th className="py-3 px-4">Asset ID</th>
                <th className="py-3 px-4">Audit Type</th>
                <th className="py-3 px-4">Inspector</th>
                <th className="py-3 px-4">Silt Depth</th>
                <th className="py-3 px-4">Downstream Flow</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading inspections...
                  </td>
                </tr>
              ) : inspections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No physical inspections recorded yet.
                  </td>
                </tr>
              ) : (
                inspections.map((ins) => (
                  <tr key={ins.inspectionId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{ins.inspectionId}</td>
                    <td className="py-3.5 px-4 font-semibold text-teal-800">{ins.assetId}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{ins.inspectionType}</td>
                    <td className="py-3.5 px-4 text-slate-600">{ins.inspectorName}</td>
                    <td className="py-3.5 px-4 font-mono">{ins.findings?.siltDepthCm} cm</td>
                    <td className="py-3.5 px-4">
                      {ins.findings?.downstreamFlowClear ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Clear / Passable
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" /> Choked / Obstructed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(ins.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Record Physical Inspection Report</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Asset:</label>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                >
                  {assets.map((a) => (
                    <option key={a.assetId} value={a.assetId}>
                      {a.assetId} — {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Inspection Type:</label>
                <select
                  value={inspectionType}
                  onChange={(e) => setInspectionType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="Downstream CCTV / Camera Probe">Downstream CCTV / Camera Probe</option>
                  <option value="Routine Maintenance Check">Routine Maintenance Check</option>
                  <option value="Hydraulic Capacity Audit">Hydraulic Capacity Audit</option>
                  <option value="Post-Repair Verification">Post-Repair Verification</option>
                  <option value="Emergency Monsoon Assessment">Emergency Monsoon Assessment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Silt Depth (cm):</label>
                  <input
                    type="number"
                    value={siltDepthCm}
                    onChange={(e) => setSiltDepthCm(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Downstream Flow Clear:</label>
                  <select
                    value={String(downstreamFlowClear)}
                    onChange={(e) => setDownstreamFlowClear(e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="true">Yes (Clear / Passable)</option>
                    <option value="false">No (Backflow / Obstructed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Diagnostic Notes & Invert Findings:</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record camera observations or specific constriction points found..."
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !notes.trim()}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl font-bold transition"
                >
                  {creating ? 'Saving...' : 'Save Inspection Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
