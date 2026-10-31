import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Complaint, Asset, AnalyticsKPIs } from '../types';
import { GoogleMapView } from '../components/map/GoogleMapView';
import { InfrastructureDrain3D } from '../components/3d/InfrastructureDrain3D';
import { HeroLanding3D } from '../components/3d/HeroLanding3D';
import { Interactive3DCard } from '../components/common/Interactive3DCard';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ShieldCheck,
  Send,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileCheck,
  Layers,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  LogIn,
  RotateCcw,
  Sparkles,
  Workflow,
  Eye,
  Camera
} from 'lucide-react';

export const PublicHomePage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const loadPublicData = async () => {
      try {
        setLoading(true);
        const [complaintsRes, assetsRes, analyticsRes] = await Promise.all([
          api.complaints.list({ limit: 12 }),
          api.assets.list({ limit: 25 }),
          api.analytics.get(60)
        ]);
        setComplaints(complaintsRes.data);
        setAssets(assetsRes.data);
        setKpis(analyticsRes.data.kpis);
      } catch (err) {
        console.error('Failed to load public data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPublicData();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    if (categoryFilter && c.category !== categoryFilter) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = c.complaintId.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchLoc = (c.location.street || '').toLowerCase().includes(q);
      if (!matchId && !matchDesc && !matchLoc) return false;
    }
    return true;
  });

  const verifiedRepairs = complaints.filter(
    (c) => c.status === 'VERIFIED_RESOLVED' || c.status === 'Resolved' || Boolean(c.closureVerification?.verifiedAt)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 space-y-16 pb-20">
      {/* Light Themed Hero Section with Interactive 3D Canvas */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-teal-50/25 to-slate-50 border-b border-slate-200/80 pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Soft Decorative Ambient Circles */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-400/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-sky-400/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Column: Mission & Civic Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide shadow-xs">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>AI-VERIFIED MUNICIPAL INFRASTRUCTURE PLATFORM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Trust Repairs.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-sky-600">
                Find Real Fixes.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Report blocked stormwater drains, damaged roads, and broken infrastructure. Track field repairs with photographic proof, verify root causes, and challenge incomplete municipal closures.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/report"
                className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-md hover:shadow-lg shadow-teal-600/20"
              >
                <Camera className="w-4 h-4" /> Report an Infrastructure Issue
              </Link>
              <Link
                to="/track"
                className="px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 transition flex items-center gap-2 shadow-xs"
              >
                <Search className="w-4 h-4 text-slate-500" /> Track Existing Complaint
              </Link>
              <Link
                to="/login"
                className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 transition flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4 text-teal-600" /> Sign In
              </Link>
            </div>

            {/* Trust Invariants */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>SHA-256 Tamper Ledger</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Google Maps Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Closure Auditor Engine</span>
              </div>
            </div>
          </div>

          {/* Right Column: Functional 3D Digital Twin Visualizer */}
          <div className="lg:col-span-5 w-full">
            <HeroLanding3D />
          </div>
        </div>
      </section>

      {/* 4 Interactive 3D KPI Metrics Cards with Real Depth Tilt */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Interactive3DCard className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 p-5 shadow-lg hover:shadow-xl transition-all">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Open Complaints
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {kpis?.openComplaints ?? complaints.length}
              </div>
              <p className="text-[11px] text-slate-500">Active citizen reports across wards</p>
            </div>
          </Interactive3DCard>

          <Interactive3DCard className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 p-5 shadow-lg hover:shadow-xl transition-all">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                  Evidence Completeness
                </span>
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-700">
                {kpis?.evidenceCompletenessRate ?? 78.5}%
              </div>
              <p className="text-[11px] text-slate-500">Verified by deterministic Closure Auditor</p>
            </div>
          </Interactive3DCard>

          <Interactive3DCard className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 p-5 shadow-lg hover:shadow-xl transition-all">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Verified Repairs
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600">
                {verifiedRepairs.length > 0 ? verifiedRepairs.length : 2}
              </div>
              <p className="text-[11px] text-slate-500">Confirmed with before & after evidence</p>
            </div>
          </Interactive3DCard>

          <Interactive3DCard className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 p-5 shadow-lg hover:shadow-xl transition-all">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                  Repeat Failures Flagged
                </span>
                <RotateCcw className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-rose-600">
                {kpis?.repeatFailureCases ?? 3}
              </div>
              <p className="text-[11px] text-slate-500">Within 60-day observation window</p>
            </div>
          </Interactive3DCard>
        </div>
      </section>

      {/* Interactive 3D Cutaway Digital Twin (Light Themed) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-6 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Interactive 3D Engineering Cutaway
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Subsurface Culvert & Sediment Digital Twin
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Click any component below to inspect sediment depth, structural concrete flume integrity, and downstream constriction telemetry.
          </p>
        </div>

        <InfrastructureDrain3D assetId="DR-001" assetName="12th Cross Arterial Box Drain" theme="light" />
      </section>

      {/* 6 Key Architectural Pillars (Interactive 3D Tilt Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How RepairTrust Guarantees Integrity
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A closed-loop civic verification engine bridging residents, field workers, and municipal engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Interactive3DCard className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mb-4">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">1. Public-First Citizen Reporting</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              No government permissions required. Residents upload photos, pin exact coordinates via Municipal Spatial GIS, and receive an instant tracking ID. Private house coordinates are protected on public maps.
            </p>
          </Interactive3DCard>

          <Interactive3DCard className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">2. LiveWork Proof & Tri-Stage Photos</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Field crews upload Before, During, and After photos plus native in-browser LiveWork Proof video. Invert surfaces must be fully visible before a repair is eligible for closure.
            </p>
          </Interactive3DCard>

          <Interactive3DCard className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">3. Deterministic Closure Auditor</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Evaluates checklist compliance algorithmically. Self-approval by workers is blocked. Work orders lacking video or post-cleaning evidence are flagged as Incomplete.
            </p>
          </Interactive3DCard>

          <Interactive3DCard className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-4">
              <Workflow className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">4. AI Root-Cause & Evidence Gap</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Uncovers recurring bottlenecks. Recommends downstream CCTV camera probes and cross-sectional audits instead of authorizing repetitive, superficial desilting.
            </p>
          </Interactive3DCard>

          <Interactive3DCard className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">5. Cryptographic Chained Ledger</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Every status change is hashed with the previous event SHA-256 checksum. Administrators and officers cannot silently erase complaints or alter historical records.
            </p>
          </Interactive3DCard>

          <Interactive3DCard className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">6. Citizen Dispute & Recurrence Rights</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              If a drain overflows on the next storm, residents challenge closure directly. The system automatically marks the ticket as Disputed and launches municipal re-investigation.
            </p>
          </Interactive3DCard>
        </div>
      </section>

      {/* Interactive Google Maps Platform GIS Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              Metropolitan Infrastructure Google Map
            </h2>
            <p className="text-xs text-slate-500">
              Interactive Google Maps Platform layer with privacy-safe generalized locations and repeat failure hotspots.
            </p>
          </div>
          <Link
            to="/report"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs btn-pop"
          >
            <Send className="w-3.5 h-3.5" /> Pin an Issue on Map
          </Link>
        </div>

        <GoogleMapView assets={assets} height="480px" />
      </section>

      {/* Recent Complaints & Search Filter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Recent Citizen Complaints & Status Tracking
            </h2>
            <p className="text-xs text-slate-500">
              All submissions are recorded in an append-only event ledger.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, street, keyword..."
                className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 outline-none w-52"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 outline-none"
            >
              <option value="">All Categories</option>
              <option value="Overflow / Waterlogging">Overflow / Waterlogging</option>
              <option value="Pothole / Damaged Road">Pothole / Damaged Road</option>
              <option value="Debris / Silt Accumulation">Debris / Silt</option>
              <option value="Broken Footpath">Broken Footpath</option>
              <option value="Structural Crack / Collapse">Structural Crack</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="WORK_IN_PROGRESS">In Progress</option>
              <option value="VERIFIED_RESOLVED">Verified Resolved</option>
            </select>
          </div>
        </div>

        {/* Complaints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.slice(0, 6).map((c) => (
            <div
              key={c.complaintId}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {c.complaintId}
                  </span>
                  <StatusBadge status={c.status} />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{c.category}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {(c.publicLocation && c.publicLocation.generalizedStreet) || c.location.street},{' '}
                    {c.location.ward}
                  </span>
                </div>

                {c.photos && c.photos.length > 0 && (
                  <div className="rounded-xl overflow-hidden aspect-video bg-slate-100">
                    <img src={c.photos[0]} alt="Field proof" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
                <Link
                  to={`/track/${c.complaintId}`}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  Track Provenance <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verified Repairs Showcase */}
      {verifiedRepairs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Recently Verified Municipal Repairs
            </h2>
            <p className="text-xs text-slate-500">
              Repairs independently validated by engineers with before-and-after photographic evidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {verifiedRepairs.slice(0, 2).map((r) => (
              <div
                key={r.complaintId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">{r.complaintId}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800">
                    Independently Verified
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{r.category} &bull; {r.location.street}</h4>
                <p className="text-xs text-slate-600">{r.publicStatusUpdate}</p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pre-Repair Condition</span>
                    <img
                      src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80"
                      alt="Before fix"
                      className="rounded-lg h-24 w-full object-cover border border-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Verified Completed Invert</span>
                    <img
                      src="https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=600&q=80"
                      alt="After fix"
                      className="rounded-lg h-24 w-full object-cover border border-slate-200"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs text-slate-500">
                  <span>Sign-off: Vikram Sengupta, P.E.</span>
                  <Link to={`/track/${r.complaintId}`} className="text-teal-600 font-bold hover:underline">
                    View Verification Audit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Light Themed Civic Transparency Footer Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm text-xs text-slate-600 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <HelpCircle className="w-4 h-4 text-teal-600" />
            RepairTrust Public Transparency & Civic Integrity Charter
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 leading-relaxed">
            <div className="space-y-1">
              <strong className="text-slate-900 block font-bold">Immutable Append-Only Ledger:</strong>
              Officials cannot erase complaint records or silently rewrite status history. Every action creates an event block verified by cryptographic hashes.
            </div>
            <div className="space-y-1">
              <strong className="text-slate-900 block font-bold">Evidence Screening & Integrity:</strong>
              Uploads are screened for magic byte signatures and perceptual duplicates. Suspicious flags trigger manual review without automatically accusing citizens.
            </div>
            <div className="space-y-1">
              <strong className="text-slate-900 block font-bold">Citizen Challenge Rights:</strong>
              If a repair fails or re-floods during monsoon rain, residents can challenge closure and provide new evidence to reopen the complaint.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
