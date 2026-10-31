import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  MapPin,
  RefreshCw,
  Mail,
  Phone,
  FileCheck2
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const CitizenProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('Ward 4 (Central)');

  // Privacy preferences
  const [anonymousByDefault, setAnonymousByDefault] = useState(false);
  const [hideExactAddress, setHideExactAddress] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.users.getProfile();
      const u = res.data;
      if (u) {
        setName(u.name || '');
        setEmail(u.email || '');
        setPhone(u.phone || '');
        setWard(u.ward || 'Ward 4 (Central)');
        if (u.preferences) {
          setAnonymousByDefault(Boolean(u.preferences.anonymousByDefault));
          setHideExactAddress(u.preferences.hideExactAddressOnPublicView !== false);
          setEmailNotifications(u.preferences.emailNotifications !== false);
          setSmsNotifications(Boolean(u.preferences.smsNotifications));
        }
      }
    } catch (err: any) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setErrorMsg(null);

    try {
      await api.users.updateProfile({
        name,
        phone,
        ward,
        preferences: {
          anonymousByDefault,
          hideExactAddressOnPublicView: hideExactAddress,
          emailNotifications,
          smsNotifications
        }
      });
      setSaveSuccess('Your citizen profile and privacy settings have been updated.');
      await refreshUser();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const wardsList = [
    'Ward 1 (North Gate)',
    'Ward 2 (Market East)',
    'Ward 3 (Lakeside West)',
    'Ward 4 (Central)',
    'Ward 5 (Old Town)',
    'Ward 6 (Industrial South)'
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            Citizen Identity & Privacy Controls
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Profile & Privacy Settings</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Manage your authenticated contact information and configure transparency preferences.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
            <button onClick={() => setSaveSuccess(null)} className="font-bold text-emerald-700">
              Dismiss
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Card 1: Contact Details */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-teal-600" />
              1. Citizen Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Email Address (Account Identifier)
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-XXXX"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Primary Municipal Ward
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-white"
                >
                  {wardsList.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Privacy Controls */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
              <Lock className="w-4 h-4 text-indigo-600" />
              2. Privacy & Public Disclosure Controls
            </h3>

            <div className="space-y-4 text-xs">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
                <input
                  type="checkbox"
                  checked={hideExactAddress}
                  onChange={(e) => setHideExactAddress(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <div>
                  <div className="font-bold text-slate-900">
                    Generalize residential location on public maps (~100m radius)
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Recommended: Exact GPS coordinates remain restricted to assigned municipal engineers, while public accountability markers are rounded to protect your home privacy.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
                <input
                  type="checkbox"
                  checked={anonymousByDefault}
                  onChange={(e) => setAnonymousByDefault(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <div>
                  <div className="font-bold text-slate-900">
                    Submit new complaints anonymously by default
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    When checked, your name and contact details are automatically hidden from the public record on all new submissions.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Card 3: Notification Preferences */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
              <Bell className="w-4 h-4 text-amber-600" />
              3. Notification Preferences
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900">Email Alerts on Status Progression</div>
                  <div className="text-slate-500 text-[11px]">
                    Receive email when a work order is dispatched or when verification evidence is submitted.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900">SMS Critical Hazard Warnings</div>
                  <div className="text-slate-500 text-[11px]">
                    Urgent text notifications for high-severity flooding or road collapse in your ward.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsNotifications}
                  onChange={(e) => setSmsNotifications(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Data Protection Policy Info Box */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-teal-700 shrink-0" />
              RepairTrust Data Protection Guarantee
            </div>
            <p className="text-[11px] text-teal-800 leading-relaxed">
              Uploaded photo evidence automatically undergoes EXIF stripping before public display to delete camera device serial numbers and exact home coordinates. Personal phone numbers and emails are never shared with external field contractors.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving Preferences...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile & Privacy Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
