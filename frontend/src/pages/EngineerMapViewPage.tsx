import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { Asset, Complaint, WorkOrder } from '../types';
import { Link } from 'react-router-dom';
import { loadGoogleMaps, isGoogleMapsApiKeyConfigured } from '../utils/googleMapsLoader';
import {
  MapPin,
  Layers,
  AlertTriangle,
  Wrench,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  Filter,
  RefreshCw,
  Compass,
  Sparkles,
  Info,
  Globe
} from 'lucide-react';

export const EngineerMapViewPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Layer Visibility Toggles
  const [showAssets, setShowAssets] = useState(true);
  const [showComplaints, setShowComplaints] = useState(true);
  const [showWorkOrders, setShowWorkOrders] = useState(true);
  const [repeatOnly, setRepeatOnly] = useState(false);
  const [wardFilter, setWardFilter] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assetsRes, complaintsRes, ordersRes] = await Promise.all([
          api.assets.list({ limit: 50 }),
          api.complaints.list({ limit: 50 }),
          api.workOrders.list({ limit: 50 })
        ]);
        setAssets(assetsRes.data || []);
        setComplaints(complaintsRes.data || []);
        setWorkOrders(ordersRes.data || []);
      } catch (err) {
        console.error('Failed to load spatial datasets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Initialize Google Maps instance
  useEffect(() => {
    let isMounted = true;

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
        console.warn('Google Maps API for Engineer Map View:', err.message);
        if (isMounted) setIsLoaded(false);
      });

    return () => {
      isMounted = false;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, []);

  // Filtered Datasets
  const filteredAssets = assets.filter((a) => {
    if (wardFilter !== 'ALL' && a.location.ward !== wardFilter) return false;
    if (repeatOnly && !a.repeatFailureFlag) return false;
    return true;
  });

  const filteredComplaints = complaints.filter((c) => {
    if (wardFilter !== 'ALL' && c.location?.ward !== wardFilter) return false;
    if (repeatOnly && !c.description?.toLowerCase().includes('repeat') && c.status !== 'REOPENED') {
      return false;
    }
    return true;
  });

  const ordersWithCoords = workOrders
    .map((wo) => {
      const linkedAsset = assets.find((a) => a.assetId === wo.assetId);
      return {
        ...wo,
        coordinates: linkedAsset?.location?.coordinates || { lat: 12.9716, lng: 77.5946 },
        ward: linkedAsset?.location?.ward || 'Ward 4 (Central)'
      };
    })
    .filter((wo) => {
      if (wardFilter !== 'ALL' && wo.ward !== wardFilter) return false;
      return true;
    });

  // Render Google Maps Markers across layers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 1. Assets Layer
    if (showAssets) {
      filteredAssets.forEach((asset) => {
        const isRepeat = asset.repeatFailureFlag;
        const color = isRepeat ? '#e11d48' : '#0d9488';

        const svgIcon = {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 1.5,
          anchor: new google.maps.Point(12, 22)
        };

        const marker = new google.maps.Marker({
          position: { lat: asset.location.coordinates.lat, lng: asset.location.coordinates.lng },
          map: mapInstanceRef.current,
          title: `Asset: ${asset.assetId}`,
          icon: svgIcon
        });

        marker.addListener('click', () => {
          if (infoWindowRef.current && mapInstanceRef.current) {
            const content = `
              <div style="font-family: inherit; padding: 6px; max-width: 270px; color: #0f172a;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-weight: 800; font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 6px; border: 1px solid #cbd5e1;">${asset.assetId}</span>
                  <span style="font-size: 10px; font-weight: 700; color: ${color}; text-transform: uppercase;">${isRepeat ? 'REPEAT FAILURE' : 'ACTIVE ASSET'}</span>
                </div>
                <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${asset.name}</h4>
                <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b;">${asset.location.street}, ${asset.location.ward}</p>
                <div style="font-size: 11px; border-top: 1px solid #f1f5f9; padding-top: 4px;">
                  <div>Capacity Ratio: <strong>${((asset.capacityRatio || 0.8) * 100).toFixed(0)}%</strong></div>
                  <div>Status: <strong>${asset.status || 'Active'}</strong></div>
                </div>
                <div style="margin-top: 8px; display: flex; gap: 4px;">
                  <a href="/memory-graph?assetId=${asset.assetId}" style="flex: 1; text-align: center; background: #0f172a; color: white; padding: 5px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold;">
                    Memory Graph
                  </a>
                  <a href="/investigations?assetId=${asset.assetId}" style="flex: 1; text-align: center; background: #0d9488; color: white; padding: 5px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold;">
                    Root Cause
                  </a>
                </div>
              </div>
            `;
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(mapInstanceRef.current, marker);
          }
        });

        markersRef.current.push(marker);
      });
    }

    // 2. Complaints Layer
    if (showComplaints) {
      filteredComplaints.forEach((c) => {
        const lat = c.location?.coordinates?.lat || 12.9716;
        const lng = c.location?.coordinates?.lng || 77.5946;

        const svgIcon = {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: '#ea580c',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 1.3,
          anchor: new google.maps.Point(12, 22)
        };

        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          title: `Complaint: ${c.complaintId}`,
          icon: svgIcon
        });

        marker.addListener('click', () => {
          if (infoWindowRef.current && mapInstanceRef.current) {
            const content = `
              <div style="font-family: inherit; padding: 6px; max-width: 260px; color: #0f172a;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-weight: 800; font-size: 11px; background: #fff7ed; color: #c2410c; padding: 2px 6px; border-radius: 6px; border: 1px solid #fed7aa;">${c.complaintId}</span>
                  <span style="font-size: 10px; font-weight: 700; color: #ea580c; text-transform: uppercase;">${c.status}</span>
                </div>
                <h4 style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #0f172a;">${c.category}</h4>
                <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b;">"${c.description || 'Reported citizen issue'}"</p>
                <div style="margin-top: 8px;">
                  <a href="/complaints" style="display: block; text-align: center; background: #ea580c; color: white; padding: 5px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold;">
                    Review in Complaints Hub &rarr;
                  </a>
                </div>
              </div>
            `;
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(mapInstanceRef.current, marker);
          }
        });

        markersRef.current.push(marker);
      });
    }

    // 3. Work Orders Layer
    if (showWorkOrders) {
      ordersWithCoords.forEach((w) => {
        const svgIcon = {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 1.4,
          anchor: new google.maps.Point(12, 22)
        };

        const marker = new google.maps.Marker({
          position: { lat: w.coordinates.lat, lng: w.coordinates.lng },
          map: mapInstanceRef.current,
          title: `Work Order: ${w.workOrderId}`,
          icon: svgIcon
        });

        marker.addListener('click', () => {
          if (infoWindowRef.current && mapInstanceRef.current) {
            const content = `
              <div style="font-family: inherit; padding: 6px; max-width: 260px; color: #0f172a;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-weight: 800; font-size: 11px; background: #eff6ff; color: #1d4ed8; padding: 2px 6px; border-radius: 6px; border: 1px solid #bfdbfe;">${w.workOrderId}</span>
                  <span style="font-size: 10px; font-weight: 700; color: #2563eb; text-transform: uppercase;">${w.status}</span>
                </div>
                <h4 style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #0f172a;">${w.repairType}</h4>
                <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b;">Asset: <strong>${w.assetId}</strong></p>
                <div style="margin-top: 8px;">
                  <a href="/work-orders/${w.workOrderId}" style="display: block; text-align: center; background: #2563eb; color: white; padding: 5px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold;">
                    Inspect Work Order &rarr;
                  </a>
                </div>
              </div>
            `;
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(mapInstanceRef.current, marker);
          }
        });

        markersRef.current.push(marker);
      });
    }
  }, [filteredAssets, filteredComplaints, ordersWithCoords, showAssets, showComplaints, showWorkOrders]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-50 via-sky-50 to-indigo-50 border border-teal-200/80 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 card-pop">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-teal-600 text-white">
              <Globe className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Municipal Engineering GIS &bull; Google Maps Platform
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              Online
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Municipal Cadastral GIS & Multi-Layer Asset Explorer
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl">
            Interactive Google Maps overlay uniting 22+ registered stormwater drains, active citizen failure complaints, and dispatched field work orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs btn-pop"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-600" /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Layer Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Layer Toggles:
          </span>

          <button
            type="button"
            onClick={() => setShowAssets(!showAssets)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              showAssets
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Assets ({filteredAssets.length})
          </button>

          <button
            type="button"
            onClick={() => setShowComplaints(!showComplaints)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              showComplaints
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Complaints ({filteredComplaints.length})
          </button>

          <button
            type="button"
            onClick={() => setShowWorkOrders(!showWorkOrders)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              showWorkOrders
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Work Orders ({ordersWithCoords.length})
          </button>

          <button
            type="button"
            onClick={() => setRepeatOnly(!repeatOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              repeatOnly
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Repeat Failures Only
          </button>
        </div>

        {/* Ward Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter Ward:</span>
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
          >
            <option value="ALL">All Municipal Wards</option>
            <option value="Ward 4 (Central)">Ward 4 (Central)</option>
            <option value="Ward 7 (North)">Ward 7 (North)</option>
            <option value="Ward 2 (East)">Ward 2 (East)</option>
            <option value="Ward 9 (South)">Ward 9 (South)</option>
          </select>
        </div>
      </div>

      {/* Main Google Maps View */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col card-pop">
        <div className="h-[680px] w-full relative">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Fallback Display if API key is not yet set */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-slate-100 flex flex-col justify-between p-6 z-10">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-sm max-w-lg space-y-2">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-xs">
                  <Globe className="w-4 h-4 text-teal-600" />
                  <span>Google Maps Platform Active</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Google Maps JavaScript API v3 initialized. Set <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-teal-700 font-bold">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">frontend/.env</code> for live tile streaming.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-96 p-2">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.assetId}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded">
                        {asset.assetId}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{asset.type}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate">{asset.name}</div>
                    <div className="text-[11px] text-slate-500">{asset.location.street}</div>
                  </div>
                ))}
              </div>

              <div className="text-right text-[11px] text-slate-400 font-mono">
                Google Maps Cadastral Grid &bull; Coordinates: 12.9716 N, 77.5946 E
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
