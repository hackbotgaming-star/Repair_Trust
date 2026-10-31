import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardCheck,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  RefreshCw,
  Plus,
  Trash2,
  Compass,
  FileText
} from 'lucide-react';

export const WorkerSiteInspectionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState(searchParams.get('asset') || 'DR-001');
  const [workOrderId, setWorkOrderId] = useState(searchParams.get('task') || 'WO-2026-003');

  // Form Fields
  const [debrisLevel, setDebrisLevel] = useState<'Clean' | 'Light' | 'Moderate' | 'Heavy / Choked'>('Moderate');
  const [structuralIntegrity, setStructuralIntegrity] = useState<'Sound' | 'Minor Spalling' | 'Severe Crack' | 'Collapsed Section'>('Sound');
  const [siltDepthCm, setSiltDepthCm] = useState<number>(18);
  const [waterVelocityMps, setWaterVelocityMps] = useState<number>(0.4);
  const [downstreamFlowClear, setDownstreamFlowClear] = useState<boolean>(true);
  const [observedDamage, setObservedDamage] = useState('');
  const [recommendationAction, setRecommendationAction] = useState('Routine Maintenance Check');
  const [recommendationUrgency, setRecommendationUrgency] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');

  // Materials Used Entries
  const [materials, setMaterials] = useState<{ item: string; quantity: string }[]>([
    { item: 'High-Pressure Water Tanker', quantity: '1 Load' }
  ]);

  // Geolocation & Auto vs Manual Tracking
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [manualStreetName, setManualStreetName] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Photos
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80');

  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [submittedInspection, setSubmittedInspection] = useState<any | null>(null);

  useEffect(() => {
    api.assets.list().then((res) => {
      setAssets(res.data || []);
    }).catch(() => {});
  }, []);

  const handleAcquireGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your device browser.');
      return;
    }
    setIsLocating(true);
    setLocationStatus('Acquiring high-precision GPS lock from device sensor...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsManualLocation(false);
        setLocationStatus(`GPS Locked: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (Accuracy: ${pos.coords.accuracy?.toFixed(0) || 10}m)`);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus('GPS access denied. Switched to manual location entry.');
        setIsManualLocation(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const addMaterialRow = () => {
    setMaterials([...materials, { item: '', quantity: '' }]);
  };

  const removeMaterialRow = (idx: number) => {
    setMaterials(materials.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        assetId: selectedAssetId,
        workOrderId,
        inspectionType: recommendationAction,
        findings: {
          debrisLevel,
          structuralIntegrity,
          downstreamFlowClear,
          siltDepthCm: Number(siltDepthCm),
          waterVelocityMps: Number(waterVelocityMps),
          notes: observedDamage || 'Field inspection conducted on site.'
        },
        materialsLogged: materials.filter((m) => m.item.trim().length > 0),
        location: {
          coordinates: coordinates || { lat: 12.9716, lng: 77.5946 },
          isManualEntry: isManualLocation,
          street: manualStreetName || 'Site Location'
        },
        photos: photoUrl ? [photoUrl] : [],
        recommendation: {
          actionRequired: debrisLevel !== 'Clean',
          suggestedRepairType: recommendationAction,
          urgency: recommendationUrgency
        }
      };

      const res = await api.inspections.create(payload);
      setSubmittedInspection(res.data);
    } catch (err: any) {
      alert('Error submitting inspection: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-teal-600" />
          Field Site Inspection
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Mobile-friendly site inspection: record observed hydraulic blockage, physical measurements, and materials.
        </p>
      </div>

      {submittedInspection ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">Site Inspection Successfully Logged!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Inspection ID <strong>{submittedInspection.inspectionId}</strong> for Asset <strong>{submittedInspection.assetId}</strong> has
            been recorded into the municipal provenance registry with tamper-evident logs.
          </p>

          <div className="pt-3 flex justify-center gap-3">
            <button
              onClick={() => setSubmittedInspection(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Log Another Inspection
            </button>
            <Link
              to="/worker/tasks"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              View My Tasks <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {/* Asset & Task Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Infrastructure Asset: <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none font-semibold bg-white"
                required
              >
                {assets.map((a) => (
                  <option key={a.assetId} value={a.assetId}>
                    {a.assetId} — {a.name} ({a.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Linked Work Order (Optional):
              </label>
              <input
                type="text"
                value={workOrderId}
                onChange={(e) => setWorkOrderId(e.target.value)}
                placeholder="e.g. WO-2026-003"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          {/* Section: Physical Measurements */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Physical Measurements & Hydraulic Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700">Observed Silt Depth:</span>
                  <span className="font-extrabold text-teal-800">{siltDepthCm} cm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={siltDepthCm}
                  onChange={(e) => setSiltDepthCm(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 cm (Clean)</span>
                  <span>50 cm (Moderate)</span>
                  <span>100 cm (Severely Choked)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700">Measured Invert Flow Velocity:</span>
                  <span className="font-extrabold text-teal-800">{waterVelocityMps} m/s</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.5"
                  step="0.05"
                  value={waterVelocityMps}
                  onChange={(e) => setWaterVelocityMps(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0.1 m/s (Stagnant Backwater)</span>
                  <span>1.0 m/s (Nominal)</span>
                  <span>2.5 m/s (Rapid Discharge)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Debris & Sediment Level:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Clean', 'Light', 'Moderate', 'Heavy / Choked'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDebrisLevel(lvl)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border text-left ${
                        debrisLevel === lvl
                          ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs ring-1 ring-teal-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Structural Condition:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Sound', 'Minor Spalling', 'Severe Crack', 'Collapsed Section'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStructuralIntegrity(st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border text-left ${
                        structuralIntegrity === st
                          ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs ring-1 ring-teal-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Damage & Flow Notes */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Observed Damage & Obstruction Notes:
            </label>
            <textarea
              rows={3}
              value={observedDamage}
              onChange={(e) => setObservedDamage(e.target.value)}
              placeholder="e.g. Silt compacting downstream of culvert mouth. Heavy plastic sediment bridging grating teeth. Minor concrete spalling on left retaining wall..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Section: Materials Logged */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Materials / Equipment Utilized on Site:
              </label>
              <button
                type="button"
                onClick={addMaterialRow}
                className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Material Item
              </button>
            </div>

            <div className="space-y-2">
              {materials.map((m, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={m.item}
                    onChange={(e) => {
                      const updated = [...materials];
                      updated[idx].item = e.target.value;
                      setMaterials(updated);
                    }}
                    placeholder="Material or Equipment (e.g. Rapid-set Mortar 25kg)"
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                  />
                  <input
                    type="text"
                    value={m.quantity}
                    onChange={(e) => {
                      const updated = [...materials];
                      updated[idx].quantity = e.target.value;
                      setMaterials(updated);
                    }}
                    placeholder="Quantity (e.g. 2 Bags)"
                    className="w-36 px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                  />
                  {materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMaterialRow(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Location & Data Provenance (CRITICAL REQUIREMENT: Label Auto vs Manual Data) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                4. Location & Sensor Provenance
              </label>

              {/* Provenance Badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                  coordinates && !isManualLocation
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {coordinates && !isManualLocation
                  ? 'Sensor: Auto-captured via Device GPS'
                  : 'Manual Entry: Entered by Worker'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleAcquireGPS}
                  disabled={isLocating}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  {isLocating ? 'Acquiring GPS...' : 'Acquire GPS Fix from Phone/Device'}
                </button>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="manualToggle"
                    checked={isManualLocation}
                    onChange={(e) => setIsManualLocation(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="manualToggle" className="text-slate-600 font-medium">
                    Manual Location Override (If GPS unavailable)
                  </label>
                </div>
              </div>

              {locationStatus && (
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700 font-mono text-[11px]">
                  {locationStatus}
                </div>
              )}

              {isManualLocation && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Manual Street / Cross Road Description:
                  </label>
                  <input
                    type="text"
                    value={manualStreetName}
                    onChange={(e) => setManualStreetName(e.target.value)}
                    placeholder="e.g. Near Junction of 12th Cross and MG Commercial Road"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white font-medium"
                    required={isManualLocation}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Logging Inspection Record...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Site Inspection
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
