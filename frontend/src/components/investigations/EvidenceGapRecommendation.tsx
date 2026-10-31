import React, { useState } from 'react';
import { api } from '../../api/client';
import { Compass, ArrowRight, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

interface EvidenceGapRecommendationProps {
  assetId: string;
  recommendation: {
    suggestedAction: string;
    missingEvidence: string;
    hypothesesDistinguished: string[];
    expectedBenefit: string;
    priority: 'Urgent' | 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'Scheduled' | 'Completed';
  };
  onInspectionAuthorized?: () => void;
}

export const EvidenceGapRecommendation: React.FC<EvidenceGapRecommendationProps> = ({
  assetId,
  recommendation,
  onInspectionAuthorized
}) => {
  const [authorizing, setAuthorizing] = useState(false);
  const [authorized, setAuthorized] = useState(recommendation.status === 'Scheduled');

  const handleAuthorize = async () => {
    try {
      setAuthorizing(true);
      await api.inspections.create({
        assetId,
        inspectionType: 'Downstream CCTV / Camera Probe',
        findings: {
          debrisLevel: 'Heavy / Choked',
          structuralIntegrity: 'Sound',
          downstreamFlowClear: false,
          siltDepthCm: 32,
          notes: 'Emergency inspection authorized via Evidence-Gap Engine recommendation.'
        },
        recommendation: {
          actionRequired: true,
          suggestedRepairType: 'Downstream Obstruction Removal',
          urgency: 'Urgent'
        }
      });
      setAuthorized(true);
      onInspectionAuthorized?.();
    } catch (err: any) {
      alert('Error creating inspection: ' + err.message);
    } finally {
      setAuthorizing(false);
    }
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'Urgent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md border border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Evidence-Gap Engine Recommendation</h3>
            <p className="text-xs text-slate-400">Next best inspection to resolve root-cause uncertainty</p>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPriorityStyle(recommendation.priority)}`}>
          {recommendation.priority} Priority
        </span>
      </div>

      <div className="space-y-4 text-xs">
        {/* Missing Evidence Box */}
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Identified Evidence Gap:
          </span>
          <p className="text-slate-200 leading-relaxed font-medium">{recommendation.missingEvidence}</p>
        </div>

        {/* Suggested Action */}
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block mb-1">
            Recommended Action:
          </span>
          <p className="text-white text-sm font-semibold leading-relaxed">{recommendation.suggestedAction}</p>
        </div>

        {/* Expected Benefit */}
        <div className="flex items-start gap-2 text-slate-300">
          <ArrowRight className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-white">Expected Engineering Benefit:</strong> {recommendation.expectedBenefit}
          </span>
        </div>

        {/* Distinguishes */}
        {recommendation.hypothesesDistinguished && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Distinguishes Hypotheses:
            </span>
            {recommendation.hypothesesDistinguished.map((h, i) => (
              <span
                key={i}
                className="bg-slate-700/70 text-slate-200 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-600"
              >
                {h}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="mt-5 pt-4 border-t border-slate-700 flex items-center justify-between">
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Explainable rule-based decision support logic</span>
        </div>

        {authorized ? (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-950 text-emerald-400 border border-emerald-700/50 rounded-xl text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" /> Inspection Commissioned
          </span>
        ) : (
          <button
            onClick={handleAuthorize}
            disabled={authorizing}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            {authorizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Authorizing...
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" /> Authorize Downstream Inspection
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
