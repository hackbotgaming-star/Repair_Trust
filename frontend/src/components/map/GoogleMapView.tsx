import React, { useState, useEffect, useRef } from 'react';
import { Asset } from '../../types';
import { Link } from 'react-router-dom';
import { loadGoogleMaps, isGoogleMapsApiKeyConfigured } from '../../utils/googleMapsLoader';
import {
  Globe,
  MapPin,
  ExternalLink,
  Layers,
  AlertTriangle,
  Compass,
  ArrowRight
} from 'lucide-react';

interface GoogleMapViewProps {
  assets: Asset[];
  center?: [number, number] | { lat: number; lng: number };
  zoom?: number;
  height?: string;
  interactive?: boolean;
  onAssetSelect?: (asset: Asset) => void;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  assets,
  center = [12.9716, 77.5946],
  zoom = 13,
  height = '500px',
  interactive = true,
  onAssetSelect
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [filter, setFilter] = useState<'ALL' | 'HIGH_RISK' | 'REPEAT_FAILURES'>('ALL');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Normalized Coordinates
  const centerLat = Array.isArray(center) ? center[0] : center.lat;
  const centerLng = Array.isArray(center) ? center[1] : center.lng;

  // Active target center (pan to selected asset if chosen)
  const activeLat = selectedAsset ? selectedAsset.location.coordinates.lat : centerLat;
  const activeLng = selectedAsset ? selectedAsset.location.coordinates.lng : centerLng;

  // Filtered Assets
  const filteredAssets = assets.filter((a) => {
    if (filter === 'HIGH_RISK') return a.riskLevel === 'HIGH';
    if (filter === 'REPEAT_FAILURES') return a.repeatFailureFlag;
    return true;
  });

  // Attempt Google Maps JS API initialization if key is present
  useEffect(() => {
    let isMounted = true;
    const keyAvailable = isGoogleMapsApiKeyConfigured();
    setHasApiKey(keyAvailable);

    if (keyAvailable) {
      loadGoogleMaps()
        .then((g) => {
          if (!isMounted || !mapContainerRef.current) return;

          const map = new g.maps.Map(mapContainerRef.current, {
            center: { lat: centerLat, lng: centerLng },
            zoom,
            mapTypeId: g.maps.MapTypeId.ROADMAP,
            streetViewControl: interactive,
            mapTypeControl: interactive,
            fullscreenControl: interactive,
            zoomControl: interactive
          });

          mapInstanceRef.current = map;
          infoWindowRef.current = new g.maps.InfoWindow();
          setIsLoaded(true);
        })
        .catch((err) => {
          console.warn('Google Maps JS API fallback:', err);
          if (isMounted) setIsLoaded(false);
        });
    }

    return () => {
      isMounted = false;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [centerLat, centerLng, zoom, interactive]);

  // Update map type for JS API
  useEffect(() => {
    if (mapInstanceRef.current && window.google?.maps) {
      mapInstanceRef.current.setMapTypeId(mapType as google.maps.MapTypeId);
    }
  }, [mapType]);

  // Handle JS API Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps || !hasApiKey) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    filteredAssets.forEach((asset) => {
      const isRepeat = asset.repeatFailureFlag;
      const isHighRisk = asset.riskLevel === 'HIGH';
      const pinColor = isRepeat ? '#e11d48' : isHighRisk ? '#ea580c' : '#0d9488';

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
        position: {
          lat: asset.location.coordinates.lat,
          lng: asset.location.coordinates.lng
        },
        map: mapInstanceRef.current,
        title: `${asset.assetId} - ${asset.name}`,
        icon: svgIcon
      });

      marker.addListener('click', () => {
        setSelectedAsset(asset);
        if (onAssetSelect) onAssetSelect(asset);
      });

      markersRef.current.push(marker);
    });
  }, [filteredAssets, hasApiKey, onAssetSelect]);

  // Embed Map Type Param
  const embedTypeParam = mapType === 'satellite' ? 'k' : mapType === 'terrain' ? 'p' : mapType === 'hybrid' ? 'h' : 'm';
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${activeLat},${activeLng}&t=${embedTypeParam}&z=${selectedAsset ? 16 : zoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col card-pop">
      {/* Map Header Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-teal-50/20 to-sky-50/20">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-teal-50 rounded-xl text-teal-700 border border-teal-200">
            <Globe className="w-4 h-4 text-teal-600" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Google Maps Platform</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                Live Google Maps
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Metropolitan Cadastral Layer &bull; {filteredAssets.length} of {assets.length} municipal assets
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Map Type Switcher */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                mapType === 'roadmap' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                mapType === 'satellite' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapType('terrain')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                mapType === 'terrain' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terrain
            </button>
          </div>

          {/* Asset Filter Buttons */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                filter === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Assets ({assets.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('HIGH_RISK')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                filter === 'HIGH_RISK' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High Risk
            </button>
            <button
              type="button"
              onClick={() => setFilter('REPEAT_FAILURES')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                filter === 'REPEAT_FAILURES' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Repeat Failures
            </button>
          </div>
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="relative w-full overflow-hidden" style={{ height }}>
        {/* If JS API is active with key */}
        {hasApiKey && isLoaded ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          /* Live Google Maps Embed */
          <iframe
            title="Google Maps Municipal Infrastructure View"
            src={googleMapsEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        )}

        {/* Floating Asset Selector Overlay for instant focus */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 max-w-[85%] sm:max-w-xl pointer-events-auto">
          {filteredAssets.slice(0, 6).map((asset) => {
            const isSelected = selectedAsset?.assetId === asset.assetId;
            const isRepeat = asset.repeatFailureFlag;
            return (
              <button
                key={asset.assetId}
                type="button"
                onClick={() => {
                  setSelectedAsset(asset);
                  if (onAssetSelect) onAssetSelect(asset);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white ring-2 ring-teal-500 scale-105'
                    : isRepeat
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-white/95 hover:bg-white text-slate-800 border border-slate-200'
                }`}
              >
                <MapPin className={`w-3 h-3 ${isRepeat ? 'text-rose-600' : 'text-teal-600'}`} />
                <span>{asset.assetId}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Asset Overlay Drawer */}
        {selectedAsset && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-xl z-20 space-y-3 card-pop">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-extrabold bg-teal-100 text-teal-900 border border-teal-200">
                  {selectedAsset.assetId}
                </span>
                <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                  {selectedAsset.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold leading-none px-2 py-1"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                <strong className="text-slate-800 truncate block">{selectedAsset.location.street}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Ward</span>
                <strong className="text-slate-800">{selectedAsset.location.ward}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Risk Assessment</span>
                <span
                  className={`font-bold ${
                    selectedAsset.riskLevel === 'HIGH' ? 'text-rose-600' : 'text-teal-700'
                  }`}
                >
                  {selectedAsset.riskLevel || 'NORMAL'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                <strong className="text-slate-800">{selectedAsset.status || 'Active'}</strong>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Link
                to={`/memory-graph?assetId=${selectedAsset.assetId}`}
                className="flex-1 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold text-center transition btn-pop"
              >
                Memory Graph &rarr;
              </Link>
              <Link
                to={`/investigations?assetId=${selectedAsset.assetId}`}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold text-center transition"
              >
                Root Cause AI
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Google Maps Platform Active
          </span>
          <span>&bull;</span>
          <span>Roadmap, Satellite & Terrain Live Streaming</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>Target: {activeLat.toFixed(4)}, {activeLng.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};
