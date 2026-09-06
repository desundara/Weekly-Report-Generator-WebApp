import { Navigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function ManagerRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "MANAGER") return <Navigate to="/reports" replace />;
  return <>{children}</>;
}
