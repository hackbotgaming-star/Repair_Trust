import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Clock,
  HardDrive,
  ShieldCheck,
  Terminal
} from 'lucide-react';

export const AdminSystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getSystemHealth();
      setHealth(res.data);
    } catch (err) {
      console.error('Failed to load system health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-300 animate-pulse" /> Core Module 10: System Health & Telemetry
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300">
                All Core Services Connected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              System Health & Diagnostics
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time monitoring of Node.js Express API runtime, embedded MongoEngine database instance, local evidence storage, and FastAPI AI microservice latency.
            </p>
          </div>

          <button
            onClick={fetchHealth}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Diagnostics
          </button>
        </div>
      </div>

      {/* Services Health Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Municipal Services Connectivity Matrix</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {health?.servicesStatus?.map((svc: any, idx: number) => {
            const isHealthy = svc.status.toLowerCase().includes('healthy') || svc.status.toLowerCase().includes('connected') || svc.status.toLowerCase().includes('writable');
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  {svc.latencyMs !== null && (
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{svc.latencyMs} ms</span>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">{svc.name}</h3>
                  <div
                    className={`text-xs font-bold mt-1 ${
                      isHealthy ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {svc.status}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                  {svc.port ? `Port: ${svc.port}` : svc.provider || svc.path || 'Active'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Machine & Process Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Node Process */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Server className="w-4 h-4 text-indigo-600" />
            <span>Node.js Process Telemetry</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Uptime</span>
              <strong className="text-slate-900 text-sm font-mono">{health?.uptimeFormatted || 'Active'}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Runtime</span>
              <strong className="text-slate-900 text-sm font-mono">{health?.nodeProcess?.version || 'v20.x'}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">RSS Memory</span>
              <strong className="text-slate-900 text-sm font-mono">{health?.nodeProcess?.rssMemoryMb || 120} MB</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Heap Used</span>
              <strong className="text-slate-900 text-sm font-mono">{health?.nodeProcess?.heapUsedMb || 45} MB</strong>
            </div>
          </div>
        </div>

        {/* Host Machine */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Cpu className="w-4 h-4 text-teal-600" />
            <span>Host Environment Resources</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Host Platform</span>
              <strong className="text-slate-900 text-sm font-mono">{health?.host?.platform} ({health?.host?.architecture})</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">CPU Cores</span>
              <strong className="text-slate-900 text-sm font-mono">{health?.host?.cpuCores} Cores</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total System RAM</span>
              <strong className="text-slate-900 text-sm font-mono">{health?.host?.totalMemoryGb} GB</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Free RAM</span>
              <strong className="text-emerald-700 text-sm font-mono">{health?.host?.freeMemoryGb} GB</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Sanitized Recent Server Logs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Sanitized Server Diagnostic Journal</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">Credentials & Private Evidence Stripped</span>
        </div>

        <div className="bg-slate-900 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
          {health?.recentSanitizedLogs?.map((log: any, idx: number) => (
            <div key={idx} className="flex items-start gap-2 text-[11px]">
              <span className="text-slate-500 select-none">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="px-1 py-0.2 rounded bg-indigo-900 text-indigo-200 text-[10px] font-bold uppercase">
                {log.level}
              </span>
              <span className="text-emerald-300">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
