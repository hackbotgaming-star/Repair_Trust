import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadGoogleMaps, isGoogleMapsApiKeyConfigured } from '../utils/googleMapsLoader';
import {
  MapPin,
  Wrench,
  Filter,
  AlertTriangle,
  ExternalLink,
  Globe,
  Layers,
  Search,
  CheckCircle2,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/client';

export const PublicInfrastructureMapPage: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [repeatOnly, setRepeatOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Fetch Public Complaints
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        const res = await api.complaints.list({ limit: 100 });
        setComplaints(res.data || []);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  // Filtered Complaints
  const filteredComplaints = complaints.filter((c) => {
    if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (repeatOnly) {
      const isRepeat =
        c.status === 'REOPENED' ||
        c.status === 'DISPUTED' ||
        c.description?.toLowerCase().includes('repeat');
      if (!isRepeat) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.complaintId?.toLowerCase().includes(q);
      const matchStreet = (c.location?.street || c.publicLocation?.generalizedStreet || '').toLowerCase().includes(q);
      const matchWard = (c.location?.ward || c.publicLocation?.ward || '').toLowerCase().includes(q);
      const matchDesc = (c.description || '').toLowerCase().includes(q);
      if (!matchId && !matchStreet && !matchWard && !matchDesc) return false;
    }
    return true;
  });

  // Target coordinates for view
  const targetLat = selectedComplaint
    ? selectedComplaint.location?.coordinates?.lat || selectedComplaint.publicLocation?.coordinates?.lat || 12.9716
    : 12.9716;
  const targetLng = selectedComplaint
    ? selectedComplaint.location?.coordinates?.lng || selectedComplaint.publicLocation?.coordinates?.lng || 77.5946
    : 77.5946;

  // Initialize Google Maps API if key exists
  useEffect(() => {
    let isMounted = true;
    const keyAvailable = isGoogleMapsApiKeyConfigured();
    setHasApiKey(keyAvailable);

    if (keyAvailable) {
      loadGoogleMaps()
        .then((g) => {
          if (!isMounted || !mapContainerRef.current) return;

          const map = new g.maps.Map(mapContainerRef.current, {
            center: { lat: 12.9716, lng: 77.5946 },
            zoom: 13,
            mapTypeId: g.maps.MapTypeId.ROADMAP,
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true
          });

          mapInstanceRef.current = map;
          infoWindowRef.current = new g.maps.InfoWindow();
          setIsLoaded(true);
        })
        .catch((err) => {
          console.warn('Google Maps API for Public Infrastructure Map fallback:', err);
          if (isMounted) setIsLoaded(false);
        });
    }

    return () => {
      isMounted = false;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, []);

  // Render Google Maps Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps || !hasApiKey) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    filteredComplaints.forEach((c) => {
      const lat = c.publicLocation?.coordinates?.lat || c.location?.coordinates?.lat || 12.9716;
      const lng = c.publicLocation?.coordinates?.lng || c.location?.coordinates?.lng || 77.5946;
      const isRepeat =
        c.status === 'REOPENED' ||
        c.status === 'DISPUTED' ||
        c.description?.toLowerCase().includes('repeat');

      const pinColor = isRepeat
        ? '#e11d48'
        : c.status === 'VERIFIED_RESOLVED' || c.status === 'Resolved'
        ? '#10b981'
        : c.status === 'In Progress' || c.status === 'ASSIGNED'
        ? '#2563eb'
        : '#f59e0b';

      const svgIcon = {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: pinColor,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 1.5,
        anchor: new google.maps.Point(12, 22)
      };

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: `${c.complaintId} - ${c.category}`,
        icon: svgIcon
      });

      marker.addListener('click', () => {
        setSelectedComplaint(c);
      });

      markersRef.current.push(marker);
    });
  }, [filteredComplaints, hasApiKey]);

  // Calculate spatial pin position on the map
  const getPinPosition = (lat: number, lng: number) => {
    const minLat = 12.935;
    const maxLat = 12.985;
    const minLng = 77.560;
    const maxLng = 77.645;

    const clampedLat = Math.max(minLat, Math.min(maxLat, lat));
    const clampedLng = Math.max(minLng, Math.min(maxLng, lng));

    const topPercent = ((maxLat - clampedLat) / (maxLat - minLat)) * 68 + 16;
    const leftPercent = ((clampedLng - minLng) / (maxLng - minLng)) * 74 + 13;

    return { top: `${topPercent}%`, left: `${leftPercent}%` };
  };

    const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${targetLat},${targetLng}&t=m&z=${selectedComplaint ? 16 : 13}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
      {/* Header Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4 z-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              <Globe className="w-4 h-4 text-teal-600" />
            </span>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Public Infrastructure Google Map
            </h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
              Google Maps Platform
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Geospatial accountability layer &bull; Privacy-safe generalized street locations & repeat failure hotspots
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, street or ward..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none w-52 sm:w-64"
            />
          </div>

          <Link
            to="/report"
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs btn-pop"
          >
            <MapPin className="w-3.5 h-3.5" /> Report Issue
          </Link>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-2 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs z-10">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Pothole / Damaged Road">Potholes & Roads</option>
            <option value="Stormwater Drain Blockage / Overflow">Stormwater Drains</option>
            <option value="Broken Footpath / Pedestrian Hazard">Footpaths</option>
            <option value="Damaged Manhole / Missing Cover">Manholes</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="DISPUTED">Disputed / Recurrent</option>
          </select>

          <button
            type="button"
            onClick={() => setRepeatOnly(!repeatOnly)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              repeatOnly
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Repeat Failures Only
          </button>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Submitted
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> In Progress
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resolved
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" /> Repeat / Disputed
          </span>
        </div>
      </div>

      {/* Main Google Maps View */}
      <div className="flex-1 relative overflow-hidden">
        {hasApiKey && isLoaded ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          <iframe
            title="Google Maps Public Infrastructure View"
            src={googleMapsEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        )}

        {/* Interactive Pinpoints on Map */}
        <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
          {filteredComplaints.map((c) => {
            const lat = c.location?.coordinates?.lat || c.publicLocation?.coordinates?.lat || 12.9716;
            const lng = c.location?.coordinates?.lng || c.publicLocation?.coordinates?.lng || 77.5946;
            const pos = getPinPosition(lat, lng);
            const isSelected = selectedComplaint?.complaintId === c.complaintId;
            const isRepeat =
              c.status === 'REOPENED' ||
              c.status === 'DISPUTED' ||
              c.description?.toLowerCase().includes('repeat');
            const isResolved = c.status === 'VERIFIED_RESOLVED' || c.status === 'Resolved' || c.status === 'Closed';
            const isInProgress = c.status === 'In Progress' || c.status === 'WORK_IN_PROGRESS';

            const pinGradient = isRepeat
              ? 'from-rose-500 to-red-600 ring-rose-300'
              : isResolved
              ? 'from-emerald-500 to-teal-600 ring-emerald-300'
              : isInProgress
              ? 'from-blue-500 to-sky-600 ring-blue-300'
              : 'from-amber-500 to-yellow-600 ring-amber-300';

            return (
              <div
                key={c.complaintId}
                style={{ top: pos.top, left: pos.left }}
                className="absolute -translate-x-1/2 -translate-y-full pointer-events-auto group cursor-pointer"
                onClick={() => setSelectedComplaint(c)}
                onDoubleClick={() => navigate(`/track/${c.complaintId}`)}
                title={`Touch or click to view ${c.complaintId}`}
              >
                {/* Pulsing ground radar beacon */}
                <div
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-3 rounded-full animate-ping pointer-events-none ${
                    isRepeat ? 'bg-rose-500/40' : 'bg-teal-500/40'
                  }`}
                />

                {/* 3D Pin Head */}
                <div
                  className={`relative flex items-center justify-center transition-all duration-300 transform group-hover:scale-125 ${
                    isSelected ? 'scale-125 z-30' : 'hover:z-20'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${pinGradient} text-white flex items-center justify-center shadow-lg border-2 border-white ring-2`}
                  >
                    {isRepeat ? (
                      <AlertTriangle className="w-4 h-4 text-white" />
                    ) : isResolved ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : isInProgress ? (
                      <Wrench className="w-4 h-4 text-white" />
                    ) : (
                      <MapPin className="w-4 h-4 text-white" />
                    )}
                  </div>
                  {/* Pin tail */}
                  <div
                    className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] ${
                      isRepeat
                        ? 'border-t-rose-600'
                        : isResolved
                        ? 'border-t-emerald-600'
                        : isInProgress
                        ? 'border-t-blue-600'
                        : 'border-t-amber-600'
                    }`}
                  />
                </div>

                {/* Pin Tooltip with Direct Touch-to-Open Action */}
                <div
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-slate-900/95 text-white text-[11px] font-mono px-3 py-1.5 rounded-xl shadow-xl pointer-events-auto transition-all duration-200 border border-slate-700/80 ${
                    isSelected
                      ? 'opacity-100 scale-105 z-30'
                      : 'opacity-0 group-hover:opacity-100 group-hover:scale-100 z-10'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/track/${c.complaintId}`);
                  }}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="text-teal-400 font-mono">{c.complaintId}</span>
                    <span className="text-slate-300 text-[10px] font-sans">({c.category})</span>
                  </div>
                  <div className="text-[10px] text-teal-300 font-sans mt-0.5 flex items-center gap-1 font-semibold hover:underline">
                    <span>Touch to open complaint page</span>
                    <ArrowRight className="w-3 h-3 text-teal-300 inline" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Complaint Pins for Instant Selection */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 max-w-[85%] sm:max-w-xl pointer-events-auto">
          {filteredComplaints.slice(0, 6).map((c) => {
            const isSelected = selectedComplaint?.complaintId === c.complaintId;
            const isRepeat =
              c.status === 'REOPENED' ||
              c.status === 'DISPUTED' ||
              c.description?.toLowerCase().includes('repeat');

            return (
              <button
                key={c.complaintId}
                type="button"
                onClick={() => setSelectedComplaint(c)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white ring-2 ring-teal-500 scale-105'
                    : isRepeat
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-white/95 hover:bg-white text-slate-800 border border-slate-200'
                }`}
              >
                <MapPin className={`w-3 h-3 ${isRepeat ? 'text-rose-600' : 'text-teal-600'}`} />
                <span>{c.complaintId}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Complaint Overlay Drawer */}
        {selectedComplaint && (
          <div className="absolute bottom-4 right-4 max-w-sm w-full bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-xl z-20 space-y-3 card-pop">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {selectedComplaint.complaintId}
              </span>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold leading-none px-2 py-1"
              >
                &times;
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-snug">{selectedComplaint.category}</h4>
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">"{selectedComplaint.description}"</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
              <div>
                <span>Street:</span> <strong className="text-slate-800 block truncate">{selectedComplaint.location?.street || selectedComplaint.publicLocation?.generalizedStreet}</strong>
              </div>
              <div>
                <span>Ward:</span> <strong className="text-slate-800 block">{selectedComplaint.location?.ward || selectedComplaint.publicLocation?.ward || 'Ward 4'}</strong>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to={`/track/${selectedComplaint.complaintId}`}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>View Full Event Ledger</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
              </Link>
            </div>
          </div>
        )}

        {/* Floating Marker Count Pill */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-semibold text-slate-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>Showing {filteredComplaints.length} Public Google Map Markers</span>
        </div>
      </div>
    </div>
  );
};
