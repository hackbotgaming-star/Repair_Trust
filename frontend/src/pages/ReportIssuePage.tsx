import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleMapPicker } from '../components/map/GoogleMapPicker';
import { api } from '../api/client';
import {
  Send,
  MapPin,
  Camera,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Video,
  Lock,
  Compass
} from 'lucide-react';

export const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields
  const [category, setCategory] = useState('Overflow / Waterlogging');
  const [description, setDescription] = useState('');
  const [street, setStreet] = useState('');
  const [ward, setWard] = useState('Ward 4 (Central)');
  const [landmark, setLandmark] = useState('');
  const [lat, setLat] = useState<number>(12.9716);
  const [lng, setLng] = useState<number>(77.5946);
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Reverse Geocoding States
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeMessage, setGeocodeMessage] = useState<string | null>(null);

  // Camera & Media (Mandatory Photo Evidence)
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<any>(null);
  const [screeningResult, setScreeningResult] = useState<any>(null);

  // Reverse geocoding helper to resolve exact coordinates into real street names via Google Maps Geocoding
  const fetchStreetName = async (latitude: number, longitude: number) => {
    setIsGeocoding(true);
    setGeocodeMessage('Resolving street location via Google Maps Geocoding API...');

    // Try Google Maps Geocoder if initialized
    if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const response = await geocoder.geocode({ location: { lat: latitude, lng: longitude } });
        if (response.results && response.results.length > 0) {
          const formatted = response.results[0].formatted_address;
          setStreet(formatted);
          setGeocodeMessage(`Street resolved: ${formatted}`);
          setIsGeocoding(false);
          return;
        }
      } catch (gErr) {
        console.warn('Google Maps Geocoder fallback to API client:', gErr);
      }
    }

    try {
      const res = await api.complaints.reverseGeocode(latitude, longitude);
      if (res.success && res.data?.street) {
        setStreet(res.data.street);
        setGeocodeMessage(`Street resolved: ${res.data.street}`);
        if (res.data.landmark && !landmark) {
          setLandmark(res.data.landmark);
        }
      } else {
        setStreet(`Municipal Sector near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setGeocodeMessage('Coordinates pinned. Please verify or edit the street name.');
      }
    } catch (e: any) {
      setStreet(`Municipal Sector near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      setGeocodeMessage('Coordinates set. Please confirm street name.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Browser Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsGeocoding(true);
    setGeocodeMessage('Acquiring high-accuracy GPS fix...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setLat(userLat);
        setLng(userLng);
        await fetchStreetName(userLat, userLng);
      },
      (err) => {
        setIsGeocoding(false);
        setGeocodeMessage(null);
        alert('Could not access location: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Browser Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      alert('Camera access denied or unavailable. Please use file upload.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `citizen_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setPhotoFile(file);
          setPhotoPreview(URL.createObjectURL(blob));
        }
      }, 'image/jpeg');
    }
    // Stop stream
    const stream = videoRef.current.srcObject as MediaStream;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setIsCameraActive(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setPhotoFile(f);
      setPhotoPreview(URL.createObjectURL(f));
    }
  };

  const handleFinalSubmit = async () => {
    if (!photoFile) {
      alert('Photo evidence is mandatory. Please go back to Step 3 and attach a photo before submitting.');
      setCurrentStep(3);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description);
      formData.append('street', street || '12th Cross Main Road');
      formData.append('ward', ward);
      formData.append('landmark', landmark);
      formData.append('lat', String(lat));
      formData.append('lng', String(lng));
      formData.append('severity', severity);
      formData.append('reporterName', isAnonymous ? 'Anonymous Citizen' : (reporterName || 'Resident'));
      formData.append('reporterPhone', reporterPhone);
      formData.append('isAnonymous', String(isAnonymous));
      formData.append('photo', photoFile);

      // Submit via v1 API
      const res = await api.complaints.submitV1(formData);
      setSubmittedComplaint(res.data);
      setScreeningResult(res.evidenceScreening);
      setCurrentStep(5); // Success step
    } catch (err: any) {
      alert('Error submitting complaint: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-8">
      {/* Step Indicator */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Report an Infrastructure Issue</h2>
        <p className="text-xs text-slate-500">
          Your report will be authenticated, recorded in an append-only ledger, and assigned to municipal engineers.
        </p>

        {currentStep < 5 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition ${
                    currentStep === step
                      ? 'bg-teal-600 text-white shadow-md'
                      : currentStep > step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {currentStep > step ? '✓' : step}
                </span>
                {step < 4 && <div className="w-8 h-0.5 bg-slate-200"></div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 1: Category & Problem */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Step 1: What is the infrastructure problem?</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Problem Category:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                'Overflow / Waterlogging',
                'Pothole / Damaged Road',
                'Debris / Silt Accumulation',
                'Garbage Blockage',
                'Broken Streetlights',
                'Broken Footpath',
                'Manhole Damaged / Open',
                'Water Pipeline Leak',
                'Structural Crack / Collapse',
                'Other Infrastructure Problem'
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${
                    category === cat
                      ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs ring-1 ring-teal-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Describe the problem clearly:
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Heavy standing water and sewage overflow after 30 minutes of rain. Curb inlets choked with compacted silt, flooding shop entrances..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="button"
              disabled={!description.trim()}
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              Continue to Location <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Location with Reverse-Geocoding & Interactive Google Maps */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Step 2: Where is this located?</h3>
            <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
              Google Maps Platform
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isGeocoding}
              onClick={handleUseMyLocation}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs btn-pop"
            >
              {isGeocoding ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                  <span>Resolving Street Name...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>Use My Exact Location</span>
                </>
              )}
            </button>
            <span className="text-xs text-slate-400">or click/drag the pin on Google Maps to set location:</span>
          </div>

          {geocodeMessage && (
            <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{geocodeMessage}</span>
            </div>
          )}

          {/* Interactive Google Map Location Picker */}
          <GoogleMapPicker
            position={{ lat, lng }}
            onPositionChange={(newLat, newLng) => {
              setLat(newLat);
              setLng(newLng);
              fetchStreetName(newLat, newLng);
            }}
            height="260px"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-bold flex items-center gap-1">
                  Street / Cross Road: <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => fetchStreetName(lat, lng)}
                  className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
                >
                  <Compass className="w-3 h-3" /> Re-lookup Street
                </button>
              </div>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. Kanakapura Road, Jakkasandra"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Auto-populated from map coordinates. You can also manually adjust the name.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Municipal Ward:</label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white font-medium"
              >
                <option value="Ward 1 (Lakeside North)">Ward 1 (Lakeside North)</option>
                <option value="Ward 2 (Market East)">Ward 2 (Market East)</option>
                <option value="Ward 3 (Civic West)">Ward 3 (Civic West)</option>
                <option value="Ward 4 (Central)">Ward 4 (Central)</option>
                <option value="Ward 5 (North Ring)">Ward 5 (North Ring)</option>
                <option value="Ward 6 (Industrial South)">Ward 6 (Industrial South)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-700 font-bold mb-1">Prominent Landmark:</label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Opposite State Bank ATM, near Metro Pillar #42"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none"
            />
          </div>

          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              <strong>Privacy Protection:</strong> Exact GPS coordinates will be generalized to ~100m on the public map to prevent revealing your private home address.
            </span>
          </div>

          <div className="flex justify-between pt-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              disabled={!street.trim() || isGeocoding}
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              Continue to Evidence <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Photo & Video Evidence (MANDATORY PHOTO UPLOAD) */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Step 3: Capture or Upload Authentic Photo Evidence</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-wide">
              Mandatory *
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Photographs taken directly at the scene help municipal engineers schedule immediate repairs and verify root causes.
          </p>

          {/* Mandatory Evidence Warning Banner if no photo attached */}
          {!photoFile && !photoPreview && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Photo Evidence is Mandatory</strong>
                Municipal verification standards require at least one authentic photo of the infrastructure issue before a report can be submitted. Please snap a photo using your camera or upload an image file from your device below.
              </div>
            </div>
          )}

          {/* Camera Viewport */}
          {isCameraActive && (
            <div className="relative bg-slate-950 rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-slate-800">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
              <button
                type="button"
                onClick={capturePhoto}
                className="absolute bottom-4 px-6 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg flex items-center gap-2"
              >
                <Camera className="w-4 h-4" /> Snap Photo Now
              </button>
            </div>
          )}

          {/* Photo Preview & Verification Indicator */}
          {photoPreview && !isCameraActive && (
            <div className="space-y-2">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Photo Attached: <strong>{photoFile?.name || 'Live Camera Capture'}</strong>{' '}
                    {photoFile ? `(${(photoFile.size / 1024).toFixed(1)} KB)` : ''}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                  Ready for Screening
                </span>
              </div>

              <div className="rounded-xl overflow-hidden aspect-video max-h-64 bg-slate-100 border border-slate-200">
                <img src={photoPreview} alt="Evidence preview" className="w-full h-full object-cover" />
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>File will undergo cryptographic SHA-256 and perceptual duplicate screening</span>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  className="text-rose-600 hover:underline font-semibold"
                >
                  Remove & Retake
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!photoPreview && !isCameraActive && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={startCamera}
                className="p-4 rounded-xl border-2 border-dashed border-teal-500 bg-teal-50/50 hover:bg-teal-100/50 text-teal-900 font-bold text-xs flex flex-col items-center justify-center gap-2 transition"
              >
                <Camera className="w-6 h-6 text-teal-600" />
                <span>Use Phone / Web Camera</span>
                <span className="text-[10px] text-teal-600/80 font-normal">Snap photo directly at site</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex flex-col items-center justify-center gap-2 transition"
              >
                <Upload className="w-6 h-6 text-slate-500" />
                <span>Upload From Device</span>
                <span className="text-[10px] text-slate-400 font-normal">JPEG, PNG format supported</span>
              </button>
            </div>
          )}

          {/* Severity selector */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Severity / Safety Hazard:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Low', 'Medium', 'High', 'Critical'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    severity === s
                      ? s === 'Critical'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-3">
              {!photoFile && (
                <span className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Photo required to continue
                </span>
              )}
              <button
                type="button"
                disabled={!photoFile}
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                Continue to Review <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Contact & Review */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Step 4: Reporter Details & Final Submission</h3>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="font-bold text-slate-800">Summary of Report:</div>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>Category: <strong className="text-slate-900">{category}</strong></div>
              <div>Severity: <strong className="text-slate-900">{severity}</strong></div>
              <div>Location: <strong className="text-slate-900">{street}, {ward}</strong></div>
              <div>
                Photo Evidence:{' '}
                <strong className={photoFile ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                  {photoFile ? `Attached (${photoFile.name})` : 'Missing (Required)'}
                </strong>
              </div>
            </div>

            {/* Photo preview thumbnail in review */}
            {photoPreview && (
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                <img src={photoPreview} alt="Attached evidence" className="w-16 h-12 rounded-lg object-cover border border-slate-300" />
                <div className="text-[11px] text-slate-600">
                  <div className="font-semibold text-slate-800">{photoFile?.name}</div>
                  <div>{(photoFile ? photoFile.size / 1024 : 0).toFixed(1)} KB — Will undergo automated SHA-256 screening</div>
                </div>
              </div>
            )}
          </div>

          {/* Anonymous toggle */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800">Submit Anonymously</span>
              <p className="text-[11px] text-slate-500">Your name and contact details will not be recorded in municipal systems.</p>
            </div>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
            />
          </div>

          {!isAnonymous && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Your Full Name:</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Mobile Number (SMS updates):</label>
                <input
                  type="text"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+1 (555) 019-3388"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-3">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              disabled={submitting || !photoFile}
              onClick={handleFinalSubmit}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Submitting & Authenticating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Report to City
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Success & Tracking Link */}
      {currentStep === 5 && submittedComplaint && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-md text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">Complaint Successfully Registered!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your report has been written to the tamper-evident municipal ledger with cryptographic evidence verification.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-sm mx-auto text-xs space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Tracking Reference ID:</span>
            <div className="text-xl font-mono font-extrabold text-teal-800">
              {submittedComplaint.complaintId}
            </div>
            <p className="text-[11px] text-slate-500">Save this ID to follow repairs or dispute closure if incomplete.</p>
          </div>

          {screeningResult && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl max-w-md mx-auto text-xs text-teal-900 space-y-1 text-left">
              <strong className="block text-teal-950 font-bold">Evidence Screening Outcome:</strong>
              <div>Status: <span className="font-semibold">{screeningResult.status}</span></div>
              <div className="text-[11px] font-mono text-slate-500">SHA-256: {screeningResult.sha256Hash?.slice(0, 24)}...</div>
              <div className="pt-1 mt-1 border-t border-teal-200/80 text-[10px] text-amber-800 bg-amber-50/80 p-1.5 rounded">
                <strong>Advanced AI Manipulation Detector:</strong> UNAVAILABLE (Pending configured neural classifier & verified model weights; cryptographic SHA-256 and perceptual dHash duplicate screening active).
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              to={`/track/${submittedComplaint.complaintId}`}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              Open Live Tracking Page <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/citizen/my-complaints"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
            >
              View in My Complaints
            </Link>
            <Link
              to="/citizen"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Citizen Portal Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
