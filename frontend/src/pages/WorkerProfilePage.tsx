import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck,
  HardHat,
  ShieldCheck,
  CheckCircle2,
  Award,
  Phone,
  Mail,
  MapPin,
  Save,
  RefreshCw,
  Clock
} from 'lucide-react';

export const WorkerProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('Ward 4 (Central)');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.users.getProfile().then((res) => {
      if (res.data) {
        setName(res.data.name || 'Ramesh Kumar');
        setPhone(res.data.phone || '+1 (555) 019-8819');
        setWard(res.data.ward || 'Ward 4 (Central)');
      }
    }).catch(() => {
      setName(user?.name || 'Ramesh Kumar');
      setPhone(user?.phone || '+1 (555) 019-8819');
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.users.updateProfile({
        name,
        phone,
        ward
      });
      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-teal-600" />
          Field Worker Profile & Safety Credentials
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your field crew identity, municipal credentials, contact details, and equipment certifications.
        </p>
      </div>

      {/* Profile ID Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center font-extrabold text-2xl">
              <HardHat className="w-8 h-8 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-900/60 text-teal-300 border border-teal-700">
                  FW-108
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Zone 4 Field Maintenance Squad B</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active Duty Certified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-teal-400 shrink-0" />
            <span>worker@repairtrust.gov</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{phone || '+1 (555) 019-8819'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{ward}</span>
          </div>
        </div>
      </div>

      {/* Safety Certifications Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-teal-600" />
          Active Safety & Equipment Certifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            {
              title: 'Confined Space Entry & Atmospheric Testing',
              certId: 'CSE-2025-882',
              validTill: 'December 2027',
              level: 'Level 2 Supervisor'
            },
            {
              title: 'High-Pressure Water Jetting Operator',
              certId: 'HPW-2024-419',
              validTill: 'August 2027',
              level: 'Master Operator (Class A)'
            },
            {
              title: 'Vacuum Gully Sucker Unit Specialist',
              certId: 'VGS-2025-102',
              validTill: 'March 2028',
              level: 'Heavy Vehicle Certified'
            },
            {
              title: 'First Aid & Field Trench Rescue',
              certId: 'FAR-2026-031',
              validTill: 'January 2028',
              level: 'Red Cross Certified'
            }
          ].map((cert, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>{cert.title}</span>
                <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  {cert.certId}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Level: {cert.level}</span>
                <span>Valid: {cert.validTill}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Edit Contact & Operational Ward
        </h3>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile details successfully updated!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Full Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Mobile Phone (Emergency Dispatch):</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-bold mb-1">Primary Operational Ward:</label>
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

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Profile Details
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
