import React, { useState, useEffect } from 'react';
import { TimelineEvent } from '../../types';
import { 
  AlertCircle, 
  Wrench, 
  Video, 
  CloudRain, 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

interface InteractiveTimelineProps {
  events: TimelineEvent[];
  onSelectEvent?: (event: TimelineEvent) => void;
}

export const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({ events, onSelectEvent }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(events[0]?.id || null);

  useEffect(() => {
    setExpandedId(events[0]?.id || null);
  }, [events]);

  const getEventIcon = (type: string, status?: string) => {
    switch (type) {
      case 'COMPLAINT':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'WORK_ORDER':
        return <Wrench className="w-4 h-4 text-blue-500" />;
      case 'LIVEWORK_VIDEO':
        return <Video className="w-4 h-4 text-purple-500" />;
      case 'ENGINEER_REVIEW':
        return status === 'Approved' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <XCircle className="w-4 h-4 text-rose-500" />
        );
      case 'INSPECTION':
        return <ClipboardCheck className="w-4 h-4 text-amber-500" />;
      case 'RAINFALL_EVENT':
        return <CloudRain className="w-4 h-4 text-sky-500" />;
      case 'ASSET_REGISTRATION':
      default:
        return <Layers className="w-4 h-4 text-teal-600" />;
    }
  };

  const filteredEvents = events.filter((e) => {
    if (filter === 'ALL') return true;
    if (filter === 'COMPLAINTS') return e.type === 'COMPLAINT';
    if (filter === 'REPAIRS') return e.type === 'WORK_ORDER' || e.type === 'LIVEWORK_VIDEO' || e.type === 'ENGINEER_REVIEW';
    if (filter === 'WEATHER') return e.type === 'RAINFALL_EVENT';
    if (filter === 'INSPECTIONS') return e.type === 'INSPECTION';
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            Chronological Evidence Timeline
          </h3>
          <p className="text-xs text-slate-500">
            Click any entry to inspect supporting photographs, inspector notes, or video logs.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          {['ALL', 'COMPLAINTS', 'REPAIRS', 'WEATHER', 'INSPECTIONS'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg transition ${
                filter === f
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline items list */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {filteredEvents.map((event) => {
          const isExpanded = expandedId === event.id;
          const dateStr = new Date(event.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div key={event.id} className="relative group">
              {/* Dot */}
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-slate-300 group-hover:border-teal-500 flex items-center justify-center shadow-xs transition">
                {getEventIcon(event.type, event.status)}
              </div>

              {/* Card */}
              <div
                onClick={() => {
                  setExpandedId(isExpanded ? null : event.id);
                  onSelectEvent?.(event);
                }}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  isExpanded
                    ? 'bg-slate-50 border-teal-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>
                      {event.status && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full uppercase bg-slate-200/70 text-slate-700">
                          {event.status}
                        </span>
                      )}
                      {event.referenceId && (
                        <span className="text-[11px] font-mono font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                          {event.referenceId}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{event.summary}</p>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && event.details && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100 space-y-2">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400">
                      <FileText className="w-3.5 h-3.5" />
                      Verified Record Data
                    </div>

                    {/* If complaint photos */}
                    {event.details.photos && event.details.photos.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {event.details.photos.map((p: string, idx: number) => (
                          <img
                            key={idx}
                            src={p}
                            alt="Evidence thumbnail"
                            className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                          />
                        ))}
                      </div>
                    )}

                    {/* If video details */}
                    {event.type === 'LIVEWORK_VIDEO' && (
                      <div className="space-y-1">
                        <div className="flex justify-between py-0.5 border-b border-slate-100">
                          <span className="text-slate-500">Stage:</span>
                          <span className="font-mono font-semibold">{event.details.stage}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-slate-100">
                          <span className="text-slate-500">Live Camera Verified:</span>
                          <span className="font-semibold text-emerald-600">
                            {event.details.clientMetadata?.isLiveCameraCapture ? 'Yes (Native MediaStream)' : 'Uploaded File'}
                          </span>
                        </div>
                        {event.details.fileUrl && (
                          <div className="pt-2">
                            <a
                              href={event.details.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 font-semibold"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Open Footage in Video Streamer
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Generic object details */}
                    {typeof event.details === 'object' && event.type !== 'LIVEWORK_VIDEO' && (
                      <pre className="text-[11px] font-mono bg-slate-50 p-2 rounded overflow-x-auto text-slate-600 max-h-40">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
