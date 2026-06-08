import { BrowserRouter, Routes, Route } from "react-router";

import Home from "./pages/public/Home";
import SubmitListing from "./pages/public/SubmitListing";
import CheckStatus from "./pages/public/CheckStatus";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminReports from "./pages/admin/AdminReports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/submit-listing" element={<SubmitListing />} />
        <Route path="/check-status" element={<CheckStatus />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/reports"
          element={
            <ProtectedAdminRoute>
              <AdminReports />
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