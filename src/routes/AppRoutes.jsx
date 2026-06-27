import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ResidentsPage from "../pages/ResidentsPage";
import ResidentDetailPage from "../pages/ResidentDetailPage";
import StaffPage from "../pages/StaffPage";
import StaffDetailPage from "../pages/StaffDetailPage";
import CalendarPage from "../pages/CalendarPage";
import TasksPage from "../pages/TasksPage";
import CompliancePage from "../pages/CompliancePage";
import DocumentsPage from "../pages/DocumentsPage";
import NotificationsPage from "../pages/NotificationsPage";

import PortalHomePage from "../pages/PortalHomePage";
import FacilityComplianceLogsPage from "../pages/FacilityComplianceLogsPage";
import FacilityGroupNotesAuditPage from "../pages/FacilityGroupNotesAuditPage";
import FacilityProgressNoteAuditPage from "../pages/FacilityProgressNoteAuditPage";
import ResidentCarePage from "../pages/ResidentCarePage";
import OperationsCenterPage from "../pages/OperationsCenterPage";
import NursingPage from "../pages/NursingPage";


function ProtectedRoute({ children }) {
  const token = localStorage.getItem("bcareaz_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("bcareaz_token");

  if (token) {
    return <Navigate to="/portal" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/portal" replace />} />
        <Route path="/portal" element={<PortalHomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/residents" element={<ResidentsPage />} />
        <Route path="/residents/:residentId" element={<ResidentDetailPage />} />

        <Route path="/staff" element={<StaffPage />} />
        <Route path="/staff/:staffId" element={<StaffDetailPage />} />

        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/compliance" element={<CompliancePage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
		<Route path="/resident-care" element={<ResidentCarePage />} />
		<Route path="/operations-center" element={<OperationsCenterPage />} />
		<Route path="/nursing" element={<NursingPage />} />
	
        <Route
          path="/facility-compliance/logs"
          element={<FacilityComplianceLogsPage />}
        />
        <Route
          path="/facility-compliance/group-notes-audit"
          element={<FacilityGroupNotesAuditPage />}
        />
        <Route
          path="/facility-compliance/progress-note-audit"
          element={<FacilityProgressNoteAuditPage />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  );
}