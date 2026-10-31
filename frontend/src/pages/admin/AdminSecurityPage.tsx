import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Lock,
  ShieldCheck,
  Save,
  CheckCircle2,
  Key,
  Clock,
  AlertTriangle,
  Server,
  FileCheck
} from 'lucide-react';

export const AdminSecurityPage: React.FC = () => {
  const [security, setSecurity] = useState<any>({
    sessionTimeoutMins: 60,
    maxFailedLoginAttempts: 5,
    lockoutDurationMins: 15,
    encryptionAtRest: true,
    auditTrailRetentionYears: 7,
    ipRateLimitPerMinute: 120
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getConfig();
      if (res.data.securityPrivacySettings) {
        setSecurity(res.data.securityPrivacySettings);
      }
    } catch (err) {
      console.error('Failed to load security settings:', err);
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
      await api.admin.updateConfig('security', {
        securityPrivacySettings: security
      });
      setSuccessMsg('Security parameters, session timeouts, and lockout policies updated.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-300" /> Core Module 12: Security & Session Hardening
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300">
                Server-Side Validated RBAC
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Security & Privacy Policy Settings
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Enforce session timeouts, brute-force login lockouts, IP rate limits, and legally mandated audit retention windows.
              Every privileged action requires cryptographically signed authorization tokens.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Commit Security Settings'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Security Parameters Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Session & Brute Force */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-600" /> Session & Authentication Defense
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Session Inactivity Timeout (Minutes)</label>
              <input
                type="number"
                value={security.sessionTimeoutMins || 60}
                onChange={(e) => setSecurity({ ...security, sessionTimeoutMins: parseInt(e.target.value, 10) || 60 })}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Max Failed Login Attempts Before Lockout</label>
              <input
                type="number"
                value={security.maxFailedLoginAttempts || 5}
                onChange={(e) => setSecurity({ ...security, maxFailedLoginAttempts: parseInt(e.target.value, 10) || 5 })}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Temporary Lockout Duration (Minutes)</label>
              <input
                type="number"
                value={security.lockoutDurationMins || 15}
                onChange={(e) => setSecurity({ ...security, lockoutDurationMins: parseInt(e.target.value, 10) || 15 })}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* Network & Compliance */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-teal-600" /> Rate Limits & Compliance Archival
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">API Rate Limit Per IP (Requests / Min)</label>
              <input
                type="number"
                value={security.ipRateLimitPerMinute || 120}
                onChange={(e) => setSecurity({ ...security, ipRateLimitPerMinute: parseInt(e.target.value, 10) || 120 })}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mandatory Audit Trail Retention (Years)</label>
              <input
                type="number"
                value={security.auditTrailRetentionYears || 7}
                onChange={(e) => setSecurity({ ...security, auditTrailRetentionYears: parseInt(e.target.value, 10) || 7 })}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Statutory retention duration required by municipal engineering transparency legislation.
              </p>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={security.encryptionAtRest !== false}
                  onChange={(e) => setSecurity({ ...security, encryptionAtRest: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="font-bold text-slate-800">Database Encryption at Rest (AES-256 Enabled)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
