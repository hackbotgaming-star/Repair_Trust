import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { AnalyticsData } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  Calendar,
  AlertTriangle,
  FileCheck,
  Clock,
  Layers,
  HelpCircle,
  Brain,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [windowDays, setWindowDays] = useState<number>(60);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [aiMetrics, setAiMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [anRes, aiRes] = await Promise.all([
          api.analytics.get(windowDays),
          api.ai.getMetrics()
        ]);
        setAnalytics(anRes.data);
        setAiMetrics(aiRes.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [windowDays]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-80 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Window Configurator */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              CORE MODULES 10 & 14
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500">Empirical Performance Metrics</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-600" />
            Risk & Repeat-Failure Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Standardized municipal engineering performance indicators with configurable observation intervals.
          </p>
        </div>

        {/* Observation Window Selector */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <Calendar className="w-4 h-4 text-slate-400 ml-1" />
          <span className="text-xs font-bold text-slate-700">Observation Window:</span>
          <div className="flex gap-1">
            {[30, 60, 90, 180].map((days) => (
              <button
                key={days}
                onClick={() => setWindowDays(days)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  windowDays === days
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Repeat-Failure Rate</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{analytics.kpis.repeatFailureRate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {analytics.kpis.repeatFailureCases} repeat failure cases within {windowDays}d window
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Evidence Completeness</span>
            <FileCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-bold text-teal-700">{analytics.kpis.evidenceCompletenessRate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Verified by deterministic Closure Auditor
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Review Turnaround</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{analytics.kpis.avgTimeToReviewHours} hrs</div>
          <p className="text-[11px] text-slate-500 mt-1">From worker submit to engineer review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Assets Requiring Audit</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{analytics.kpis.assetsRequiringInspection}</div>
          <p className="text-[11px] text-slate-500 mt-1">Flagged for physical camera inspection</p>
        </div>
      </div>

      {/* Transparent Formula Definitions Card */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs text-slate-700 space-y-2">
        <div className="font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-teal-600" />
          Transparent Formula & Measurement Criteria
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px]">
            <span className="text-slate-400 block mb-0.5">Repeat-Failure Rate Formula:</span>
            <span className="text-teal-800 font-bold">{analytics.definitions.repeatFailureRateFormula}</span>
            <p className="text-slate-500 text-[10px] mt-1 font-sans">
              Evaluates recurring failures occurring strictly within the defined {windowDays}-day observation window after verified repairs.
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px]">
            <span className="text-slate-400 block mb-0.5">Evidence Completeness Rate Formula:</span>
            <span className="text-teal-800 font-bold">{analytics.definitions.evidenceCompletenessFormula}</span>
            <p className="text-slate-500 text-[10px] mt-1 font-sans">
              Counts mandatory pre-repair, in-progress, post-repair, and LiveWork Proof video submissions.
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ward Breakdown Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Ward Infrastructure Activity</h3>
          <p className="text-xs text-slate-500 mb-4">Total assets vs. high-risk flags across municipal wards</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.wardBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="ward" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="totalAssets" name="Total Assets" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="highRiskAssets" name="High Risk Assets" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Closure Auditor Status Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Closure Auditor Status Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Verification compliance across all historical repair orders</p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.auditorStatusBreakdown}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {analytics.auditorStatusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI/ML Model Transparency & Calibration Card (Core Module 9 & 13) */}
      {aiMetrics && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  AI Model Performance & Calibration Metrics
                </h3>
                <p className="text-xs text-slate-500">
                  Trained on synthetic labeled municipal dataset ({aiMetrics.dataset_label || 'v1.2.0'})
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold bg-teal-50 text-teal-800 px-2.5 py-1 rounded border border-teal-200">
              {aiMetrics.model_version || 'v1.2.0-synthetic-demo'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-0.5">Accuracy</span>
              <span className="font-mono text-lg font-bold text-slate-900">
                {(aiMetrics.metrics?.accuracy * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-0.5">Precision</span>
              <span className="font-mono text-lg font-bold text-teal-700">
                {(aiMetrics.metrics?.precision * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-0.5">Recall</span>
              <span className="font-mono text-lg font-bold text-blue-700">
                {(aiMetrics.metrics?.recall * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-0.5">F1-Score</span>
              <span className="font-mono text-lg font-bold text-purple-700">
                {(aiMetrics.metrics?.f1_score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-0.5">ROC-AUC</span>
              <span className="font-mono text-lg font-bold text-emerald-700">
                {(aiMetrics.metrics?.roc_auc * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Confusion Matrix Display */}
          {aiMetrics.metrics?.confusion_matrix && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Test Set Confusion Matrix (N={aiMetrics.test_samples || 150})
              </div>
              <div className="grid grid-cols-2 max-w-sm gap-2 font-mono text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block">True Negative</span>
                  <span className="font-bold text-emerald-700">{aiMetrics.metrics.confusion_matrix.true_negative}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block">False Positive</span>
                  <span className="font-bold text-rose-600">{aiMetrics.metrics.confusion_matrix.false_positive}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block">False Negative</span>
                  <span className="font-bold text-rose-600">{aiMetrics.metrics.confusion_matrix.false_negative}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block">True Positive</span>
                  <span className="font-bold text-emerald-700">{aiMetrics.metrics.confusion_matrix.true_positive}</span>
                </div>
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{aiMetrics.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
};
