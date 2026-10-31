import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const getRoleHomePath = (role?: Role): string => {
  switch (role) {
    case 'citizen':
      return '/citizen';
    case 'field_worker':
      return '/worker';
    case 'administrator':
      return '/admin';
    case 'engineer':
    default:
      return '/dashboard';
  }
};

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Verifying municipal role permissions...</p>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If specific roles required and user role is not authorized -> redirect to their authorized role home
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const safeHome = getRoleHomePath(user.role);
    console.warn(`[RBAC] Access denied to ${location.pathname} for role "${user.role}". Redirecting to ${safeHome}`);
    return <Navigate to={safeHome} replace />;
  }

  return <>{children}</>;
};
