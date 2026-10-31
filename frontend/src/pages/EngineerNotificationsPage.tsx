import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldAlert,
  CloudRain,
  Wrench,
  FileText,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EngineerNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.notifications.list();
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'Unread') return !n.isRead;
    if (filterType === 'Disputes') return n.type === 'DISPUTE_UPDATE' || n.type === 'REOPEN_CONFIRMED';
    if (filterType === 'Audits') return n.type === 'EVIDENCE_REVIEW' || n.type === 'REPEAT_FAILURE_TRIGGER';
    if (filterType === 'Weather') return n.type === 'WEATHER_ALERT';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'WEATHER_ALERT':
        return <CloudRain className="w-4 h-4 text-sky-500" />;
      case 'REPEAT_FAILURE_TRIGGER':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'EVIDENCE_REVIEW':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'DISPUTE_UPDATE':
      case 'REOPEN_CONFIRMED':
        return <RotateCcw className="w-4 h-4 text-purple-500" />;
      case 'WORK_UPDATE':
      case 'WORK_ORDER_ASSIGNED':
        return <Wrench className="w-4 h-4 text-teal-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-teal-300" /> Engineer Priority Alert Center
              </span>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white animate-pulse">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Operational Alerts & Quality Notifications
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track submitted repair proof awaiting engineering review, repeat failure alarms, citizen recurrence disputes, and precipitation warnings.
            </p>
          </div>

          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAll || unreadCount === 0}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-1.5 disabled:opacity-40"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {markingAll ? 'Updating...' : 'Mark All as Read'}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {[
            { id: 'All', label: 'All Alerts' },
            { id: 'Unread', label: `Unread (${unreadCount})` },
            { id: 'Audits', label: 'Evidence & Failures' },
            { id: 'Disputes', label: 'Citizen Recurrences' },
            { id: 'Weather', label: 'Hydro-Met Warnings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterType === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchNotifications}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
            <RefreshCw className="w-6 h-6 text-teal-600 animate-spin mx-auto" />
            <p className="text-xs font-bold">Retrieving municipal notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No notifications found</p>
            <p className="text-xs text-slate-400">All alerts in this category have been acknowledged.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isUnread = !n.isRead;
            return (
              <div
                key={n._id || n.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isUnread
                    ? 'border-teal-300 bg-teal-50/20 shadow-sm'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getIconForType(n.type)}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" title="Unread" />
                      )}
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {n.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                    <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span>{new Date(n.createdAt || Date.now()).toLocaleString()}</span>
                      {n.complaintId && (
                        <span className="font-mono text-slate-600">Ref: {n.complaintId}</span>
                      )}
                      {n.workOrderId && (
                        <span className="font-mono text-slate-600">Task: {n.workOrderId}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {n.link && (
                    <Link
                      to={n.link}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition flex items-center gap-1 shadow-xs"
                    >
                      <span>Take Action</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}

                  {isUnread && (
                    <button
                      onClick={() => handleMarkAsRead(n._id || n.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
