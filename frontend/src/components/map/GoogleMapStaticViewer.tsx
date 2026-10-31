import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../../utils/googleMapsLoader';
import { MapPin, Globe } from 'lucide-react';

interface GoogleMapStaticViewerProps {
  position: { lat: number; lng: number };
  title?: string;
  height?: string;
  zoom?: number;
}

export const GoogleMapStaticViewer: React.FC<GoogleMapStaticViewerProps> = ({
  position,
  title = 'Asset Location',
  height = '200px',
  zoom = 15
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadGoogleMaps()
      .then((g) => {
        if (!isMounted || !containerRef.current) return;

        const map = new g.maps.Map(containerRef.current, {
          center: position,
          zoom,
          mapTypeId: g.maps.MapTypeId.ROADMAP,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          zoomControl: true
        });

        const svgIcon = {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: '#0d9488',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 1.6,
          anchor: new google.maps.Point(12, 22)
        };

        new g.maps.Marker({
          position,
          map,
          icon: svgIcon,
          title
        });

        setIsLoaded(true);
      })
      .catch((err) => {
        console.warn('Google Maps Static Viewer:', err.message);
        if (isMounted) setIsLoaded(false);
      });

    return () => {
      isMounted = false;
    };
  }, [position.lat, position.lng, zoom, title]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner" style={{ height }}>
      {/* Real Google Maps Canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Fallback Display if API Key is not set or network blocked */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-4 text-center space-y-2 z-10">
          <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">{title}</div>
            <div className="text-[11px] font-mono text-slate-500">
              {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </div>
          </div>
          <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100 flex items-center gap-1">
            <Globe className="w-3 h-3" /> Google Maps Platform
          </span>
        </div>
      )}
    </div>
  );
};
