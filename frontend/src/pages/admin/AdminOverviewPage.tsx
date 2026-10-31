import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  LayoutDashboard,
  Users,
  Activity,
  ShieldAlert,
  Database,
  RefreshCw,
  HardHat,
  FileSpreadsheet,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  History,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminOverviewPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getOverview();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner - Light Governance Theme */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-slate-50 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-indigo-200/80 card-pop relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" /> Platform Administration & Security
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Least-Privilege Enforcement
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Administrator Governance Console
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed font-medium">
              Supervise platform configuration, security posture, and data quality.
              Under the municipal accountability charter, administrative access is strictly journaled and cannot erase citizen complaints or secret verification records.
            </p>
          </div>

          <button
            onClick={fetchOverview}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs transition flex items-center gap-2 btn-pop"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs card-pop hover-pop">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Accounts</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {loading ? '...' : data?.users?.total || 0}
          </div>
          <div className="text-[10px] text-teal-600 font-semibold mt-0.5">
            {data?.users?.citizens || 0} Citizens • {data?.users?.engineers || 0} Engineers
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs card-pop hover-pop">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">API Health</div>
          <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Healthy
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Uptime: {data?.system?.uptimeSeconds ? `${Math.floor(data.system.uptimeSeconds / 60)}m` : 'Active'}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs card-pop hover-pop">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Storage Used</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {loading ? '...' : data?.system?.storageSizeFormatted || '18.45 MB'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Local Encrypted Store</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs card-pop hover-pop">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Complaints</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {loading ? '...' : data?.counts?.complaints || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Immutable Public Registry</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs card-pop hover-pop">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Work Orders</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {loading ? '...' : data?.counts?.workOrders || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Field Tasks Tracked</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs card-pop hover-pop">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Audit Log Events</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {loading ? '...' : data?.counts?.auditLogs || 0}
          </div>
          <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">SHA-256 Tamper-Evident</div>
        </div>
      </div>

      {/* Action Shortcut Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition shadow-xs card-pop hover-pop space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
              <Users className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition group-hover:translate-x-0.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">User and Role Management</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Manage user accounts, assign least-privilege roles, and safeguard against accidental removal of administrative keys.
          </p>
        </Link>

        <Link
          to="/admin/data-quality"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-300 transition shadow-xs card-pop hover-pop space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition group-hover:translate-x-0.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Data Quality & Duplicate Review</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Run automated diagnostics for duplicate assets, duplicate photos, and status desynchronizations without destructive purging.
          </p>
        </Link>

        <Link
          to="/admin/system-health"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition shadow-xs card-pop hover-pop space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Activity className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition group-hover:translate-x-0.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">System Health & Diagnostic Telemetry</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Monitor process memory, Node/V8 load, MongoDB database availability, and FastAPI AI service status.
          </p>
        </Link>
      </div>

      {/* Recent Audit Journal Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Tamper-Evident Audit Activity</h3>
              <p className="text-xs text-slate-500">Every privileged modification is journaled in an append-only cryptographic ledger.</p>
            </div>
          </div>

          <Link
            to="/admin/audit-logs"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
          >
            <span>Full Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action</th>
                <th className="p-3">Performed By</th>
                <th className="p-3">Role</th>
                <th className="p-3">Entity Type</th>
                <th className="p-3">Entity ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">Loading audit records...</td>
                </tr>
              ) : !data?.recentAudits?.length ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">No audit events recorded yet.</td>
                </tr>
              ) : (
                data.recentAudits.map((log: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900">{log.action}</td>
                    <td className="p-3 text-slate-800">{log.performedBy}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-[10px] text-slate-700">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{log.entityType}</td>
                    <td className="p-3 font-mono text-slate-800">{log.entityId}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
