import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  UserCheck,
  ShieldCheck,
  Lock,
  Building2,
  Key,
  HardHat,
  Database,
  History,
  CheckCircle2
} from 'lucide-react';

export const AdminProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" /> Platform Security & Administration
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300">
              Root Governance Scope
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Profile & Session Credentials
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Administrative credentials are authenticated against cryptographic role-based access checks.
            Every privileged modification is logged into the append-only municipal audit trail.
          </p>
        </div>
      </div>

      {/* Identity Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{user?.name || 'Chief Administrator'}</h2>
              <p className="text-xs text-slate-500 font-mono">{user?.email || 'admin@repairtrust.gov'}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 uppercase">
                  Role: Administrator
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                  Access: Tier 1 Security Governance
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
            <div className="text-slate-400 font-semibold text-[10px] uppercase">Department Jurisdiction</div>
            <div className="font-bold text-slate-800">{user?.department || 'Municipal IT & Infrastructure Governance'}</div>
            <div className="text-slate-500">All Municipal Zones & Wards</div>
          </div>
        </div>

        {/* Security Overview Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-600" /> Administrative Key Status
            </span>
            <div className="font-mono text-emerald-700 font-bold">Active (JWT Signed)</div>
            <p className="text-[11px] text-slate-400">Least-privilege authorization enforced on all REST endpoints.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-600" /> Audit Ledger Journaling
            </span>
            <div className="font-mono text-indigo-700 font-bold">Append-Only Active</div>
            <p className="text-[11px] text-slate-400">All account actions recorded with actor email and client IP.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600" /> Non-Erasure Protection
            </span>
            <div className="font-mono text-emerald-700 font-bold">Guaranteed Active</div>
            <p className="text-[11px] text-slate-400">Protects citizen reports from accidental or unilateral deletion.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
