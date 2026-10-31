import React from 'react';
import { AuditorFlag } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ShieldCheck, AlertCircle, AlertTriangle, CheckCircle2, Info, FileText } from 'lucide-react';

interface AuditorEvaluationPanelProps {
  status: 'Complete' | 'Incomplete' | 'Under Review' | 'Unverified' | 'Approved';
  flags: AuditorFlag[];
  checklist?: {
    beforePhotoRequired: boolean;
    duringPhotoRequired: boolean;
    afterPhotoRequired: boolean;
    videoProofRequired: boolean;
    completionNoteRequired: boolean;
  };
  evidenceCounts?: {
    beforeCount: number;
    duringCount: number;
    afterCount: number;
    videoCount: number;
    hasNotes: boolean;
  };
}

export const AuditorEvaluationPanel: React.FC<AuditorEvaluationPanelProps> = ({
  status,
  flags = [],
  checklist,
  evidenceCounts
}) => {
  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            Closure Auditor Deterministic Verification
          </h3>
          <p className="text-xs text-slate-500">
            Rule-based compliance engine validating required evidence before municipal sign-off.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Auditor Status:</span>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Checklist Grid */}
      {checklist && evidenceCounts && (
        <div className="mb-5 bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Mandatory Evidence Checklist
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Before */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
              <span className="text-xs text-slate-600 font-medium">1. Pre-Work Baseline</span>
              <div className="flex items-center gap-1.5 mt-2">
                {evidenceCounts.beforeCount > 0 ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {evidenceCounts.beforeCount} Photo(s)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Missing
                  </span>
                )}
              </div>
            </div>

            {/* During */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
              <span className="text-xs text-slate-600 font-medium">2. In-Progress Fix</span>
              <div className="flex items-center gap-1.5 mt-2">
                {evidenceCounts.duringCount > 0 ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {evidenceCounts.duringCount} Photo(s)
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    Optional / 0
                  </span>
                )}
              </div>
            </div>

            {/* After */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
              <span className="text-xs text-slate-600 font-medium">3. Post-Repair Invert</span>
              <div className="flex items-center gap-1.5 mt-2">
                {evidenceCounts.afterCount > 0 ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {evidenceCounts.afterCount} Photo(s)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Missing
                  </span>
                )}
              </div>
            </div>

            {/* Video */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
              <span className="text-xs text-slate-600 font-medium">4. LiveWork Video</span>
              <div className="flex items-center gap-1.5 mt-2">
                {evidenceCounts.videoCount > 0 ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {evidenceCounts.videoCount} Uploaded
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Missing
                  </span>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
              <span className="text-xs text-slate-600 font-medium">5. Completion Log</span>
              <div className="flex items-center gap-1.5 mt-2">
                {evidenceCounts.hasNotes ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Logged
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Missing Notes
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flags List */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Auditor Findings ({flags.length})
        </div>

        {flags.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              All mandatory evidence items and asset validation checks passed. Ready for municipal sign-off.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {flags.map((flag, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                  flag.severity === 'error'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                    : flag.severity === 'warning'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-blue-50/80 border-blue-200 text-blue-900'
                }`}
              >
                {getSeverityIcon(flag.severity)}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold tracking-tight">{flag.rule}</span>
                    <span className="font-mono text-[10px] uppercase font-bold opacity-75">{flag.code}</span>
                  </div>
                  <p className="mt-1 opacity-90 leading-relaxed">{flag.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
