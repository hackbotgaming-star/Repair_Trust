import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Lock,
  Calendar,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.auditLogs.list(100);
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesEntity = entityFilter === 'All' || log.entityType === entityFilter;
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase());
    return matchesEntity && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-300" /> Core Module 8: Tamper-Evident Audit Ledger
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300">
                Append-Only Cryptographic Chain
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Audit Logs & Accountability Trail
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Every complaint registration, engineer sign-off, evidence upload, role change, and configuration modification is permanently journaled with cryptographic timestamps.
              Deletion of audit logs is strictly prohibited.
            </p>
          </div>

          <button
            onClick={fetchLogs}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Trail
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, actor email, or entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Entity Type:</span>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="p-2 text-xs border border-slate-200 rounded-xl outline-none bg-white font-medium"
          >
            <option value="All">All Entity Types</option>
            <option value="Complaint">Complaint</option>
            <option value="WorkOrder">WorkOrder</option>
            <option value="Asset">Asset</option>
            <option value="User">User Account</option>
            <option value="SystemConfig">SystemConfig</option>
            <option value="ExportReport">ExportReport</option>
            <option value="System">System</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Actor & Role</th>
                <th className="p-4">Entity Type</th>
                <th className="p-4">Target Record ID</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading tamper-evident ledger...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No audit records match the filter query.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id || log.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {log.action}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{log.performedBy}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{log.entityType}</td>
                    <td className="p-4 font-mono font-bold text-slate-800">{log.entityId}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                      >
                        Inspect Payload
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {selectedLog.action}
                </span>
                <span className="text-xs text-slate-500 font-mono">{selectedLog.entityId}</span>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Actor: <strong className="text-slate-900">{selectedLog.performedBy}</strong></div>
                <div>Role: <strong className="text-slate-900">{selectedLog.userRole}</strong></div>
                <div>Entity Type: <strong className="text-slate-900">{selectedLog.entityType}</strong></div>
                <div>Timestamp: <strong className="text-slate-900">{new Date(selectedLog.timestamp).toISOString()}</strong></div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Raw Event Details Payload:</span>
                <pre className="p-3 bg-slate-900 text-teal-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-60">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs hover:bg-slate-900 transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
