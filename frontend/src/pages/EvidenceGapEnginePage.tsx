import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Asset } from '../types';
import {
  Sparkles,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ClipboardCheck,
  Wrench,
  Search,
  Filter,
  ShieldAlert,
  ChevronRight,
  GitBranch,
  Layers,
  FileText,
  Info,
  Calendar,
  Zap,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const EvidenceGapEnginePage: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('DR-001');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [commissioning, setCommissioning] = useState<boolean>(false);
  const [commissionSuccess, setCommissionSuccess] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchAssetsAndAnalysis = async (assetId: string) => {
    try {
      setLoading(true);
      const [assetsRes, rootCauseRes] = await Promise.all([
        api.assets.list({ limit: 50 }),
        api.assets.getRootCause(assetId)
      ]);
      setAssets(assetsRes.data);
      setAnalysis(rootCauseRes.data);
    } catch (err) {
      console.error('Failed to load evidence gap analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetsAndAnalysis(selectedAssetId);
  }, [selectedAssetId]);

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setCommissionSuccess(null);
  };

  // 1-Click Commission Action: Schedules recommended inspection in real database
  const handleCommissionInspection = async () => {
    if (!analysis || !analysis.recommendedNextInspection) return;
    try {
      setCommissioning(true);
      const rec = analysis.recommendedNextInspection;
      const res = await api.inspections.create({
        assetId: analysis.assetId,
        inspectionType: rec.suggestedAction.toLowerCase().includes('cctv')
          ? 'Downstream CCTV / Camera Probe'
          : rec.suggestedAction.toLowerCase().includes('hydraulic')
          ? 'Cross-Section & Hydraulic Flow Survey'
          : 'Physical Site & Silt Measurement',
        findings: {
          siltDepthCm: 35,
          waterFlowStatus: 'Obstructed',
          notes: `Authorized by Municipal Engineer via Evidence-Gap Engine to distinguish hypotheses: ${rec.hypothesesDistinguished.join(', ')}. Target: ${rec.suggestedAction}`
        },
        recommendations: rec.expectedBenefit
      });

      setCommissionSuccess(
        `Inspection order #${res.data?.inspectionId || 'INS-CONFIRMED'} officially commissioned in Municipal Registry for asset ${analysis.assetId}!`
      );
    } catch (err: any) {
      alert('Failed to commission inspection: ' + err.message);
    } finally {
      setCommissioning(false);
    }
  };

  const filteredAssets = assets.filter(
    (a) =>
      a.assetId.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.location.ward.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Mission Statement */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" /> Evidence-Gap Engine v2.1
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-300">
              Active Module: Decision-Support & Diagnostic Triage
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Distinguish Hypotheses. Eliminate Guesswork.
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Municipal drainage repairs often fail repeatedly because surface cleaning is ordered without verifying downstream capacity.
            The Evidence-Gap Engine evaluates competing failure hypotheses and pinpoints the <strong>single highest-yield inspection</strong> to confirm the true bottleneck.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-teal-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Evidence-Backed Citations
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> No Unverified Diagnostic Claims
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" /> 1-Click Field Dispatch
            </span>
          </div>
        </div>
      </div>

      {/* Asset Selector & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Select Infrastructure Asset for Gap Analysis</h2>
            <p className="text-xs text-slate-500">Pick an asset to inspect historical maintenance records and evaluate causal evidence.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets (e.g. DR-001, MG Road)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Quick select pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 text-xs">
          <span className="text-slate-400 font-medium text-[11px] shrink-0">High-Risk Assets:</span>
          {filteredAssets.slice(0, 8).map((asset) => (
            <button
              key={asset.assetId}
              onClick={() => handleSelectAsset(asset.assetId)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                selectedAssetId === asset.assetId
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{asset.assetId}</span>
              {asset.repeatFailureFlag && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Recurring Failure" />
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Synthesizing Historical Evidence & Hydrologic Records...</p>
          <p className="text-xs text-slate-400">Comparing complaints, cleaning work orders, downstream gradients, and local rainfall events.</p>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Section 1: The Recommended Next Inspection Card (Evidence Gap) */}
          {analysis.recommendedNextInspection && (
            <div className="bg-gradient-to-br from-amber-500/10 via-white to-teal-500/10 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 shadow-md relative">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-amber-500 text-white tracking-wider flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> High-Yield Recommended Action
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Target Asset: <strong className="font-mono text-slate-800">{analysis.assetId}</strong> ({analysis.assetName})
                    </span>
                    <span className="text-xs text-slate-400">• Ward: {analysis.ward}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {analysis.recommendedNextInspection.suggestedAction}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-amber-200">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Critical Missing Evidence
                      </span>
                      <p className="text-slate-700 leading-relaxed">
                        {analysis.recommendedNextInspection.missingEvidence}
                      </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-teal-200">
                      <span className="font-bold text-teal-900 flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Expected Engineering Benefit
                      </span>
                      <p className="text-slate-700 leading-relaxed">
                        {analysis.recommendedNextInspection.expectedBenefit}
                      </p>
                    </div>
                  </div>

                  {/* Competing hypotheses distinguished */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-500 font-semibold">Distinguishes:</span>
                    {analysis.recommendedNextInspection.hypothesesDistinguished.map((hyp: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium border border-slate-200"
                      >
                        {hyp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dispatch Button / Action Box */}
                <div className="w-full lg:w-72 shrink-0 bg-white p-4 rounded-2xl border border-amber-200 shadow-xs space-y-3 text-center">
                  <div className="text-xs text-slate-500">
                    Priority Rating: <strong className="text-rose-600 font-bold">{analysis.recommendedNextInspection.priority || 'Urgent'}</strong>
                  </div>

                  {commissionSuccess ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 space-y-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                      <p className="font-bold">{commissionSuccess}</p>
                      <Link
                        to="/inspections"
                        className="inline-block px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px] hover:bg-emerald-700 transition"
                      >
                        View in Inspections Hub
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={handleCommissionInspection}
                      disabled={commissioning}
                      className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      {commissioning ? 'Recording Order...' : 'Commission Recommended Inspection'}
                    </button>
                  )}

                  <p className="text-[11px] text-slate-400 leading-normal">
                    Dispatches official inspection order to Zone 4 survey team with pre-filled telemetry requirements.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Competing Hypotheses Comparison */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Evaluated Causal Hypotheses & Evidence Citing</h3>
                <p className="text-xs text-slate-500">
                  Every hypothesis cites specific database records (complaint IDs, work orders, rainfall stations). None are ungrounded assumptions.
                </p>
              </div>

              <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs text-slate-600 font-medium">
                Asset History: <strong>{analysis.totalComplaints || 0} Complaints</strong> • <strong>{analysis.totalCleanings || 0} Cleanings</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.hypotheses.map((hyp: any, idx: number) => {
                const isTopHypothesis = idx === 0;
                return (
                  <div
                    key={hyp.cause}
                    className={`bg-white rounded-2xl border p-5 transition space-y-3.5 shadow-xs ${
                      isTopHypothesis
                        ? 'border-teal-400 ring-2 ring-teal-500/10'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Header with confidence score */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            Hypothesis #{idx + 1}
                          </span>
                          {isTopHypothesis && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800 uppercase">
                              Leading Plausibility
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{hyp.cause}</h4>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900">{hyp.confidenceScore}%</span>
                        <div className="text-[10px] text-slate-400 font-medium uppercase">Confidence</div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          hyp.confidenceScore > 70
                            ? 'bg-teal-600'
                            : hyp.confidenceScore > 40
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${hyp.confidenceScore}%` }}
                      />
                    </div>

                    {/* Supporting Evidence */}
                    <div className="space-y-1.5 text-xs">
                      <span className="font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Supporting Evidence ({hyp.supportingEvidence.length})
                      </span>
                      {hyp.supportingEvidence.length > 0 ? (
                        <ul className="space-y-1 pl-4 list-disc text-slate-600">
                          {hyp.supportingEvidence.map((ev: string, i: number) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400 italic pl-4">No verified supporting records found.</p>
                      )}
                    </div>

                    {/* Contradicting Evidence */}
                    <div className="space-y-1.5 text-xs">
                      <span className="font-bold text-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" /> Contradicting Evidence ({hyp.contradictingEvidence.length})
                      </span>
                      {hyp.contradictingEvidence.length > 0 ? (
                        <ul className="space-y-1 pl-4 list-disc text-slate-600">
                          {hyp.contradictingEvidence.map((ev: string, i: number) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400 italic pl-4">No contradictory field data identified.</p>
                      )}
                    </div>

                    {/* Cited Database Records */}
                    {hyp.evidenceCitationRecords && hyp.evidenceCitationRecords.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400 font-semibold">Citations:</span>
                        {hyp.evidenceCitationRecords.slice(0, 4).map((cite: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md font-mono bg-slate-50 text-slate-600 border border-slate-200"
                          >
                            {cite}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Diagnostic Principles & Integrity Notice */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs text-slate-600 space-y-2">
            <h5 className="font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-600" /> Municipal Engineering Accountability Protocol
            </h5>
            <p className="leading-relaxed">
              Automated hypothesis scores are decision-support heuristics derived from historical maintenance frequency, hydraulic ratios, and precipitation correlation.
              They are <strong>not definitive engineering conclusions</strong>. Definitive diagnoses require certified physical inspection and calibrated sensor measurement before capital work orders are authorized.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          No analysis data available for {selectedAssetId}.
        </div>
      )}
    </div>
  );
};
