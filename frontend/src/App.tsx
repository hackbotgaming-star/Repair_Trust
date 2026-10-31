import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { RoleProtectedRoute, getRoleHomePath } from './components/common/RoleProtectedRoute';

import { PublicHomePage } from './pages/PublicHomePage';
import { CitizenPortalPage } from './pages/CitizenPortalPage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { PublicComplaintTrackPage } from './pages/PublicComplaintTrackPage';
import { PublicInfrastructureMapPage } from './pages/PublicInfrastructureMapPage';
import { PublicTransparencyPage } from './pages/PublicTransparencyPage';
import { CitizenNotificationsPage } from './pages/CitizenNotificationsPage';
import { CitizenDisputePage } from './pages/CitizenDisputePage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { CitizenProfilePage } from './pages/CitizenProfilePage';

import { FieldWorkerHomePage } from './pages/FieldWorkerHomePage';
import { WorkerTasksPage } from './pages/WorkerTasksPage';
import { WorkerTaskDetailPage } from './pages/WorkerTaskDetailPage';
import { WorkerSiteInspectionPage } from './pages/WorkerSiteInspectionPage';
import { WorkerLiveWorkProofPage } from './pages/WorkerLiveWorkProofPage';
import { WorkerPhotosPage } from './pages/WorkerPhotosPage';
import { WorkerMaterialsNotesPage } from './pages/WorkerMaterialsNotesPage';
import { WorkerLocationCheckInPage } from './pages/WorkerLocationCheckInPage';
import { WorkerHistoryPage } from './pages/WorkerHistoryPage';
import { WorkerNotificationsPage } from './pages/WorkerNotificationsPage';
import { WorkerProfilePage } from './pages/WorkerProfilePage';

import { OverviewPage } from './pages/OverviewPage';
import { AssetsPage } from './pages/AssetsPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';
import { WorkOrderDetailPage } from './pages/WorkOrderDetailPage';
import { LiveWorkProofPage } from './pages/LiveWorkProofPage';
import { AssetMemoryGraphPage } from './pages/AssetMemoryGraphPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { InspectionsPage } from './pages/InspectionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { UsersSettingsPage } from './pages/UsersSettingsPage';
import { EvidenceGapEnginePage } from './pages/EvidenceGapEnginePage';
import { ClosureAuditorPage } from './pages/ClosureAuditorPage';
import { ReportsExportPage } from './pages/ReportsExportPage';
import { EngineerNotificationsPage } from './pages/EngineerNotificationsPage';
import { EngineerProfileSettingsPage } from './pages/EngineerProfileSettingsPage';
import { EngineerMapViewPage } from './pages/EngineerMapViewPage';

import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminUsersRolesPage } from './pages/admin/AdminUsersRolesPage';
import { AdminDepartmentsWardsPage } from './pages/admin/AdminDepartmentsWardsPage';
import { AdminAssetConfigPage } from './pages/admin/AdminAssetConfigPage';
import { AdminEvidenceRulesPage } from './pages/admin/AdminEvidenceRulesPage';
import { AdminComplaintSettingsPage } from './pages/admin/AdminComplaintSettingsPage';
import { AdminAiSettingsPage } from './pages/admin/AdminAiSettingsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminDataQualityPage } from './pages/admin/AdminDataQualityPage';
import { AdminSystemHealthPage } from './pages/admin/AdminSystemHealthPage';
import { AdminTransparencyPage } from './pages/admin/AdminTransparencyPage';
import { AdminSecurityPage } from './pages/admin/AdminSecurityPage';
import { AdminBackupPage } from './pages/admin/AdminBackupPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { LoginPage } from './pages/LoginPage';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isLandingOrAuthPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signin';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar />
      <div className="flex flex-1">
        {!isLandingOrAuthPage && user && <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {/* Public Landing & Authentication */}
            <Route path="/" element={<PublicHomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signin" element={<LoginPage />} />

            {/* Public Access Features */}
            <Route path="/track" element={<PublicComplaintTrackPage />} />
            <Route path="/track/:id" element={<PublicComplaintTrackPage />} />
            <Route path="/transparency" element={<PublicTransparencyPage />} />
            <Route path="/citizen/transparency" element={<PublicTransparencyPage />} />
            <Route path="/map" element={<PublicInfrastructureMapPage />} />
            <Route path="/citizen/map" element={<PublicInfrastructureMapPage />} />

            {/* 9 Explicit Citizen Role Routes (Citizen Only) */}
            <Route
              path="/citizen"
              element={
                <RoleProtectedRoute allowedRoles={['citizen']}>
                  <CitizenPortalPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/citizen-portal"
              element={
                <RoleProtectedRoute allowedRoles={['citizen']}>
                  <CitizenPortalPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <RoleProtectedRoute allowedRoles={['citizen']}>
                  <ReportIssuePage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/citizen/notifications"
              element={
                <RoleProtectedRoute allowedRoles={['citizen']}>
                  <CitizenNotificationsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/citizen/dispute"
              element={
                <RoleProtectedRoute allowedRoles={['citizen']}>
                  <CitizenDisputePage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dispute"
              element={
                <RoleProtectedRoute allowedRoles={['citizen']}>
                  <CitizenDisputePage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/citizen/my-complaints"
              element={
                <RoleProtectedRoute allowedRoles={['citizen']}>
                  <MyComplaintsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/citizen/profile"
              element={
                <RoleProtectedRoute allowedRoles={['citizen']}>
                  <CitizenProfilePage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/citizen/privacy"
              element={
                <RoleProtectedRoute allowedRoles={['citizen']}>
                  <CitizenProfilePage />
                </RoleProtectedRoute>
              }
            />

            {/* 11 Explicit Field Worker Role Routes (Field Worker Only) */}
            <Route
              path="/worker"
              element={
                <RoleProtectedRoute allowedRoles={['field_worker']}>
                  <FieldWorkerHomePage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/worker-portal"
              element={
                <RoleProtectedRoute allowedRoles={['field_worker']}>
                  <FieldWorkerHomePage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/worker/tasks"
              element={
                <RoleProtectedRoute allowedRoles={['field_worker']}>
                  <WorkerTasksPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/worker/work-order"
              element={
                <RoleProtectedRoute allowedRoles={['field_worker']}>
                  <WorkerTaskDetailPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/worker/tasks/:id"
              element={
                <RoleProtectedRoute allowedRoles={['field_worker']}>
                  <WorkerTaskDetailPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/worker/inspection"
              element={
                <RoleProtectedRoute allowedRoles={['field_worker']}>
                  <WorkerSiteInspectionPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/worker/inspection/:id"
              element={
                <RoleProtectedRoute allowedRoles={['field_worker']}>
                  <WorkerSiteInspectionPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/worker/livework"
              element={
                <RoleProtectedRoute allowedRoles={['field_worker']}>
                  <WorkerLiveWorkProofPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/worker/photos"
              element={
                <RoleProtectedRoute allowedRoles={['field_worker']}>
                  <WorkerPhotosPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/worker/materials"
              element={
                <RoleProtectedRoute allowedRoles={['field_worker']}>
                  <WorkerMaterialsNotesPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/worker/check-in"
              element={
                <RoleProtectedRoute allowedRoles={['field_worker']}>
                  <WorkerLocationCheckInPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/worker/location"
              element={
                <RoleProtectedRoute allowedRoles={['field_worker']}>
                  <WorkerLocationCheckInPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/worker/history"
              element={
                <RoleProtectedRoute allowedRoles={['field_worker']}>
                  <WorkerHistoryPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/worker/notifications"
              element={
                <RoleProtectedRoute allowedRoles={['field_worker']}>
                  <WorkerNotificationsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/worker/profile"
              element={
                <RoleProtectedRoute allowedRoles={['field_worker']}>
                  <WorkerProfilePage />
                </RoleProtectedRoute>
              }
            />

            {/* 15 Explicit Municipal Engineer Role Routes (Engineer Only) */}
            <Route
              path="/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <OverviewPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/overview"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <OverviewPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/assets"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <AssetsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/complaints"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <ComplaintsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/work-orders"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <WorkOrdersPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/work-orders/:workOrderId"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <WorkOrderDetailPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/livework"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <LiveWorkProofPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/memory-graph"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <AssetMemoryGraphPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/investigations"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <InvestigationsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/evidence-gap"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <EvidenceGapEnginePage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/inspections"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <InspectionsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/closure-auditor"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <ClosureAuditorPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <AnalyticsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/engineer/map"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <EngineerMapViewPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <ReportsExportPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/engineer/notifications"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <EngineerNotificationsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/engineer/profile"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <EngineerProfileSettingsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <RoleProtectedRoute allowedRoles={['engineer']}>
                  <EngineerProfileSettingsPage />
                </RoleProtectedRoute>
              }
            />

            {/* 14 Explicit Administrator Role Routes (Administrator Only) */}
            <Route
              path="/admin"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <AdminOverviewPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/overview"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <AdminOverviewPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <AdminUsersRolesPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/departments-wards"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <AdminDepartmentsWardsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/asset-config"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <AdminAssetConfigPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/evidence-rules"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <AdminEvidenceRulesPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/complaint-settings"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <AdminComplaintSettingsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/ai-settings"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <AdminAiSettingsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <AdminAuditLogsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/data-quality"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <AdminDataQualityPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/system-health"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <AdminSystemHealthPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/transparency"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <AdminTransparencyPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/security"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <AdminSecurityPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/backup"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <AdminBackupPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <RoleProtectedRoute allowedRoles={['administrator']}>
                  <AdminProfilePage />
                </RoleProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
