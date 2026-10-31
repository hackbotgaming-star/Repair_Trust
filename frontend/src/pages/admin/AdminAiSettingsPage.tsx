import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Cpu,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle,
  FileCheck,
  TrendingUp,
  Activity
} from 'lucide-react';

export const AdminAiSettingsPage: React.FC = () => {
  const [aiData, setAiData] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable fields
  const [phashThreshold, setPhashThreshold] = useState(12);
  const [rootCauseCutoff, setRootCauseCutoff] = useState(75);
  const [fastApiUrl, setFastApiUrl] = useState('http://127.0.0.1:8000');
  const [isOperational, setIsOperational] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aiRes, cfgRes] = await Promise.all([
        api.admin.getAiModels(),
        api.admin.getConfig()
      ]);
      setAiData(aiRes.data);
      setConfig(cfgRes.data);

      const aiCfg = cfgRes.data.aiModelSettings || {};
      setPhashThreshold(aiCfg.perceptualHashThreshold || 12);
      setRootCauseCutoff(aiCfg.rootCauseConfidenceCutoff || 75);
      setFastApiUrl(aiCfg.mlServiceUrl || 'http://127.0.0.1:8000');
      setIsOperational(aiCfg.isOperational !== false);
    } catch (err) {
      console.error('Failed to load AI model settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMsg(null);
      await api.admin.updateConfig('ai-settings', {
        aiModelSettings: {
          perceptualHashThreshold: phashThreshold,
          rootCauseConfidenceCutoff: rootCauseCutoff,
          mlServiceUrl: fastApiUrl,
          isOperational,
          lastEvaluatedAt: new Date()
        }
      });
      setSuccessMsg('AI Model configurations and inference thresholds updated.');
      setTimeout(() => setSuccessMsg(null), 4000);
      await fetchData();
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
                <Cpu className="w-3.5 h-3.5 text-indigo-300" /> Core Module 7: AI/ML Decision Intelligence
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Synthetic Benchmark Labeled
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Models & Detection Settings
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Supervise image-fraud perceptual hashing, hydraulic bottleneck random forests, and closure rule validation.
              Automated predictions assist engineering review but never replace certified human inspection.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Commit Model Parameters'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Synthetic Benchmark Alert */}
      <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">Synthetic Demonstration Benchmark Label:</span>
          <p className="leading-relaxed">
            {aiData?.syntheticDataDisclaimer ||
              'Current accuracy scores (94.2% precision) are evaluated on synthetic municipal stormwater telemetry and historical scenario DR-001. Model metrics reflect controlled test sets and must be calibrated with live municipality field data prior to production scale.'}
          </p>
        </div>
      </div>

      {/* Active AI Models Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Deployed Detection Engines & Models</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiData?.models?.map((mdl: any) => (
            <div
              key={mdl.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {mdl.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {mdl.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{mdl.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono">Type: {mdl.type} • Version: {mdl.version}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{mdl.targetCapabilities}</p>
              </div>

              {/* Validation Metrics */}
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Validation Benchmark Metrics
                </span>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  {Object.entries(mdl.validationMetrics || {}).map(([k, v]) => (
                    <div key={k} className="bg-white p-1.5 rounded-lg border border-slate-200 text-slate-700">
                      <span className="text-[10px] text-slate-400 block uppercase">{k}</span>
                      <strong className="text-indigo-900">{String(v)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Limitations Notice */}
              <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-xl text-[11px] text-rose-900 space-y-0.5">
                <span className="font-bold flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-rose-600" /> Known Limitation:
                </span>
                <p className="leading-tight text-slate-600">{mdl.limitations}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Parameters Configuration Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Inference Sensitivity & Endpoint Controls</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <label className="font-bold text-slate-800 block">pHash Duplicate Distance Threshold</label>
            <input
              type="number"
              value={phashThreshold}
              onChange={(e) => setPhashThreshold(parseInt(e.target.value, 10) || 12)}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white font-bold"
            />
            <p className="text-[11px] text-slate-400">Hamming distance cutoff (default 12 bits) to flag suspicious re-uploaded photos.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <label className="font-bold text-slate-800 block">Root-Cause Confidence Cutoff (%)</label>
            <input
              type="number"
              value={rootCauseCutoff}
              onChange={(e) => setRootCauseCutoff(parseInt(e.target.value, 10) || 75)}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white font-bold"
            />
            <p className="text-[11px] text-slate-400">Minimum probability required before downstream CCTV probe is recommended.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <label className="font-bold text-slate-800 block">FastAPI Microservice URL</label>
            <input
              type="text"
              value={fastApiUrl}
              onChange={(e) => setFastApiUrl(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white font-mono text-[11px]"
            />
            <p className="text-[11px] text-slate-400">HTTP bridge for Python scikit-learn model inference service.</p>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isOperational}
              onChange={(e) => setIsOperational(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className="font-bold text-slate-800">AI Assistance Operational (Enable automated perceptual hash screening & root-cause ranking)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
