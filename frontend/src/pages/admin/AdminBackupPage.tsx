import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Database,
  Download,
  Save,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const AdminBackupPage: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [backupSettings, setBackupSettings] = useState<any>({
    automatedBackupIntervalHours: 24,
    storageProvider: 'Local Secure Encrypted Store',
    retentionPolicyDays: 365,
    backupLocation: '/var/backups/repairtrust',
    activeSnapshotsCount: 14
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggeringBackup, setTriggeringBackup] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastBackupManifest, setLastBackupManifest] = useState<any | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getConfig();
      setConfig(res.data);
      if (res.data.backupRetentionSettings) {
        setBackupSettings(res.data.backupRetentionSettings);
      }
    } catch (err) {
      console.error('Failed to load backup configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleTriggerBackup = async () => {
    try {
      setTriggeringBackup(true);
      setSuccessMsg(null);
      const res = await api.admin.triggerBackup();
      setLastBackupManifest(res.data);
      setSuccessMsg(`Snapshot backup ${res.data.backupId} completed and verified with SHA-256 digest.`);
      await fetchConfig();
    } catch (err: any) {
      alert('Backup failed: ' + err.message);
    } finally {
      setTriggeringBackup(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setSuccessMsg(null);
      await api.admin.updateConfig('backup', {
        backupRetentionSettings: backupSettings
      });
      setSuccessMsg('Backup frequency and data retention policy saved.');
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
                <Database className="w-3.5 h-3.5 text-indigo-300" /> Core Module 13: Data Persistence & Continuity
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Backup & Data Retention Management
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Configure automated database snapshots, evidence volume retention, and trigger immediate point-in-time verified backups.
            </p>
          </div>

          <button
            onClick={handleTriggerBackup}
            disabled={triggeringBackup}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${triggeringBackup ? 'animate-spin' : ''}`} />
            {triggeringBackup ? 'Generating Snapshot...' : 'Trigger Verified Backup Snapshot'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Snapshot Verification Card */}
      {lastBackupManifest && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 space-y-3 text-xs text-emerald-950">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" /> Verified Snapshot Manifest ({lastBackupManifest.backupId})
            </span>
            <span className="font-mono text-[11px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-300">
              {lastBackupManifest.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
            <div className="bg-white p-2 rounded-xl border border-emerald-200">
              Assets: <strong>{lastBackupManifest.collections?.assets}</strong>
            </div>
            <div className="bg-white p-2 rounded-xl border border-emerald-200">
              Complaints: <strong>{lastBackupManifest.collections?.complaints}</strong>
            </div>
            <div className="bg-white p-2 rounded-xl border border-emerald-200">
              Work Orders: <strong>{lastBackupManifest.collections?.workOrders}</strong>
            </div>
            <div className="bg-white p-2 rounded-xl border border-emerald-200">
              Audit Logs: <strong>{lastBackupManifest.collections?.auditLogs}</strong>
            </div>
          </div>

          <div className="text-[11px] text-emerald-800 font-mono">
            SHA-256 Digest: {lastBackupManifest.digestSha256}
          </div>
        </div>
      )}

      {/* Retention Parameters Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-600" /> Automated Snapshot Schedule & Storage Provider
            </h2>
            <p className="text-xs text-slate-500">Scheduled municipal backup interval and target volume path.</p>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Retention Policies'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <label className="font-bold text-slate-800 block">Snapshot Frequency (Hours)</label>
            <input
              type="number"
              value={backupSettings.automatedBackupIntervalHours || 24}
              onChange={(e) =>
                setBackupSettings({
                  ...backupSettings,
                  automatedBackupIntervalHours: parseInt(e.target.value, 10) || 24
                })
              }
              className="w-full p-2 border border-slate-300 rounded-xl bg-white font-bold"
            />
            <p className="text-[11px] text-slate-400">Default 24-hour incremental snapshot interval.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <label className="font-bold text-slate-800 block">Snapshot Retention Window (Days)</label>
            <input
              type="number"
              value={backupSettings.retentionPolicyDays || 365}
              onChange={(e) =>
                setBackupSettings({
                  ...backupSettings,
                  retentionPolicyDays: parseInt(e.target.value, 10) || 365
                })
              }
              className="w-full p-2 border border-slate-300 rounded-xl bg-white font-bold"
            />
            <p className="text-[11px] text-slate-400">Days to retain daily snapshots before pruning.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <label className="font-bold text-slate-800 block">Storage Provider Configuration</label>
            <input
              type="text"
              value={backupSettings.storageProvider || 'Local Secure Encrypted Store'}
              onChange={(e) => setBackupSettings({ ...backupSettings, storageProvider: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white font-semibold"
            />
            <p className="text-[11px] text-slate-400">Object store provider / mount point.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
