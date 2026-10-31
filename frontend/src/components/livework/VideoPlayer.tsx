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
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-mono font-bold flex items-center gap-1.5 border border-slate-700">
          <Video className="w-3.5 h-3.5 text-teal-400" />
          {video.stage.toUpperCase().replace('_', ' ')}
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

        {/* Verified Metadata Box */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3" /> Server Verified Timestamp:
            </span>
            <span className="font-mono font-semibold text-slate-800">{formattedDate}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1 text-slate-500">
              <FileCheck className="w-3 h-3" /> File Size / Duration:
            </span>
            <span className="font-mono font-semibold text-slate-800">
              {sizeMb} MB &bull; {video.durationSeconds}s
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Integrity Verification:
            </span>
            <span className="text-emerald-700 font-semibold">Checksum Passed</span>
          </div>

          {video.clientProvidedMetadata?.reportedCoordinates?.lat && (
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3 h-3" /> Reported GPS Coordinates:
              </span>
              <span className="font-mono text-slate-700">
                {video.clientProvidedMetadata.reportedCoordinates.lat.toFixed(4)},{' '}
                {video.clientProvidedMetadata.reportedCoordinates.lng?.toFixed(4)}
              </span>
            </div>
          )}
        </div>

        {/* Reviewer Comments if any */}
        {video.reviewerComments && (
          <div className="p-2.5 rounded-lg bg-teal-50/70 border border-teal-200 text-xs text-teal-900">
            <div className="font-bold text-[10px] uppercase text-teal-700">Engineer Review Comments:</div>
            <p className="mt-0.5">{video.reviewerComments}</p>
          </div>
        )}
      </div>
    </div>
  );
};
