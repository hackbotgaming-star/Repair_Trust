import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Asset, WorkOrder, Complaint, AnalyticsKPIs } from '../types';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { GoogleMapView } from '../components/map/GoogleMapView';
import {
  Layers,
  Wrench,
  AlertTriangle,
  FileCheck,
  ArrowRight,
  Video,
  Clock,
  Compass,
  Building2,
  HardHat,
  ShieldCheck,
  Send,
  Search,
  CheckCircle2
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { role, user } = useAuth();
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeOrders, setActiveOrders] = useState<WorkOrder[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Citizen search state
  const [trackId, setTrackId] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, assetsRes, ordersRes, complaintsRes] = await Promise.all([
          api.analytics.get(60),
          api.assets.list({ limit: 10 }),
          api.workOrders.list({ limit: 5 }),
          api.complaints.list({ limit: 5 })
        ]);
        setKpis(analyticsRes.data.kpis);
        setAssets(assetsRes.data);
        setActiveOrders(ordersRes.data);
        setRecentComplaints(complaintsRes.data);
      } catch (err) {
        console.error('Overview fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTrackComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    setTrackLoading(true);
    try {
      const res = await api.complaints.track(trackId.trim());
      setTrackResult(res.data);
    } catch (err: any) {
      alert(err.message || 'Complaint reference not found');
    } finally {
      setTrackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Role Context Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-teal-50/90 via-sky-50/50 to-indigo-50/80 p-6 rounded-2xl border border-teal-200/80 shadow-xs card-pop">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-100/70 px-2.5 py-0.5 rounded-full border border-teal-300">
              {role.replace('_', ' ').toUpperCase()} WORKSPACE
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-600 font-semibold">{user?.department || 'Stormwater Division'}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, {user?.name || 'Municipal Engineer'}
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {role === 'engineer' && 'Review incoming repair evidence, assess recurring-failure alerts, and verify work orders.'}
            {role === 'field_worker' && 'View assigned repair tasks, record LiveWork Proof video evidence, and update work logs.'}
            {role === 'administrator' && 'Monitor municipal operations, manage users, and audit platform evidence compliance.'}
            {role === 'citizen' && 'Submit stormwater drain complaints and track verified municipal repair progress.'}
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-2">
          {role === 'engineer' && (
            <Link
              to="/work-orders/WO-2026-003"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs btn-pop"
            >
              <Wrench className="w-4 h-4" /> Review WO-2026-003 (DR-001)
            </Link>
          )}
          {role === 'field_worker' && (
            <Link
              to="/work-orders/WO-2026-003"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs btn-pop"
            >
              <Video className="w-4 h-4" /> Open Assigned Task WO-2026-003
            </Link>
          )}
          {role === 'citizen' && (
            <Link
              to="/citizen-portal"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs btn-pop"
            >
              <Send className="w-4 h-4" /> Report Drain Overflow
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs card-pop hover-pop">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Repeat-Failure Rate</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpis.repeatFailureRate}%</div>
            <p className="text-[11px] text-slate-500 mt-1">
              {kpis.repeatFailureCases} assets flagged within 60-day window
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs card-pop hover-pop">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Evidence Completeness</span>
              <FileCheck className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-teal-700">{kpis.evidenceCompletenessRate}%</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Required items verified by Closure Auditor
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs card-pop hover-pop">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Repairs for Review</span>
              <Wrench className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpis.repairsAwaitingReview}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Avg verification time: {kpis.avgTimeToReviewHours} hrs
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs card-pop hover-pop">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Open Complaints</span>
              <Layers className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpis.openComplaints}</div>
            <p className="text-[11px] text-slate-500 mt-1">Across 22 registered municipal assets</p>
          </div>
        </div>
      )}

      {/* Role-Specific Workflows */}
      {role === 'field_worker' && (
        <div className="bg-gradient-to-br from-amber-500/10 via-teal-50/60 to-emerald-500/10 text-slate-900 rounded-2xl p-6 shadow-sm border border-teal-200/70 card-pop">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-teal-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-700 flex items-center justify-center border border-teal-500/30">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Your Priority Work Order: WO-2026-003</h3>
                <p className="text-xs text-teal-800 font-medium">Asset DR-001 &bull; 12th Cross Arterial Box Drain</p>
              </div>
            </div>
            <Link
              to="/work-orders/WO-2026-003"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-xs btn-pop"
            >
              Start LiveWork Proof Upload <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200 shadow-xs card-pop hover-pop">
              <span className="font-bold text-slate-900 block mb-1">Assigned Task</span>
              <p>De-silting & Cleaning with mandatory before, during, and after evidence recording.</p>
            </div>
            <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200 shadow-xs card-pop hover-pop">
              <span className="font-bold text-slate-900 block mb-1">Required Evidence</span>
              <p>Pre-cleaning photo, post-cleaning flow photo, and a 15+ second LiveWork Proof video.</p>
            </div>
            <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200 shadow-xs card-pop hover-pop">
              <span className="font-bold text-amber-900 block mb-1">Closure Auditor Warning</span>
              <p className="text-amber-800">DR-001 has repeat failure history. Downstream check advised.</p>
            </div>
          </div>
        </div>
      )}

      {role === 'citizen' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-teal-600" />
            Track an Existing Infrastructure Complaint
          </h3>
          <p className="text-xs text-slate-500">
            Enter your complaint reference number (e.g., <code className="font-mono text-teal-700">CMP-2026-0089</code>) to see real-time repair progress without confidential worker data.
          </p>

          <form onSubmit={handleTrackComplaint} className="flex gap-2 max-w-lg">
            <input
              type="text"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              placeholder="e.g. CMP-2026-0089"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-xs uppercase font-mono focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <button
              type="submit"
              disabled={trackLoading}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition"
            >
              {trackLoading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {trackResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-mono font-bold text-teal-800">{trackResult.complaintId}</span>
                <StatusBadge status={trackResult.status} />
              </div>
              <p className="text-slate-700 font-medium">{trackResult.publicStatusUpdate}</p>
              <div className="text-[11px] text-slate-500">
                Location: {trackResult.location.street}, {trackResult.location.ward}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Priority Repeat-Failure Asset & Active Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DR-001 Featured Scenario Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between card-pop">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                CRITICAL REPEAT FAILURE
              </span>
              <RiskBadge level="HIGH" score={84.5} repeatFailure={true} />
            </div>

            <h3 className="text-base font-bold text-slate-900">DR-001: 12th Cross Box Drain</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Cleaned 2 times in the last 60 days. Recurring overflow reported on 3 separate occasions. Evidence-Gap Engine suspects downstream constriction at DR-002.
            </p>

            <div className="mt-4 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Ward:</span>
                <span className="font-semibold text-slate-800">Ward 4 (Central)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Capacity Ratio:</span>
                <span className="font-mono font-semibold text-rose-600">0.62 (Constrained)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Work Order:</span>
                <span className="font-mono font-semibold text-teal-700">WO-2026-003</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Downstream Junction:</span>
                <span className="font-mono font-semibold text-slate-700">DR-002 (Culvert)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <Link
              to="/memory-graph?assetId=DR-001"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 btn-pop"
            >
              Explore Asset Memory Graph <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/investigations?assetId=DR-001"
              className="w-full py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 transition flex items-center justify-center gap-2 hover-pop"
            >
              <Compass className="w-3.5 h-3.5" /> AI Root Cause & Evidence Gap
            </Link>
          </div>
        </div>

        {/* Active Work Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between card-pop">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Work Orders</h3>
                <p className="text-xs text-slate-500">Current field maintenance assignments</p>
              </div>
              <Link
                to="/work-orders"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Asset</th>
                    <th className="pb-2">Repair Type</th>
                    <th className="pb-2">Auditor Status</th>
                    <th className="pb-2">Lifecycle</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeOrders.map((wo) => (
                    <tr key={wo.workOrderId} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 font-mono font-bold text-slate-800">{wo.workOrderId}</td>
                      <td className="py-3 font-semibold text-slate-700">{wo.assetId}</td>
                      <td className="py-3 text-slate-600">{wo.repairType}</td>
                      <td className="py-3">
                        <StatusBadge status={wo.closureAuditorStatus} />
                      </td>
                      <td className="py-3">
                        <StatusBadge status={wo.status} />
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/work-orders/${wo.workOrderId}`}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold transition"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Closure Auditor verified against municipal evidence checklist.
            </span>
          </div>
        </div>
      </div>

      {/* Map Snapshot */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Infrastructure Asset GIS Hotspots</h3>
            <p className="text-xs text-slate-500">Google Maps spatial overview of stormwater drains and culverts</p>
          </div>
          <Link
            to="/map"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Full Map View <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <GoogleMapView assets={assets} height="360px" />
      </div>
    </div>
  );
};
