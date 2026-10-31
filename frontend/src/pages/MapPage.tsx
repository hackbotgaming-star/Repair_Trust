import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Asset } from '../types';
import { GoogleMapView } from '../components/map/GoogleMapView';
import { MapPin, Layers } from 'lucide-react';

export const MapPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.assets
      .list({ limit: 50 })
      .then((res) => setAssets(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              CORE MODULE 11
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500">Spatial Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-teal-600" />
            GIS Infrastructure & Work Locations Map
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Geospatial representation of stormwater drains, culverts, and repeat-failure risk hotspots across metropolitan wards.
          </p>
        </div>
        <div className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
          Mapped Assets: <span className="font-bold text-slate-900">{assets.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="h-[600px] bg-slate-200 rounded-2xl animate-pulse"></div>
      ) : (
        <GoogleMapView assets={assets} height="650px" />
      )}
    </div>
  );
};
