import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "context/AuthContext";
import { ProtectedRoute, ManagerRoute } from "components/ProtectedRoute";
import Login from "pages/Login";
import Register from "pages/Register";
import Reports from "pages/Reports";
import ReportForm from "pages/ReportForm";
import ManagerReview from "pages/ManagerReview";
import Dashboard from "pages/Dashboard";
import ProjectsAdmin from "pages/ProjectsAdmin";
import UsersAdmin from "pages/UsersAdmin";
import TeamMemberProfile from "pages/TeamMemberProfile";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/new"
            element={
              <ProtectedRoute>
                <ReportForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/:id"
            element={
              <ProtectedRoute>
                <ReportForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review"
            element={
              <ManagerRoute>
                <ManagerReview />
              </ManagerRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ManagerRoute>
                <Dashboard />
              </ManagerRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ManagerRoute>
                <ProjectsAdmin />
              </ManagerRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ManagerRoute>
                <UsersAdmin />
              </ManagerRoute>
            }
          />
          <Route
            path="/team/:userId"
            element={
              <ManagerRoute>
                <TeamMemberProfile />
              </ManagerRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
