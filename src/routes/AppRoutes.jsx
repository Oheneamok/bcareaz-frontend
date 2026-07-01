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
import BHPPage from "../pages/BHPPage";
import ClinicalTeamPage from "../pages/ClinicalTeamPage";
import DieticianPage from "../pages/DieticianPage";
import ResidentSignInOutPage from "../pages/ResidentSignInOutPage";
import VisitorSignInOutPage from "../pages/VisitorSignInOutPage";
import VehicleTransportPage from "../pages/VehicleTransportPage";
import FacilityOperationsCenterPage from "../pages/FacilityOperationsCenterPage";
import FacilityRegulatoryCompliancePage from "../pages/FacilityRegulatoryCompliancePage";
import OperationsDashboardPage from "../pages/OperationsDashboardPage";
import MedicationCenterPage from "../pages/MedicationCenterPage";
import ResidentProgressNotesPage from "../pages/ResidentProgressNotesPage";  ResidentGroupNotesPage
import ResidentGroupNotesPage from "../pages/ResidentGroupNotesPage"; 
import ResidentHourlyLogsPage from "../pages/ResidentHourlyLogsPage";

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
		<Route path="/bhp" element={<BHPPage />} />
		<Route path="/clinical-team" element={<ClinicalTeamPage />} />
		<Route path="/dietician" element={<DieticianPage />} />
	
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
		<Route
          path="/facility-compliance/resident-sign-logs"
          element={<ResidentSignInOutPage />}
        />
		<Route
          path="/facility-compliance/visitor-logs"
          element={<VisitorSignInOutPage />}
        />
		<Route
          path="/facility-compliance/transport-logs"
          element={<VehicleTransportPage />}
        />
		<Route
          path="/facility-compliance/facility-maintenance-logs"
          element={<FacilityOperationsCenterPage/>}
        />
		<Route
          path="/facility-compliance/facility-compliance"
          element={<FacilityRegulatoryCompliancePage/>}
        />
		<Route
          path="/facility-compliance/operations-dashboard"
          element={<OperationsDashboardPage/>}
        />
	    <Route
          path="/resident-care/medications"
          element={<MedicationCenterPage/>}
        />
		<Route
          path="/resident-care/progress-notes"
          element={<ResidentProgressNotesPage/>}
        />
		<Route
          path="/resident-care/group-notes"
          element={<ResidentGroupNotesPage/>}
        />
		<Route
          path="/resident-care/resident-activity-logs"
          element={<ResidentHourlyLogsPage/>}
        />
		
      </Route>

      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  );
}