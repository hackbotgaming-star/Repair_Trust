import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps, isGoogleMapsApiKeyConfigured } from '../../utils/googleMapsLoader';
import { MapPin, Navigation, RefreshCw, CheckCircle2, Globe } from 'lucide-react';

interface GoogleMapPickerProps {
  position: { lat: number; lng: number };
  onPositionChange: (lat: number, lng: number) => void;
  height?: string;
}

export const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  position,
  onPositionChange,
  height = '300px'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initialize Google Maps instance
  useEffect(() => {
    let isMounted = true;

    loadGoogleMaps()
      .then((g) => {
        if (!isMounted || !containerRef.current) return;

        const map = new g.maps.Map(containerRef.current, {
          center: position,
          zoom: 16,
          mapTypeId: g.maps.MapTypeId.ROADMAP,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true
        });

        // SVG Pin for Issue Marker
        const svgIcon = {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: '#0d9488',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 1.8,
          anchor: new google.maps.Point(12, 22)
        };

        const marker = new g.maps.Marker({
          position,
          map,
          draggable: true,
          icon: svgIcon,
          title: 'Drag pin or click map to pinpoint issue location'
        });

        // Marker drag event
        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          if (pos) {
            onPositionChange(pos.lat(), pos.lng());
          }
        });

        // Map click event
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            marker.setPosition(e.latLng);
            onPositionChange(e.latLng.lat(), e.latLng.lng());
          }
        });

        mapRef.current = map;
        markerRef.current = marker;
        setIsLoaded(true);
      })
      .catch((err) => {
        console.warn('Google Maps API for Picker:', err.message);
        if (isMounted) {
          setLoadError(err.message);
          setIsLoaded(false);
        }
      });

    return () => {
      isMounted = false;
      if (markerRef.current) markerRef.current.setMap(null);
    };
  }, []);

  // Update marker & map center if position prop changes from outside (e.g. "Use My Exact Location")
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setPosition(position);
      mapRef.current.panTo(position);
    }
  }, [position.lat, position.lng]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner" style={{ height }}>
      {/* Real Google Maps Canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Fallback interactive canvas if Google Maps JS API key is offline */}
      {!isLoaded && (
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
            const yRatio = (e.clientY - rect.top) / rect.height - 0.5;
            const newLat = position.lat - yRatio * 0.01;
            const newLng = position.lng + xRatio * 0.01;
            onPositionChange(Number(newLat.toFixed(6)), Number(newLng.toFixed(6)));
          }}
          className="absolute inset-0 bg-gradient-to-br from-slate-100 via-teal-50/40 to-sky-50/40 flex flex-col justify-between p-4 cursor-crosshair z-10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 bg-white/90 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-600" /> Google Maps Location Picker
            </span>
            <span className="text-[11px] text-slate-500 bg-white/90 px-2.5 py-1 rounded-lg border border-slate-200">
              Click anywhere on grid to position pin
            </span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-mono font-bold shadow-md">
              {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500 font-medium bg-white/80 py-1 rounded-xl">
            Google Maps Platform &bull; Set VITE_GOOGLE_MAPS_API_KEY in frontend/.env to enable live satellite tiles
          </div>
        </div>
      )}

      {/* Top Banner on Live Map */}
      <div className="absolute top-2 left-2 z-10 pointer-events-none">
        <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-200 text-slate-800 font-semibold text-xs shadow-xs flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-teal-600" />
          <span>Click map or drag pin to position</span>
        </span>
      </div>
    </div>
  );
};
