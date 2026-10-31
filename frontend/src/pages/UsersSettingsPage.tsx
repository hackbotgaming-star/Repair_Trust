import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Users, ShieldCheck, Database, RefreshCw, Clock, History } from 'lucide-react';

export const UsersSettingsPage: React.FC = () => {
  const { role } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    api.auditLogs
      .list(35)
      .then((res) => setLogs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleReset = async () => {
    if (!window.confirm('Reset synthetic demonstration dataset to initial scenario state?')) return;
    setResetting(true);
    try {
      await api.demo.reset();
      alert('Demo data restored successfully.');
      window.location.reload();
    } catch (err: any) {
      alert('Reset error: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              ADMINISTRATION & GOVERNANCE
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            System Governance, Settings & Audit Logs
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitor tamper-evident municipal audit trails, manage retention policies, and configure demonstration data.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={resetting}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          Reset Demo Dataset
        </button>
      </div>

      {/* Configuration & Retention Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-700 font-bold text-xs uppercase tracking-wider">
            <span>Video Retention Policy</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">180 Days</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Automatic archival and secure deletion window for LiveWork Proof video submissions after work order sign-off.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-700 font-bold text-xs uppercase tracking-wider">
            <span>Storage Provider</span>
            <Database className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">Local Verified Storage</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Configurable object storage reference with authenticated streaming and range-request support.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-700 font-bold text-xs uppercase tracking-wider">
            <span>Audit Trail Integrity</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">Active & Immutable</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All user actions, stage transitions, and engineer review determinations are permanently journaled.
          </p>
        </div>
      </div>

      {/* Audit Logs Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" />
            Platform Operational Audit Trail
          </h3>
          <span className="text-xs font-mono text-slate-400">Latest {logs.length} Operations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2.5 px-4 font-bold text-slate-800">{log.action}</td>
                  <td className="py-2.5 px-4 text-slate-600">{log.performedBy}</td>
                  <td className="py-2.5 px-4">
                    <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">{log.entityType}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{log.entityId}</td>
                  <td className="py-2.5 px-4 text-slate-400 font-sans text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
