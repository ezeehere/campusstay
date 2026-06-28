import { BrowserRouter, Routes, Route } from "react-router";

import RoleRedirect from "./components/common/RoleRedirect";
import SubmitListing from "./pages/public/SubmitListing";
import CheckStatus from "./pages/public/CheckStatus";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminReports from "./pages/admin/AdminReports";
import ProtectedStudentRoute from "./components/student/ProtectedStudentRoute";
import StudentLogin from "./pages/student/StudentLogin";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentSavedListings from "./pages/student/StudentSavedListings";
import ProtectedOwnerRoute from "./components/owner/ProtectedOwnerRoute";
import OwnerLogin from "./pages/owner/OwnerLogin";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import AdminCustomers from "./pages/admin/AdminCustomers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/submit-listing" element={<SubmitListing />} />
        <Route path="/check-status" element={<CheckStatus />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/student/login" element={<StudentLogin />} />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedStudentRoute>
              <StudentDashboard />
            </ProtectedStudentRoute>
          }
        />
        <Route
          path="/student/saved"
          element={
            <ProtectedStudentRoute>
              <StudentSavedListings />
            </ProtectedStudentRoute>
          }
        />

        <Route path="/owner/login" element={<OwnerLogin />} />

        <Route
          path="/owner/dashboard"
          element={
            <ProtectedOwnerRoute>
              <OwnerDashboard />
            </ProtectedOwnerRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedAdminRoute>
              <AdminReports />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedAdminRoute>
              <AdminCustomers />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;