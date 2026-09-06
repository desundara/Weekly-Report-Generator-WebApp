import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "context/AuthContext";
import { ProtectedRoute } from "components/ProtectedRoute";
import Login from "pages/Login";
import Register from "pages/Register";
import Reports from "pages/Reports";

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
          {/* Day 4: /dashboard, /team/:userId, /review/:reportId, /projects, /users (ManagerRoute) */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
