import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Building2,
  MapPin,
  Plus,
  Save,
  CheckCircle2,
  RefreshCw,
  Users,
  Layers,
  AlertTriangle,
  Edit2,
  Trash2
} from 'lucide-react';

export const AdminDepartmentsWardsPage: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New department state
  const [newDept, setNewDept] = useState({
    departmentId: '',
    name: '',
    headOfDepartment: '',
    contactEmail: '',
    phone: '',
    serviceWards: 'Ward 4 (Central), Ward 6 (Industrial South)'
  });

  // New ward state
  const [newWard, setNewWard] = useState({
    wardNumber: '',
    name: '',
    zone: 'Zone 4',
    population: 85000,
    riskTier: 'Moderate',
    primaryInspector: 'Vikram Sengupta, P.E.'
  });

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getConfig();
      setConfig(res.data);
      setDepartments(res.data.departments || []);
      setWards(res.data.wards || []);
    } catch (err) {
      console.error('Failed to load configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveDepartmentsAndWards = async () => {
    try {
      setSaving(true);
      setSuccessMsg(null);
      await api.admin.updateConfig('departments-wards', {
        departments,
        wards
      });
      setSuccessMsg('Departments and Wards configuration saved to database and logged in audit trail.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.departmentId || !newDept.name) return;
    const deptObj = {
      ...newDept,
      serviceWards: newDept.serviceWards.split(',').map((w) => w.trim())
    };
    setDepartments([...departments, deptObj]);
    setNewDept({
      departmentId: '',
      name: '',
      headOfDepartment: '',
      contactEmail: '',
      phone: '',
      serviceWards: 'Ward 4 (Central)'
    });
  };

  const handleAddWard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWard.wardNumber || !newWard.name) return;
    setWards([...wards, newWard]);
    setNewWard({
      wardNumber: '',
      name: '',
      zone: 'Zone 4',
      population: 85000,
      riskTier: 'Moderate',
      primaryInspector: 'Vikram Sengupta, P.E.'
    });
  };

  const handleRemoveDepartment = (id: string) => {
    setDepartments(departments.filter((d) => d.departmentId !== id));
  };

  const handleRemoveWard = (num: string) => {
    setWards(wards.filter((w) => w.wardNumber !== num));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-300" /> Core Module 3: Jurisdictions & Wards
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Department & Ward Management
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Configure municipal service divisions, ward boundaries, inspection zones, and primary engineer oversight assignments.
            </p>
          </div>

          <button
            onClick={handleSaveDepartmentsAndWards}
            disabled={saving}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Grid: Departments on Left, Wards on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departments Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" /> Municipal Departments ({departments.length})
              </h2>
              <p className="text-xs text-slate-500">Service divisions handling work orders and maintenance.</p>
            </div>
          </div>

          {/* List of Departments */}
          <div className="space-y-3">
            {departments.map((dept) => (
              <div
                key={dept.departmentId}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {dept.departmentId}
                  </span>
                  <button
                    onClick={() => handleRemoveDepartment(dept.departmentId)}
                    className="text-slate-400 hover:text-rose-600 transition p-1"
                    title="Remove Department"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">{dept.name}</h4>
                  <p className="text-[11px] text-slate-500">Head: {dept.headOfDepartment} • {dept.contactEmail}</p>
                </div>

                <div className="flex flex-wrap gap-1 text-[10px]">
                  {Array.isArray(dept.serviceWards) &&
                    dept.serviceWards.map((w: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {w}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add Department Form */}
          <form onSubmit={handleAddDepartment} className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3 text-xs">
            <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add New Service Department
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Dept ID (e.g. DEP-LGT-04)"
                required
                value={newDept.departmentId}
                onChange={(e) => setNewDept({ ...newDept, departmentId: e.target.value })}
                className="p-2 border border-slate-200 rounded-xl bg-white outline-none"
              />
              <input
                type="text"
                placeholder="Department Name"
                required
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                className="p-2 border border-slate-200 rounded-xl bg-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Head of Department"
                value={newDept.headOfDepartment}
                onChange={(e) => setNewDept({ ...newDept, headOfDepartment: e.target.value })}
                className="p-2 border border-slate-200 rounded-xl bg-white outline-none"
              />
              <input
                type="email"
                placeholder="Contact Email"
                value={newDept.contactEmail}
                onChange={(e) => setNewDept({ ...newDept, contactEmail: e.target.value })}
                className="p-2 border border-slate-200 rounded-xl bg-white outline-none"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Service Wards (comma-separated, e.g. Ward 4, Ward 6)"
                value={newDept.serviceWards}
                onChange={(e) => setNewDept({ ...newDept, serviceWards: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl bg-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition"
            >
              Add Department to Staging
            </button>
          </form>
        </div>

        {/* Wards Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" /> Municipal Wards & Zones ({wards.length})
              </h2>
              <p className="text-xs text-slate-500">Service areas for asset routing and flood risk management.</p>
            </div>
          </div>

          {/* List of Wards */}
          <div className="space-y-3">
            {wards.map((ward) => (
              <div
                key={ward.wardNumber}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {ward.wardNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{ward.name}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveWard(ward.wardNumber)}
                    className="text-slate-400 hover:text-rose-600 transition p-1"
                    title="Remove Ward"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                  <span>Zone: <strong className="text-slate-700">{ward.zone}</strong></span>
                  <span>Population: <strong className="text-slate-700">{ward.population?.toLocaleString()}</strong></span>
                  <span>
                    Risk: <strong className={ward.riskTier === 'Critical' ? 'text-rose-600' : 'text-slate-700'}>{ward.riskTier}</strong>
                  </span>
                  <span>Inspector: <strong className="text-slate-700">{ward.primaryInspector}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Ward Form */}
          <form onSubmit={handleAddWard} className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-3 text-xs">
            <h4 className="font-bold text-teal-950 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add New Municipal Ward
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Ward Number (e.g. Ward 22)"
                required
                value={newWard.wardNumber}
                onChange={(e) => setNewWard({ ...newWard, wardNumber: e.target.value })}
                className="p-2 border border-slate-200 rounded-xl bg-white outline-none"
              />
              <input
                type="text"
                placeholder="Ward Name (e.g. Ward 22 (Metro North))"
                required
                value={newWard.name}
                onChange={(e) => setNewWard({ ...newWard, name: e.target.value })}
                className="p-2 border border-slate-200 rounded-xl bg-white outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Zone (e.g. Zone 4)"
                value={newWard.zone}
                onChange={(e) => setNewWard({ ...newWard, zone: e.target.value })}
                className="p-2 border border-slate-200 rounded-xl bg-white outline-none"
              />
              <select
                value={newWard.riskTier}
                onChange={(e) => setNewWard({ ...newWard, riskTier: e.target.value })}
                className="p-2 border border-slate-200 rounded-xl bg-white outline-none font-medium"
              >
                <option value="Low">Low Risk</option>
                <option value="Moderate">Moderate Risk</option>
                <option value="High">High Risk</option>
                <option value="Critical">Critical Risk</option>
              </select>
              <input
                type="number"
                placeholder="Population"
                value={newWard.population}
                onChange={(e) => setNewWard({ ...newWard, population: parseInt(e.target.value, 10) || 0 })}
                className="p-2 border border-slate-200 rounded-xl bg-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition"
            >
              Add Ward to Staging
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
