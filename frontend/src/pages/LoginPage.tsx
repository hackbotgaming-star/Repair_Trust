import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { Login3DScene } from '../components/3d/Login3DScene';
import { Interactive3DCard } from '../components/common/Interactive3DCard';
import { getRoleHomePath } from '../components/common/RoleProtectedRoute';
import {
  ShieldCheck,
  Building2,
  HardHat,
  User,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  KeyRound,
  LayoutGrid,
  ShieldAlert,
  ChevronRight,
  Check,
  FileCheck
} from 'lucide-react';

interface RoleDefinition {
  id: Role;
  title: string;
  badge: string;
  badgeColor: string;
  department: string;
  email: string;
  password: string;
  targetPath: string;
  icon: any;
  accentBg: string;
  borderColor: string;
  buttonColor: string;
  description: string;
  features: string[];
}

const MAIN_ROLES: RoleDefinition[] = [
  {
    id: 'citizen',
    title: 'Citizen Reporter',
    badge: 'Public Resident',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    department: 'Civilian Infrastructure Oversight',
    email: 'citizen@repairtrust.gov',
    password: 'password123',
    targetPath: '/citizen',
    icon: User,
    accentBg: 'from-emerald-500/10 via-teal-50/50 to-white',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    description: 'Report local infrastructure failures, upload authentic photos, track repair lifecycles, and challenge superficial closures.',
    features: [
      'Report potholes, overflowing drains & roads',
      'Tamper-evident photo evidence submission',
      'Live tracking of complaint status',
      'Citizen recurrence challenge & dispute rights'
    ]
  },
  {
    id: 'field_worker',
    title: 'Field Worker & Crew',
    badge: 'Zone 4 Squad B',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    department: 'Field Maintenance & On-Site Operations',
    email: 'worker@repairtrust.gov',
    password: 'password123',
    targetPath: '/worker',
    icon: HardHat,
    accentBg: 'from-amber-500/10 via-orange-50/50 to-white',
    borderColor: 'border-amber-200 hover:border-amber-400',
    buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    description: 'Accept assigned field work orders, record GPS check-ins, capture Before/During/After photos, and record LiveWork video proof.',
    features: [
      'Assigned repair task queue & deadline tracker',
      'GPS perimeter check-in with cadastral map',
      'Mandatory Before/During/After photo evidence',
      'In-browser LiveWork Proof video recorder'
    ]
  },
  {
    id: 'engineer',
    title: 'Municipal Engineer',
    badge: 'Certified P.E.',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    department: 'Stormwater Infrastructure & Drainage Engineering',
    email: 'engineer@repairtrust.gov',
    password: 'password123',
    targetPath: '/dashboard',
    icon: Building2,
    accentBg: 'from-teal-500/10 via-sky-50/50 to-white',
    borderColor: 'border-teal-200 hover:border-teal-400',
    buttonColor: 'bg-teal-600 hover:bg-teal-700 text-white',
    description: 'Inspect drainage asset health, analyze recurring bottlenecks with AI, verify LiveWork proof, and sign off with Closure Auditor.',
    features: [
      'Full 22+ asset cadastral registry & memory graph',
      'AI Root-Cause & Evidence-Gap investigative engine',
      'Work order verification & Closure Auditor sign-off',
      'Commission CCTV inspections & downstream audits'
    ]
  },
  {
    id: 'administrator',
    title: 'System Administrator',
    badge: 'Governance & Security',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    department: 'Platform Governance & Municipal Integrity',
    email: 'admin@repairtrust.gov',
    password: 'password123',
    targetPath: '/admin',
    icon: ShieldCheck,
    accentBg: 'from-indigo-500/10 via-purple-50/50 to-white',
    borderColor: 'border-indigo-200 hover:border-indigo-400',
    buttonColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    description: 'Supervise platform security, enforce least-privilege role boundaries, audit tamper-evident SHA-256 logs, and verify system health.',
    features: [
      'User management & role governance guardrails',
      'Cryptographic chained audit log ledger',
      'Data quality & duplicate asset/photo review',
      'Automated backup snapshot generation'
    ]
  }
];

export const LoginPage: React.FC = () => {
  const { login, loginAsRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if a specific return path was requested
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect');

  const [activeTab, setActiveTab] = useState<'roles' | 'custom'>('roles');
  const [selectedRole, setSelectedRole] = useState<Role>('engineer');
  const [loadingRole, setLoadingRole] = useState<Role | null>(null);

  // Custom form state
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1-Click Role Login handler
  const handleRoleLogin = async (roleDef: RoleDefinition) => {
    try {
      setLoadingRole(roleDef.id);
      setSelectedRole(roleDef.id);
      setErrorMessage(null);

      const user = await loginAsRole(roleDef.id);
      const destination = redirectPath || getRoleHomePath(user.role);
      navigate(destination, { replace: true });
    } catch (err: any) {
      console.error('Role login error:', err);
      setErrorMessage(err.message || 'Unable to authenticate with role preset.');
    } finally {
      setLoadingRole(null);
    }
  };

  // Custom credentials login handler
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customPassword.trim()) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    try {
      setFormLoading(true);
      setErrorMessage(null);

      const user = await login(customEmail.trim(), customPassword.trim());
      // Navigate strictly to that user's authorized role dashboard
      const destination = redirectPath || getRoleHomePath(user.role);
      navigate(destination, { replace: true });
    } catch (err: any) {
      console.error('Custom login error:', err);
      setErrorMessage(err.message || 'Invalid email or password. Please verify your municipal credentials.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-sky-50/30 text-slate-900 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover-pop transition btn-pop"
        >
          <ArrowLeft className="w-4 h-4 text-teal-600" />
          <span>Back to Public Landing</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
            Role-Based Access Control Active &bull; Zero Cross-Role Bleed
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full my-auto space-y-8">
        {/* Title & Introduction */}
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Strict Role-Isolated Municipal Authentication</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Your Designated Workstation
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Each municipal role is strictly isolated. When you log in, you will be redirected exclusively to your role's website details, operational tools, and dashboard.
          </p>
        </div>

        {/* Tab Toggle: Main Roles vs Custom Credentials */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/80 shadow-inner gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('roles')}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'roles'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-teal-600" />
              <span>4 Main Roles (1-Click Gateway)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'custom'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-4 h-4 text-teal-600" />
              <span>Custom Email & Password</span>
            </button>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="max-w-2xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-3 shadow-xs card-pop">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold block">Authentication Notice</strong>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* VIEW 1: 4 MAIN ROLES GATEWAY CARDS */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {MAIN_ROLES.map((roleDef) => {
                const Icon = roleDef.icon;
                const isLoading = loadingRole === roleDef.id;

                return (
                  <div
                    key={roleDef.id}
                    onMouseEnter={() => setSelectedRole(roleDef.id)}
                    className={`bg-gradient-to-b ${roleDef.accentBg} bg-white rounded-3xl border-2 ${roleDef.borderColor} p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between card-pop hover-pop relative overflow-hidden group`}
                  >
                    <div className="space-y-4">
                      {/* Top Header Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${roleDef.badgeColor}`}>
                          {roleDef.badge}
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-700 group-hover:scale-110 transition">
                          <Icon className="w-5 h-5 text-teal-700" />
                        </div>
                      </div>

                      {/* Role Info */}
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                          {roleDef.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                          {roleDef.department}
                        </p>
                        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                          {roleDef.description}
                        </p>
                      </div>

                      {/* Feature Bullet Points */}
                      <div className="pt-3 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Included Access:
                        </span>
                        <ul className="text-[11px] text-slate-600 space-y-1">
                          {roleDef.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 leading-tight">
                              <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="pt-6 space-y-2">
                      <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between px-1">
                        <span>Demo ID:</span>
                        <span className="text-slate-600 font-semibold">{roleDef.email}</span>
                      </div>

                      <button
                        type="button"
                        disabled={loadingRole !== null}
                        onClick={() => handleRoleLogin(roleDef)}
                        className={`w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs ${roleDef.buttonColor} btn-pop`}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Opening {roleDef.title}...</span>
                          </>
                        ) : (
                          <>
                            <span>Log in as {roleDef.title}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive 3D Digital Security Twin Banner */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center card-pop">
              <div className="lg:col-span-4 h-56 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                <Login3DScene activeRole={selectedRole} />
              </div>

              <div className="lg:col-span-8 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    Role-Isolated Architecture Assurance
                  </span>
                  <span className="text-xs text-slate-400 font-mono">RBAC v1.2</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Strict Architectural Isolation Between Roles
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In compliance with municipal integrity directives, authenticated sessions are bound strictly to the user's role.
                  Citizens only access citizen complaint services; Field Workers only manage on-site task evidence;
                  Municipal Engineers hold sole authority over Closure Auditor verification; and Administrators hold governance controls without the power to erase public complaints.
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" /> Citizen Route Shield
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <CheckCircle2 className="w-4 h-4" /> Worker Task Guard
                  </span>
                  <span className="flex items-center gap-1.5 text-teal-700">
                    <CheckCircle2 className="w-4 h-4" /> Engineer Sign-Off Verification
                  </span>
                  <span className="flex items-center gap-1.5 text-indigo-700">
                    <CheckCircle2 className="w-4 h-4" /> Tamper-Evident SHA-256 Ledger
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CUSTOM CREDENTIALS FORM */}
        {activeTab === 'custom' && (
          <div className="max-w-md mx-auto w-full">
            <Interactive3DCard className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-2xl p-7 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                  <KeyRound className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Custom Account Sign In
                  </h3>
                  <p className="text-xs text-slate-500">Sign in with any registered municipal email</p>
                </div>
              </div>

              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      required
                      placeholder="e.g. officer@repairtrust.gov"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      required
                      placeholder="Enter password"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block text-[11px] uppercase">
                    Automatic Role Routing:
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    The backend automatically verifies your registered role and routes you directly to your assigned dashboard with zero cross-role access.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg shadow-teal-600/20 btn-pop"
                >
                  {formLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                    </>
                  ) : (
                    <>
                      <span>Sign In & Open My Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('roles')}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                >
                  &larr; Return to 4 Main Roles 1-Click Gateway
                </button>
              </div>
            </Interactive3DCard>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-slate-500 pt-8 border-t border-slate-200/60 mt-8">
        <p>RepairTrust &bull; Municipal Infrastructure Repair Verification and Decision-Support Platform</p>
      </div>
    </div>
  );
};
