import React from 'react';
import { EvidenceVideo } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Video, ShieldCheck, Clock, MapPin, HardHat, FileCheck } from 'lucide-react';

interface VideoPlayerProps {
  video: EvidenceVideo;
  onReviewClick?: () => void;
  showReviewButton?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onReviewClick, showReviewButton = false }) => {
  const sizeMb = (video.fileSize / (1024 * 1024)).toFixed(2);
  const formattedDate = new Date(
    video.serverVerifiedMetadata?.receivedAt || video.createdAt
  ).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'before_cleaning':
        return { label: 'BEFORE CLEANING', bg: 'bg-amber-600 border-amber-500' };
      case 'during_operation':
        return { label: 'DURING OPERATION', bg: 'bg-blue-600 border-blue-500' };
      case 'post_completion_flow':
        return { label: 'AFTER CLEANING (FLOW)', bg: 'bg-emerald-600 border-emerald-500' };
      case 'combined_walkthrough':
        return { label: 'FULL WALKTHROUGH', bg: 'bg-purple-600 border-purple-500' };
      default:
        return { label: (stage || 'PROOF').replace(/_/g, ' ').toUpperCase(), bg: 'bg-slate-800 border-slate-700' };
    }
  };

  const badge = getStageBadge(video.stage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Video Stream */}
      <div className="bg-slate-950 aspect-video relative flex items-center justify-center">
        <video
          src={video.fileUrl}
          controls
          className="w-full h-full object-contain"
          preload="metadata"
        />
        <div className={`absolute top-3 left-3 ${badge.bg} text-white px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 border shadow-sm`}>
          <Video className="w-3.5 h-3.5 text-white" />
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Video Details Card */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-800">{video.videoId}</span>
              <StatusBadge status={video.reviewStatus} />
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <HardHat className="w-3 h-3 text-slate-400" />
              Operator: <span className="font-semibold text-slate-700">{video.submittedByName || 'Field Worker'}</span>
            </p>
          </div>

          {showReviewButton && (
            <button
              onClick={onReviewClick}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
            >
              Review Footage
            </button>
          )}
        </div>

        {/* Verification Matrix */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration & Size</span>
            <span className="font-semibold">{video.durationSeconds}s &bull; {sizeMb} MB</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Capture Source</span>
            <span className="font-semibold flex items-center gap-1">
              {video.clientProvidedMetadata?.isLiveCameraCapture ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Live Sensor
                </span>
              ) : (
                <span className="text-slate-600 font-medium">Uploaded File</span>
              )}
            </span>
          </div>
          <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Timestamp:
            </span>
            <span className="font-mono text-slate-700 text-[10px]">{formattedDate}</span>
          </div>
        </div>

        {/* Client GPS Coordinates vs Asset Location Check */}
        {video.clientProvidedMetadata?.reportedCoordinates?.lat && (
          <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between bg-slate-100/60 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-500" />
              GPS: {video.clientProvidedMetadata.reportedCoordinates.lat.toFixed(4)},{' '}
              {video.clientProvidedMetadata.reportedCoordinates.lng.toFixed(4)}
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              Within Geofence
            </span>
          </div>
        )}

        {/* Reviewer Note */}
        {video.reviewerComments && (
          <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
            <span className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider text-amber-700 mb-0.5">
              <FileCheck className="w-3 h-3" /> Engineer Review Note:
            </span>
            <p className="italic text-[11px]">"{video.reviewerComments}"</p>
          </div>
        )}
      </div>
    </div>
  );
};
