import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCheck,
  ShieldCheck,
  Wrench,
  CloudRain
} from 'lucide-react';

export const WorkerNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.notifications.list();
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
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
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.isRead;
    if (filterType === 'ASSIGNMENT') return n.type === 'WORK_ORDER_ASSIGNED' || n.title?.includes('Assigned');
    if (filterType === 'WEATHER') return n.type === 'WEATHER_ALERT' || n.title?.includes('Weather');
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-600" />
            Field Crew Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates on new work orders, engineer review decisions, and safety weather advisories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <CheckCheck className="w-4 h-4 text-teal-600" />
              Mark all as read
            </button>
          )}
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs">
        {[
          { id: 'ALL', label: 'All Alerts' },
          { id: 'UNREAD', label: `Unread (${unreadCount})` },
          { id: 'ASSIGNMENT', label: 'Work Orders Assigned' },
          { id: 'WEATHER', label: 'Safety Advisories' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterType === tab.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600" />
          <p className="text-xs font-semibold">Loading notifications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">All Caught Up!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have no unread field notifications. New work order assignments and engineering review sign-offs will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isWeather = item.type === 'WEATHER_ALERT' || item.title?.includes('Weather');
            const isAssigned = item.type === 'WORK_ORDER_ASSIGNED' || item.title?.includes('Assigned');

            return (
              <div
                key={item._id}
                className={`p-4 rounded-2xl border transition shadow-xs flex items-start gap-4 ${
                  !item.isRead
                    ? 'bg-white border-teal-300 ring-1 ring-teal-100'
                    : 'bg-white/70 border-slate-200'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isWeather
                      ? 'bg-amber-100 text-amber-700'
                      : isAssigned
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {isWeather ? (
                    <CloudRain className="w-5 h-5" />
                  ) : isAssigned ? (
                    <Wrench className="w-5 h-5" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      {item.title}
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>

                  <div className="pt-2 flex items-center justify-between">
                    {item.link ? (
                      <Link
                        to={item.link}
                        className="text-[11px] text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
                      >
                        Open Action <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <div />
                    )}

                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item._id)}
                        className="text-[11px] text-slate-400 hover:text-slate-700 font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
