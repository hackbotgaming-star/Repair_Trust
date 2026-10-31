import React from 'react';
import { Hypothesis } from '../../types';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';

interface HypothesisCardProps {
  hypothesis: Hypothesis;
  rank: number;
}

export const HypothesisCard: React.FC<HypothesisCardProps> = ({ hypothesis, rank }) => {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const getBarColor = (score: number) => {
    if (score >= 75) return 'bg-red-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-teal-500';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center">
            {rank}
          </span>
          <h4 className="text-sm font-bold text-slate-900">{hypothesis.cause}</h4>
        </div>
        <div className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${getScoreColor(hypothesis.confidenceScore)}`}>
          {hypothesis.confidenceScore}% Confidence
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(hypothesis.confidenceScore)}`}
          style={{ width: `${hypothesis.confidenceScore}%` }}
        />
      </div>

      {/* Supporting Evidence */}
      <div className="space-y-1.5 mb-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Supporting Historical Evidence:
        </div>
        {hypothesis.supportingEvidence.map((ev, i) => (
          <div key={i} className="text-xs text-slate-700 flex items-start gap-1.5 leading-relaxed">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{ev}</span>
          </div>
        ))}
      </div>

      {/* Contradicting or Missing Evidence */}
      {hypothesis.contradictingEvidence.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-slate-100 mb-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Contradicting / Counter Evidence:
          </div>
          {hypothesis.contradictingEvidence.map((ev, i) => (
            <div key={i} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span>{ev}</span>
            </div>
          ))}
        </div>
      )}

      {/* Citations */}
      {hypothesis.evidenceCitationRecords && hypothesis.evidenceCitationRecords.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <FileText className="w-3 h-3" /> Cited Records:
          </span>
          {hypothesis.evidenceCitationRecords.map((cite, i) => (
            <span
              key={i}
              className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200"
            >
              {cite}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
