import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Layers,
  FileSpreadsheet,
  Wrench,
  Camera,
  ExternalLink,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDataQualityPage: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());

  const runScan = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getDataQuality();
      setIssues(res.data || []);
      setSummary(res.summary || null);
    } catch (err) {
      console.error('Failed to run data quality scan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runScan();
  }, []);

  const handleAcknowledge = (id: string) => {
    const updated = new Set(acknowledgedIds);
    updated.add(id);
    setAcknowledgedIds(updated);
  };

  const filteredIssues = issues.filter((issue) => {
    if (filterSeverity === 'All') return true;
    return issue.severity === filterSeverity;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-300" /> Core Module 9: Data Integrity & Quality Review
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300">
                Non-Destructive Review Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Data Quality & Duplicate Review
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Detect suspect duplicate assets, reused image hashes, orphan references, and status desynchronizations.
              Provides a human-in-the-loop review workflow rather than automatically deleting citizen reports.
            </p>
          </div>

          <button
            onClick={runScan}
            disabled={loading}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Scanning Database...' : 'Run Diagnostics Scan'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Total Flagged Items</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{summary?.totalIssues || 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Scanned across all collections</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-rose-500 font-bold uppercase">Errors (Broken Refs)</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{summary?.errors || 0}</div>
          <div className="text-[10px] text-rose-700 mt-0.5">Orphaned IDs requiring linking</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-amber-500 font-bold uppercase">Warnings (Duplicates)</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{summary?.warnings || 0}</div>
          <div className="text-[10px] text-amber-700 mt-0.5">Suspect duplicate assets/status</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-blue-500 font-bold uppercase">Information (File Reuse)</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{summary?.info || 0}</div>
          <div className="text-[10px] text-blue-700 mt-0.5">Reused photos across complaints</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold text-[11px] uppercase mr-1">Filter by Severity:</span>
        {['All', 'error', 'warning', 'info'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              filterSeverity === sev
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {sev === 'All' ? 'All Findings' : sev.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Issues Review Queue */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs font-bold">Scanning records for anomalies, duplicates, and broken references...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">Database Consistency Verified</p>
            <p className="text-xs text-slate-400">No orphaned records, duplicate assets, or status desynchronizations found.</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isAck = acknowledgedIds.has(issue.id);
            return (
              <div
                key={issue.id}
                className={`bg-white rounded-3xl border p-5 shadow-xs transition space-y-3 ${
                  isAck
                    ? 'opacity-60 bg-slate-50 border-slate-200'
                    : issue.severity === 'error'
                    ? 'border-rose-200'
                    : issue.severity === 'warning'
                    ? 'border-amber-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        issue.severity === 'error'
                          ? 'bg-rose-100 text-rose-800'
                          : issue.severity === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500">{issue.type}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAck ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged for Review
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(issue.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                      >
                        Acknowledge Finding
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{issue.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{issue.description}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold text-[10px] uppercase block">
                      Recommended Engineering Action:
                    </span>
                    <span className="text-slate-800 font-medium">{issue.recommendedAction}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 shrink-0">
                    <span>Records:</span>
                    {issue.records?.map((r: string, i: number) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-bold text-slate-700">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Non-Destructive Charter Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Fairness & Accountability Rule:</strong> The Data Quality Engine surfaces potential duplicates for human verification.
          Automatic purges of citizen complaints are expressly blocked to preserve civil evidence and prevent administrative suppression.
        </p>
      </div>
    </div>
  );
};
