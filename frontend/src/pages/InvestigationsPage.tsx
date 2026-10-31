import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Asset, Investigation } from '../types';
import { HypothesisCard } from '../components/investigations/HypothesisCard';
import { EvidenceGapRecommendation } from '../components/investigations/EvidenceGapRecommendation';
import { SearchCode, Compass, ShieldCheck, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';

export const InvestigationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAssetId = searchParams.get('assetId') || 'DR-001';

  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAssetId);
  const [assetList, setAssetList] = useState<Asset[]>([]);
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState(true);

  // Engineer conclusion inputs
  const [conclusion, setConclusion] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [resolving, setResolving] = useState(false);
  const [resolveSuccess, setResolveSuccess] = useState(false);

  useEffect(() => {
    api.assets.list({ limit: 50 }).then((res) => setAssetList(res.data)).catch(console.error);
  }, []);

  const loadInvestigation = async (assetId: string) => {
    try {
      setLoading(true);
      const res = await api.investigations.get(assetId);
      setInvestigation(res.data);
      setSearchParams({ assetId });
    } catch (err) {
      console.error('Failed to load investigation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestigation(selectedAssetId);
  }, [selectedAssetId]);

  const handleResolveInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !conclusion.trim()) return;
    setResolving(true);
    try {
      const res = await api.investigations.resolve(selectedAssetId, {
        conclusion: conclusion.trim(),
        actionTaken: actionTaken.trim() || 'Physical inspection verified downstream section unblocked'
      });
      setInvestigation(res.data);
      setResolveSuccess(true);
      setTimeout(() => setResolveSuccess(false), 5000);
    } catch (err: any) {
      alert('Error resolving investigation: ' + err.message);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              CORE MODULES 7 & 8
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500">Transparent AI Analysis</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <SearchCode className="w-6 h-6 text-teal-600" />
            AI Root-Cause Investigation & Evidence-Gap Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Synthesizes recurring maintenance patterns, rainfall observations, and evidence gaps into actionable recommendations.
          </p>
        </div>

        {/* Asset Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Select Asset:</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-teal-500 outline-none"
          >
            {assetList.map((a) => (
              <option key={a.assetId} value={a.assetId}>
                {a.assetId} — {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse space-y-4">
          <div className="h-40 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      ) : investigation ? (
        <div className="space-y-8">
          {/* Top Evidence-Gap Recommendation Banner */}
          {investigation.recommendedNextInspection && (
            <EvidenceGapRecommendation
              assetId={investigation.assetId}
              recommendation={investigation.recommendedNextInspection}
              onInspectionAuthorized={() => loadInvestigation(selectedAssetId)}
            />
          )}

          {/* Root-Cause Hypotheses Evaluation Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Hypotheses Evaluation Matrix ({investigation.hypotheses.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Ranked by empirical evidence alignment from historical complaints, cleanings, and rainfall logs.
                </p>
              </div>
              <div className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200">
                AI Confidence: <strong className="text-teal-700">{investigation.aiConfidence}%</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {investigation.hypotheses.map((hyp, idx) => (
                <HypothesisCard key={idx} hypothesis={hyp} rank={idx + 1} />
              ))}
            </div>
          </div>

          {/* Engineer Final Conclusion Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Municipal Engineer Root-Cause Conclusion
                </h3>
                <p className="text-xs text-slate-500">
                  Record official engineering determination to close investigation and clear repeat-failure flag.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Status: {investigation.status}
              </span>
            </div>

            {resolveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-semibold">
                  Investigation resolved! Asset status restored to Active and repeat failure flag cleared.
                </span>
              </div>
            )}

            <form onSubmit={handleResolveInvestigation} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Root Cause Determination & Findings:
                </label>
                <textarea
                  rows={3}
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  placeholder="e.g. CCTV inspection confirmed 30cm silt dam at railway culvert underpass (DR-002). Flushing cleared downstream receiver trunk."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Corrective Action Implemented:
                </label>
                <input
                  type="text"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="e.g. Cleared downstream culvert blockage, verified gradient, and restored full hydraulic invert discharge."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={resolving || !conclusion.trim()}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs"
                >
                  {resolving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-teal-400" /> Resolve & Clear Repeat Failure Alert
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400">No investigation record found for this asset.</div>
      )}
    </div>
  );
};
