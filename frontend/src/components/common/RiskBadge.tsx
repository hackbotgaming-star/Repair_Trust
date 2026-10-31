import React from 'react';

interface RiskBadgeProps {
  level: 'LOW' | 'MODERATE' | 'HIGH';
  score?: number;
  repeatFailure?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, repeatFailure }) => {
  const getStyle = () => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'MODERATE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${getStyle()}`}>
        {level} RISK
        {score !== undefined && <span className="opacity-75">({score.toFixed(0)}%)</span>}
      </span>
      {repeatFailure && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider border border-rose-300">
          Repeat Failure
        </span>
      )}
    </div>
  );
};
