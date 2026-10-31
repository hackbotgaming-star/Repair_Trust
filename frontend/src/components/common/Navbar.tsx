import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { api } from '../../api/client';
import {
  ShieldCheck,
  Building2,
  HardHat,
  User,
  CheckCircle2,
  Camera,
  Search,
  LayoutDashboard,
  LogOut,
  LogIn,
  Layers,
  Wrench,
  Activity,
  Users,
  Compass,
  AlertCircle,
  RefreshCw,
  MapPin,
  BarChart3,
  Video
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDemo = async () => {
    if (!window.confirm('Reset synthetic demonstration dataset to pristine state (22 assets, DR-001 scenario)?')) return;
    try {
      setResetting(true);
      await api.demo.reset();
      setResetSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err) {
      alert('Failed to reset demo: ' + err);
    } finally {
      setResetting(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isPublicHome = location.pathname === '/';
  const isReport = location.pathname === '/report';
  const isTrack = location.pathname.startsWith('/track');

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner for Transparency */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          <span className="font-semibold text-white tracking-wide">REPAIRTRUST PLATFORM</span>
          <span className="text-slate-400 hidden sm:inline">— Municipal Infrastructure Verification & Decision Support</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            SYNTHETIC DATASET (LABELED DEMO)
          </span>
          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="text-slate-300 hover:text-white hover:bg-slate-800 px-2 py-0.5 rounded transition flex items-center gap-1 text-[11px]"
            title="Reset dataset to initial scenario state"
          >
            <RefreshCw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
            {resetSuccess ? 'Reset Complete!' : 'Reset Demo'}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-slate-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition">
              <ShieldCheck className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none">RepairTrust</h1>
                <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-1.5 py-0.5 rounded border border-teal-200">v1.2</span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">Trust Repairs. Find Real Fixes.</p>
            </div>
          </Link>

          {/* Role-Specific Primary Navigation (Only shows current role's routes) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {/* If NOT logged in (Guest View) */}
            {!user && (
              <>
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isPublicHome ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/track"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isTrack ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-teal-600" />
                  Track
                </Link>
                <Link
                  to="/map"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname.includes('/map') ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Public Map
                </Link>
                <Link
                  to="/transparency"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname.includes('/transparency') ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
                  Transparency
                </Link>
              </>
            )}

            {/* If Logged in as CITIZEN */}
            {user && user.role === 'citizen' && (
              <>
                <Link
                  to="/citizen"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname === '/citizen' || location.pathname === '/citizen-portal'
                      ? 'bg-white text-teal-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-teal-600" />
                  Citizen Portal
                </Link>
                <Link
                  to="/report"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isReport ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-teal-600" />
                  Report Issue
                </Link>
                <Link
                  to="/track"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isTrack ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-teal-600" />
                  Track Complaint
                </Link>
                <Link
                  to="/citizen/my-complaints"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    location.pathname.includes('/my-complaints') ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Complaints
                </Link>
                <Link
                  to="/citizen/map"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    location.pathname.includes('/map') ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Public Map
                </Link>
              </>
            )}

            {/* If Logged in as FIELD WORKER */}
            {user && user.role === 'field_worker' && (
              <>
                <Link
                  to="/worker"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname === '/worker' || location.pathname === '/worker-portal'
                      ? 'bg-amber-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HardHat className="w-3.5 h-3.5" />
                  Worker Station
                </Link>
                <Link
                  to="/worker/tasks"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname.startsWith('/worker/tasks') ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  My Tasks
                </Link>
                <Link
                  to="/worker/check-in"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname.startsWith('/worker/check-in') ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  Site Check-in
                </Link>
                <Link
                  to="/worker/livework"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname.startsWith('/worker/livework') ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-rose-600" />
                  LiveWork Proof
                </Link>
              </>
            )}

            {/* If Logged in as MUNICIPAL ENGINEER */}
            {user && user.role === 'engineer' && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname === '/dashboard' || location.pathname === '/overview'
                      ? 'bg-teal-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Engineer Overview
                </Link>
                <Link
                  to="/assets"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname.startsWith('/assets') ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-teal-600" />
                  Asset Registry
                </Link>
                <Link
                  to="/complaints"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    location.pathname.startsWith('/complaints') ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Complaints Hub
                </Link>
                <Link
                  to="/work-orders"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname.startsWith('/work-orders') ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-teal-600" />
                  Work Orders
                </Link>
                <Link
                  to="/engineer/map"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname.startsWith('/engineer/map') ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Cadastral GIS
                </Link>
              </>
            )}

            {/* If Logged in as ADMINISTRATOR */}
            {user && user.role === 'administrator' && (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname === '/admin' || location.pathname === '/admin/overview'
                      ? 'bg-indigo-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Admin Console
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname.startsWith('/admin/users') ? 'bg-white text-indigo-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  User & Roles
                </Link>
                <Link
                  to="/admin/audit-logs"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    location.pathname.startsWith('/admin/audit-logs') ? 'bg-white text-indigo-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Audit Logs
                </Link>
                <Link
                  to="/admin/system-health"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    location.pathname.startsWith('/admin/system-health') ? 'bg-white text-indigo-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  System Health
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Section: Authenticated Session Info / Sign Out */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Role Badge and User Name */}
              <div className="flex items-center gap-2.5 bg-slate-50 py-1.5 px-3 rounded-2xl border border-slate-200 shadow-2xs">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-white shadow-2xs ${
                    user.role === 'citizen'
                      ? 'bg-emerald-600'
                      : user.role === 'field_worker'
                      ? 'bg-amber-600'
                      : user.role === 'administrator'
                      ? 'bg-indigo-600'
                      : 'bg-teal-600'
                  }`}
                >
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[150px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs flex items-center gap-1.5 transition hover-pop btn-pop"
                title="Sign out of your role session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-1.5 transition hover-pop btn-pop"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Role Login</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
