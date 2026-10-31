import React, { useState, useEffect } from 'react';
import { GoogleMapStaticViewer } from '../components/map/GoogleMapStaticViewer';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Compass,
  ArrowRight,
  ShieldCheck,
  Clock,
  Navigation
} from 'lucide-react';

export const WorkerLocationCheckInPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [assetDetails, setAssetDetails] = useState<any | null>(null);

  // GPS & Check-In States
  const [workerGps, setWorkerGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualReason, setManualReason] = useState('');
  const [manualStreet, setManualStreet] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const res = await api.workOrders.myTasks();
      const myTasks = res.data || [];
      setTasks(myTasks);
      const active = myTasks.find((t: any) => t.status === 'In Progress') || myTasks[0];
      setSelectedTask(active || null);

      if (active?.assetId) {
        const aRes = await api.assets.get(active.assetId);
        setAssetDetails(aRes.data);
      }

      if (active?.checkIns) {
        setRecentCheckIns(active.checkIns);
      }
    } catch (err) {
      console.error('Error loading tasks for check-in:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectTask = async (taskId: string) => {
    const t = tasks.find((item) => item.workOrderId === taskId);
    if (t) {
      setSelectedTask(t);
      if (t.checkIns) setRecentCheckIns(t.checkIns);
      if (t.assetId) {
        const aRes = await api.assets.get(t.assetId);
        setAssetDetails(aRes.data);
      }
    }
  };

  // Browser Geolocation
  const handleAcquireLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setIsManualModalOpen(true);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setWorkerGps({ lat, lng });
        setGpsAccuracy(pos.coords.accuracy || 10);

        // Calculate distance to asset
        if (assetDetails?.location?.coordinates) {
          const aLat = assetDetails.location.coordinates.lat;
          const aLng = assetDetails.location.coordinates.lng;
          const R = 6371e3;
          const phi1 = (lat * Math.PI) / 180;
          const phi2 = (aLat * Math.PI) / 180;
          const deltaPhi = ((aLat - lat) * Math.PI) / 180;
          const deltaLambda = ((aLng - lng) * Math.PI) / 180;
          const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          setDistanceMeters(Math.round(R * c));
        }
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert('Could not access location: ' + err.message + '. You may use the Manual Location Workflow below.');
        setIsManualModalOpen(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleGpsCheckIn = async (type: 'check-in' | 'check-out') => {
    if (!selectedTask) return;
    if (!workerGps) {
      alert('Please acquire your device GPS position first.');
      return;
    }

    setCheckInLoading(true);
    try {
      const res = await api.workOrders.checkIn(selectedTask.workOrderId, {
        coordinates: workerGps,
        isManualEntry: false,
        notes: `GPS ${type} via device sensor`,
        type
      });

      alert(`Successfully recorded ${type} for ${selectedTask.workOrderId}!`);
      setRecentCheckIns(res.data?.checkIns || []);
    } catch (err: any) {
      alert('Error recording check-in: ' + err.message);
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleManualCheckIn = async () => {
    if (!selectedTask || !manualReason.trim()) {
      alert('Please state a reason for manual location entry.');
      return;
    }

    setCheckInLoading(true);
    try {
      const res = await api.workOrders.checkIn(selectedTask.workOrderId, {
        isManualEntry: true,
        manualReason: manualReason.trim(),
        notes: manualStreet || 'Manual site location verified',
        type: 'check-in'
      });

      alert(`Manual check-in recorded for ${selectedTask.workOrderId}.`);
      setRecentCheckIns(res.data?.checkIns || []);
      setIsManualModalOpen(false);
      setManualReason('');
      setManualStreet('');
    } catch (err: any) {
      alert('Error recording manual check-in: ' + err.message);
    } finally {
      setCheckInLoading(false);
    }
  };

  const assetCoords = assetDetails?.location?.coordinates || { lat: 12.9716, lng: 77.5946 };
  const centerCoords = workerGps || assetCoords;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-teal-600" />
            Location & Site Check-in
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Municipal Cadastral GIS live navigation, GPS perimeter check-in, and manual location verification workflows.
          </p>
        </div>

        {tasks.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Active Work Order:</span>
            <select
              value={selectedTask?.workOrderId || ''}
              onChange={(e) => handleSelectTask(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-mono font-bold outline-none focus:ring-2 focus:ring-teal-500"
            >
              {tasks.map((t) => (
                <option key={t.workOrderId} value={t.workOrderId}>
                  {t.workOrderId} — {t.assetId} ({t.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-teal-600" />
                Google Maps Navigation & Site Positioning
              </span>
              <span className="text-[11px] text-slate-500">
                Asset: <strong>{selectedTask?.assetId || 'DR-001'}</strong> ({assetDetails?.location?.street || '12th Cross, MG Avenue'})
              </span>
            </div>

            <GoogleMapStaticViewer
              position={{ lat: centerCoords.lat, lng: centerCoords.lng }}
              title={`${selectedTask?.assetId || 'DR-001'} Target Site`}
              height="384px"
            />
          </div>
        </div>

        {/* Right Col: Check-in Control Station */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              Check-in Control Station
            </h3>

            {/* GPS acquisition button */}
            <button
              onClick={handleAcquireLocation}
              disabled={isLocating}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Compass className="w-4 h-4 text-teal-400" />
              {isLocating ? 'Acquiring GPS Position...' : 'Acquire My GPS Location'}
            </button>

            {/* GPS Proximity Status Box */}
            {workerGps ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>GPS Sensor Fix Acquired</span>
                </div>
                <div className="text-[11px] text-emerald-900">
                  Coordinates: {workerGps.lat.toFixed(4)}, {workerGps.lng.toFixed(4)}
                </div>
                {distanceMeters !== null && (
                  <div className="text-[11px] font-semibold text-emerald-800">
                    Proximity: {distanceMeters} meters from {selectedTask?.assetId}
                    {distanceMeters <= 50 ? ' (Inside site perimeter ✓)' : ' (Outside 50m perimeter)'}
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleGpsCheckIn('check-in')}
                    disabled={checkInLoading}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs"
                  >
                    Check In
                  </button>
                  <button
                    onClick={() => handleGpsCheckIn('check-out')}
                    disabled={checkInLoading}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs"
                  >
                    Check Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 space-y-1">
                <span>Click "Acquire My GPS Location" above to verify arrival at the job site.</span>
              </div>
            )}

            {/* Manual Location Fallback Workflow (Explicitly labeled) */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Manual Fallback:
              </span>
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Manual Location Check-in Workflow
              </button>
              <p className="text-[10px] text-slate-400">
                Use if GPS signal is blocked in underground culverts or device sensor fails.
              </p>
            </div>
          </div>

          {/* Recent Check-ins History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recent Check-ins ({recentCheckIns.length})
            </h3>

            {recentCheckIns.length === 0 ? (
              <p className="text-xs text-slate-400">No check-ins recorded for this work order yet.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentCheckIns.map((ci, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-0.5">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span className="capitalize">{ci.type || 'check-in'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ci.timestamp || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {ci.isManualEntry ? (
                        <span className="text-amber-700 font-medium">Manual: {ci.manualReason}</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          GPS: {ci.distanceMeters !== undefined ? `${ci.distanceMeters}m from site` : 'Verified'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explicit Manual Location Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Manual Location Check-in Workflow</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              In accordance with municipal accountability rules, manual location verification requires an explicitly
              documented operational reason in the audit log.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Reason GPS Could Not Be Acquired: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="e.g. Device sensor error; confined box drain concrete slab blocks satellite signal..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Street / Cross Road Landmark:
                </label>
                <input
                  type="text"
                  value={manualStreet}
                  onChange={(e) => setManualStreet(e.target.value)}
                  placeholder="e.g. In front of Drain Invert DR-001 at 12th Cross"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!manualReason.trim() || checkInLoading}
                onClick={handleManualCheckIn}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Confirm Manual Check-in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
