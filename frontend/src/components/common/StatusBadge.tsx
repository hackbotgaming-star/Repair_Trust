import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Approved':
      case 'Resolved':
      case 'Active':
      case 'Accepted':
      case 'Complete':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Submitted for Review':
      case 'Under Review':
      case 'Pending Review':
      case 'In Progress':
      case 'Assigned':
      case 'Reviewed':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Maintenance Required':
      case 'Under Investigation':
      case 'Returned for More Evidence':
      case 'Incomplete':
      case 'Critical':
      case 'Urgent':
      case 'High':
      case 'Needs Additional Footage':
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Unverified':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {status}
    </span>
  );
};
