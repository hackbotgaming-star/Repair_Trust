import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { EvidenceVideo } from '../types';
import { VideoPlayer } from '../components/livework/VideoPlayer';
import { useAuth } from '../context/AuthContext';
import { Video, ShieldCheck, Filter, CheckCircle2, XCircle, X, RefreshCw } from 'lucide-react';

export const LiveWorkProofPage: React.FC = () => {
  const { role } = useAuth();
  const [videos, setVideos] = useState<EvidenceVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewVideo, setReviewVideo] = useState<EvidenceVideo | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>('Accepted');
  const [comments, setComments] = useState('');
  const [savingReview, setSavingReview] = useState(false);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await api.videos.list();
      setVideos(res.data);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewVideo) return;
    setSavingReview(true);
    try {
      await api.videos.review(reviewVideo.videoId, {
        reviewStatus,
        reviewerComments: comments
      });
      setReviewVideo(null);
      setComments('');
      fetchVideos();
    } catch (err: any) {
      alert('Error saving review: ' + err.message);
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              CORE MODULE 3
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500">Tamper-Evident Media Verification</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Video className="w-6 h-6 text-teal-600" />
            LiveWork Proof Video Verification Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Inspect task-specific field footage, verify native live-camera capture metadata, and enforce review standards.
          </p>
        </div>

        <div className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
          Total Proof Footage: <span className="font-bold text-slate-900">{videos.length}</span>
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse">Loading footage registry...</div>
      ) : videos.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          No video records found. Workers submit videos through assigned work orders.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <VideoPlayer
              key={vid.videoId || vid._id}
              video={vid}
              showReviewButton={role === 'engineer' || role === 'administrator'}
              onReviewClick={() => {
                setReviewVideo(vid);
                setReviewStatus(vid.reviewStatus || 'Accepted');
                setComments(vid.reviewerComments || '');
              }}
            />
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewVideo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Review LiveWork Proof Footage</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {reviewVideo.videoId} &bull; Work Order: {reviewVideo.workOrderId}
                </p>
              </div>
              <button
                onClick={() => setReviewVideo(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Verification Determination:</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'Accepted', label: 'Accepted (Footage Confirms Clean Culvert Bed)' },
                    { id: 'Needs Additional Footage', label: 'Needs Additional Footage (Angle / Invert Obscured)' },
                    { id: 'Rejected', label: 'Rejected (Footage Invalid or Incomplete)' }
                  ].map((s) => (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                        reviewStatus === s.id
                          ? 'bg-teal-50 border-teal-500 text-teal-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reviewStatus"
                        value={s.id}
                        checked={reviewStatus === s.id}
                        onChange={(e) => setReviewStatus(e.target.value)}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reviewer Feedback & Directives:</label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Record verification notes or instructions for the worker..."
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewVideo(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReview}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  {savingReview ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-teal-400" /> Save Determination
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
