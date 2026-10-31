import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Search,
  ExternalLink,
  CheckCheck,
  RefreshCw,
  Filter,
  Wrench,
  Camera,
  Layers
} from 'lucide-react';
import { api } from '../api/client';

export const CitizenNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.notifications.list();
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(c - 1, 0));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read', err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.isRead;
    if (filterType === 'STATUS') return n.type === 'STATUS_UPDATE';
    if (filterType === 'INSPECTIONS') return n.type === 'INSPECTION_SCHEDULED' || n.type === 'WORK_UPDATE';
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INSPECTION_SCHEDULED':
        return <Wrench className="w-5 h-5 text-indigo-500" />;
      case 'WORK_UPDATE':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'EVIDENCE_REVIEW':
        return <Camera className="w-5 h-5 text-teal-500" />;
      case 'DISPUTE_UPDATE':
      case 'REOPEN_CONFIRMED':
        return <RotateCcw className="w-5 h-5 text-rose-500" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 mb-2">
              <Bell className="w-3.5 h-3.5 text-teal-400" />
              Real-Time Citizen Feed
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Complaint Updates & Notifications</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Live milestones for your reported issues, engineering reviews, and repair verifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 shadow-sm"
              >
                <CheckCheck className="w-4 h-4 text-teal-400" />
                Mark all read ({unreadCount})
              </button>
            )}
            <button
              onClick={fetchNotifications}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
              title="Refresh notifications"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'ALL', label: `All (${notifications.length})` },
              { id: 'UNREAD', label: `Unread (${unreadCount})` },
              { id: 'STATUS', label: 'Status Updates' },
              { id: 'INSPECTIONS', label: 'Inspections & Repairs' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterType === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Feed */}
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
            <span>Checking for new notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No notifications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When you submit complaints, dispute closures, or when municipal crews update work orders, notifications appear here in real time.
            </p>
            <div className="pt-2">
              <Link
                to="/report"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shadow-xs hover:bg-teal-400 transition"
              >
                <Camera className="w-4 h-4" />
                Report an Issue
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifications.map((notif) => (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-2xl border transition shadow-xs flex items-start justify-between gap-4 ${
                    notif.isRead
                      ? 'bg-white/90 border-slate-200 text-slate-700'
                      : 'bg-white border-teal-300 ring-2 ring-teal-50 text-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-900">{notif.title}</span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                        )}
                        {notif.complaintId && (
                          <Link
                            to={`/track/${notif.complaintId}`}
                            className="font-mono text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 hover:underline inline-flex items-center gap-1"
                          >
                            {notif.complaintId}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                      <div className="text-[11px] text-slate-400 mt-2">
                        {new Date(notif.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif._id)}
                        className="text-[11px] font-bold text-teal-600 hover:text-teal-700 hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                    {notif.link && (
                      <Link
                        to={notif.link}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition"
                      >
                        Track Issue
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
