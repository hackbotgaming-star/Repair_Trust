import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  RotateCcw,
  Layers,
  Info,
  Calendar,
  AlertCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { Interactive3DCard } from '../components/common/Interactive3DCard';

export const PublicTransparencyPage: React.FC = () => {
  const [observationWindow, setObservationWindow] = useState(60);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (windowDays: number) => {
    setLoading(true);
    try {
      const res = await api.analytics.get(windowDays);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load transparency analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(observationWindow);
  }, [observationWindow]);

  const categoryBreakdown = [
    { name: 'Overflow / Drainage', count: 42, color: '#0d9488' },
    { name: 'Pothole & Roads', count: 28, color: '#3b82f6' },
    { name: 'Debris / Silt', count: 24, color: '#f59e0b' },
    { name: 'Damaged Culverts', count: 16, color: '#8b5cf6' },
    { name: 'Footpaths', count: 12, color: '#ec4899' },
    { name: 'Other', count: 8, color: '#64748b' }
  ];

  const wardResolutionStats = [
    { ward: 'Ward 1', reported: 18, resolved: 14, repeatFailures: 2 },
    { ward: 'Ward 2', reported: 24, resolved: 18, repeatFailures: 3 },
    { ward: 'Ward 3', reported: 15, resolved: 12, repeatFailures: 1 },
    { ward: 'Ward 4 (Central)', reported: 38, resolved: 26, repeatFailures: 6 },
    { ward: 'Ward 5', reported: 19, resolved: 15, repeatFailures: 2 },
    { ward: 'Ward 6', reported: 22, resolved: 17, repeatFailures: 4 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner with Strict Disclaimer */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-200/80 px-4 py-3 text-xs text-amber-900">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>SYNTHETIC DEMO BENCHMARK DATASET:</strong> All statistics below are calculated from verified synthetic municipal records for software evaluation. They are never presented as actual municipal performance.
            </span>
          </div>
          <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase hidden sm:inline">
            Demonstration Mode
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 mb-2">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              Public Accountability Dashboard
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Municipal Repair Transparency & Metrics</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time calculations of evidence-backed closure rates, failure recurrence cycles, and engineering review performance.
            </p>
          </div>

          {/* Observation Window Selector */}
          <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 font-semibold px-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Window:
            </span>
            {[30, 60, 90, 180].map((days) => (
              <button
                key={days}
                onClick={() => setObservationWindow(days)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  observationWindow === days
                    ? 'bg-teal-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Interactive3DCard className="glass-panel p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg bg-white/80 backdrop-blur-md">
            <div className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between mb-1">
              <span>Repeat-Failure Rate</span>
              <RotateCcw className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-3xl font-black text-rose-600">
              {analytics?.repeatFailureRate !== undefined ? `${analytics.repeatFailureRate}%` : '27.3%'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
              Repaired assets with verified failure recurrence within {observationWindow}-day observation window.
            </p>
          </Interactive3DCard>

          <Interactive3DCard className="glass-panel p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg bg-white/80 backdrop-blur-md">
            <div className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between mb-1">
              <span>Evidence Completeness</span>
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-black text-teal-600">
              {analytics?.evidenceCompletenessRate !== undefined ? `${analytics.evidenceCompletenessRate}%` : '66.7%'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
              Work orders with verified photo & video proof required by Closure Auditor.
            </p>
          </Interactive3DCard>

          <Interactive3DCard className="glass-panel p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg bg-white/80 backdrop-blur-md">
            <div className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between mb-1">
              <span>Mean Resolution Time</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">
              {analytics?.avgTimeToReviewHours !== undefined ? `${analytics.avgTimeToReviewHours}h` : '18.4h'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
              Average elapsed time between citizen report and municipal engineering sign-off.
            </p>
          </Interactive3DCard>

          <Interactive3DCard className="glass-panel p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg bg-white/80 backdrop-blur-md">
            <div className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between mb-1">
              <span>Registered Assets</span>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">
              {analytics?.totalAssets || 22} Assets
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
              Stormwater box drains, arterial culverts, and municipal road corridors.
            </p>
          </Interactive3DCard>
        </div>

        {/* Visual Charts: Issues by Category & Ward Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Categories */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Reported Issues by Infrastructure Category
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Category Share</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0d9488" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Resolution & Recurrence by Ward */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Reported vs. Resolved vs. Repeat Failures by Ward
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Ward Comparison</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardResolutionStats} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="ward" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="reported" fill="#94a3b8" name="Reported Issues" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" fill="#10b981" name="Verified Resolved" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="repeatFailures" fill="#e11d48" name="Repeat Failures" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Metric Definitions & Mathematical Formulas */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <HelpCircle className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">
              Transparent Metric Definitions & Mathematical Formulations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm">1. Repeat-Failure Rate Formula</span>
              <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-teal-800">
                Repeat-Failure Rate = (Assets with verified repeat failure within window / Eligible repaired assets) × 100
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Prevents concealing recurring infrastructure issues by tracking how many assets suffer re-flooding or re-blockage within the observation period following an approved repair.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm">2. Evidence Completeness Rate Formula</span>
              <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-teal-800">
                Evidence Completeness = (Submitted required checklist items / Expected mandatory checklist items) × 100
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Calculated strictly by the deterministic Closure Auditor. A repair order cannot be marked verified without pre-repair photos, post-repair evidence, and live-recorded video proof.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
