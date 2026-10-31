import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Camera,
  Search,
  MapPin,
  BarChart3,
  Bell,
  RotateCcw,
  FileText,
  UserCheck,
  LayoutDashboard,
  Layers,
  FileSpreadsheet,
  Wrench,
  Video,
  GitBranch,
  SearchCode,
  ClipboardCheck,
  Users,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  FileDown,
  Building2,
  Sliders,
  Cpu,
  History,
  Activity,
  Eye,
  Lock,
  Database,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { api } from '../../api/client';

interface SidebarNavItem {
  to: string;
  label: string;
  shortLabel: string;
  icon: any;
  end?: boolean;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { role } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (role) {
      api.notifications.list().then((res) => {
        setUnreadCount(res.unreadCount || 0);
      }).catch(() => {});
    }
  }, [role]);

  // 9 Explicit Citizen Sidebar Options as required by prompt
  const citizenItems: SidebarNavItem[] = [
    { to: '/citizen', label: 'Citizen Portal Home', shortLabel: 'Home', icon: Compass, end: true },
    { to: '/report', label: 'Report an Issue', shortLabel: 'Report', icon: Camera },
    { to: '/track', label: 'Track Complaint', shortLabel: 'Track', icon: Search },
    { to: '/citizen/map', label: 'Public Map', shortLabel: 'GIS Map', icon: MapPin },
    { to: '/transparency', label: 'Transparency Dashboard', shortLabel: 'Metrics', icon: BarChart3 },
    { to: '/citizen/notifications', label: 'Notifications', shortLabel: 'Alerts', icon: Bell, badge: unreadCount > 0 ? String(unreadCount) : undefined },
    { to: '/citizen/dispute', label: 'Reopen / Dispute Repair', shortLabel: 'Dispute', icon: RotateCcw },
    { to: '/citizen/my-complaints', label: 'My Complaints', shortLabel: 'Complaints', icon: FileText },
    { to: '/citizen/profile', label: 'Profile & Privacy', shortLabel: 'Profile', icon: UserCheck }
  ];

  // 11 Explicit Field Worker Sidebar Options as required by prompt
  const workerItems: SidebarNavItem[] = [
    { to: '/worker', label: 'Field Worker Home', shortLabel: 'Home', icon: LayoutDashboard, end: true },
    { to: '/worker/tasks', label: 'My Assigned Tasks', shortLabel: 'Tasks', icon: Wrench },
    { to: '/worker/work-order', label: 'Work Order Details', shortLabel: 'Details', icon: FileText },
    { to: '/worker/inspection', label: 'Site Inspection', shortLabel: 'Inspect', icon: ClipboardCheck },
    { to: '/worker/livework', label: 'LiveWork Proof', shortLabel: 'LiveWork', icon: Video, badge: 'Live' },
    { to: '/worker/photos', label: 'Before / During / After', shortLabel: 'Photos', icon: Camera },
    { to: '/worker/materials', label: 'Materials & Notes', shortLabel: 'Materials', icon: FileSpreadsheet },
    { to: '/worker/check-in', label: 'Location Check-in', shortLabel: 'GPS Check', icon: MapPin },
    { to: '/worker/history', label: 'Inspection History', shortLabel: 'History', icon: RotateCcw },
    { to: '/worker/notifications', label: 'Notifications', shortLabel: 'Alerts', icon: Bell, badge: unreadCount > 0 ? String(unreadCount) : undefined },
    { to: '/worker/profile', label: 'Worker Profile', shortLabel: 'Profile', icon: UserCheck }
  ];

  // 15 Explicit Municipal Engineer Sidebar Options as required by prompt
  const engineerItems: SidebarNavItem[] = [
    { to: '/overview', label: 'Municipal Overview', shortLabel: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/assets', label: 'Asset Registry', shortLabel: 'Assets', icon: Layers },
    { to: '/complaints', label: 'Complaints Hub', shortLabel: 'Complaints', icon: FileSpreadsheet },
    { to: '/work-orders', label: 'Work Orders', shortLabel: 'Orders', icon: Wrench },
    { to: '/livework', label: 'LiveWork Proof Review', shortLabel: 'Footage', icon: Video, badge: 'Proof' },
    { to: '/memory-graph', label: 'Asset Memory Graph', shortLabel: 'Memory', icon: GitBranch },
    { to: '/investigations', label: 'AI Root-Cause', shortLabel: 'Root Cause', icon: SearchCode },
    { to: '/evidence-gap', label: 'Evidence-Gap Engine', shortLabel: 'Evidence Gap', icon: Sparkles, badge: 'AI' },
    { to: '/inspections', label: 'Inspections', shortLabel: 'Surveys', icon: ClipboardCheck },
    { to: '/closure-auditor', label: 'Closure Auditor', shortLabel: 'Auditor', icon: ShieldAlert, badge: 'Audit' },
    { to: '/analytics', label: 'Repeat-Failure Analytics', shortLabel: 'Analytics', icon: BarChart3 },
    { to: '/engineer/map', label: 'Cadastral GIS Map', shortLabel: 'GIS Map', icon: MapPin },
    { to: '/reports', label: 'Reports and Export', shortLabel: 'Export', icon: FileDown },
    { to: '/engineer/notifications', label: 'Operational Alerts', shortLabel: 'Alerts', icon: Bell, badge: unreadCount > 0 ? String(unreadCount) : undefined },
    { to: '/engineer/profile', label: 'Profile & Settings', shortLabel: 'Profile', icon: UserCheck }
  ];

  // 14 Explicit Administrator Sidebar Options as required by prompt
  const adminItems: SidebarNavItem[] = [
    { to: '/admin', label: 'Administrator Overview', shortLabel: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'User & Role Management', shortLabel: 'Users', icon: Users },
    { to: '/admin/departments-wards', label: 'Departments & Wards', shortLabel: 'Wards', icon: Building2 },
    { to: '/admin/asset-config', label: 'Asset Categories', shortLabel: 'Assets', icon: Layers },
    { to: '/admin/evidence-rules', label: 'Evidence Rules', shortLabel: 'Rules', icon: ShieldCheck },
    { to: '/admin/complaint-settings', label: 'Complaint Settings', shortLabel: 'Settings', icon: Sliders },
    { to: '/admin/ai-settings', label: 'AI Model Settings', shortLabel: 'AI Engine', icon: Cpu },
    { to: '/admin/audit-logs', label: 'Audit Logs', shortLabel: 'Audit', icon: History },
    { to: '/admin/data-quality', label: 'Data Quality Review', shortLabel: 'Data Check', icon: Activity },
    { to: '/admin/system-health', label: 'System Health', shortLabel: 'Health', icon: Eye },
    { to: '/admin/transparency', label: 'Public Transparency', shortLabel: 'Open Data', icon: BarChart3 },
    { to: '/admin/security', label: 'Security & Privacy', shortLabel: 'Security', icon: Lock },
    { to: '/admin/backup', label: 'Backup & Retention', shortLabel: 'Backups', icon: Database },
    { to: '/admin/profile', label: 'Admin Profile', shortLabel: 'Profile', icon: UserCheck }
  ];

  const isCitizenRole = role === 'citizen';
  const isWorkerRole = role === 'field_worker';
  const isAdminRole = role === 'administrator';

  const navItems = isCitizenRole
    ? citizenItems
    : isWorkerRole
    ? workerItems
    : isAdminRole
    ? adminItems
    : engineerItems;

  const roleTitle = isCitizenRole
    ? 'Citizen Portal'
    : isWorkerRole
    ? 'Worker Station'
    : isAdminRole
    ? 'Admin Console'
    : 'Municipal Engineering';

  return (
    <aside
      className={`relative bg-white/95 backdrop-blur-xl border-r border-slate-200/90 flex flex-col shrink-0 min-h-[calc(100vh-5rem)] transition-all duration-300 ease-in-out shadow-xs z-30 ${
        isExpanded ? 'w-72' : 'w-20'
      }`}
    >
      {/* Slide-Toggle Floating Pill Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3.5 top-6 z-40 w-7 h-7 bg-white text-slate-700 hover:text-teal-700 rounded-full border border-slate-300 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 btn-pop"
        title={isExpanded ? 'Collapse Side Dashboard' : 'Slide Open Side Dashboard'}
        aria-label="Toggle Side Dashboard"
      >
        {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <div className="p-3.5 flex-1 space-y-3 overflow-y-auto">
        {/* Sliding Role Header */}
        <div
          className={`px-3 py-2 rounded-xl border flex items-center justify-between transition-all duration-200 ${
            isAdminRole
              ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
              : isWorkerRole
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : isCitizenRole
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-teal-50 border-teal-200 text-teal-900'
          }`}
        >
          {isExpanded ? (
            <>
              <div className="truncate">
                <span className="block text-[11px] font-bold uppercase tracking-wider leading-none">
                  {roleTitle}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block truncate">
                  Role: {role?.replace('_', ' ')}
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shrink-0 ml-2" />
            </>
          ) : (
            <div className="mx-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse block" />
            </div>
          )}
        </div>

        {/* Sliding Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={(item as any).end}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover-pop ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  } ${!isExpanded ? 'justify-center px-0' : ''}`
                }
                title={!isExpanded ? `${idx + 1}. ${item.label}` : undefined}
              >
                <div className={`flex items-center gap-3 truncate ${!isExpanded ? 'justify-center w-full' : ''}`}>
                  <Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-115" />
                  {isExpanded && (
                    <span className="truncate">
                      <span className="text-slate-400 font-mono text-[10px] mr-1.5 opacity-70">
                        {idx + 1}.
                      </span>
                      {item.label}
                    </span>
                  )}
                </div>

                {isExpanded && item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ml-1.5 shrink-0 ${
                      item.badge === 'Live'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : item.badge === 'AI'
                        ? 'bg-purple-600 text-white'
                        : item.badge === 'Audit'
                        ? 'bg-amber-500 text-slate-950'
                        : isCitizenRole && item.to.includes('notifications')
                        ? 'bg-rose-500 text-white'
                        : 'bg-teal-800 text-teal-100'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Collapsible Info Card */}
      {isExpanded ? (
        <div className="p-3.5 border-t border-slate-200/90 bg-gradient-to-b from-transparent to-slate-50/80">
          <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 card-pop">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                ProofLoop Engine
              </span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded font-mono">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Cryptographically verified evidence chain. Historical records are immutable.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-200 text-center">
          <ShieldCheck className="w-4 h-4 text-teal-600 mx-auto" />
        </div>
      )}
    </aside>
  );
};
