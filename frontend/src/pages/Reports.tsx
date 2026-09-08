import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { api } from "lib/api";
import { Report } from "lib/types";
import { StatusPill } from "components/StatusPill";
import { PageLoader } from "components/PageLoader";

export default function Reports() {
  const { user, token, logout } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "MANAGER") return;
    api("/api/reports", { token })
      .then((data) => setReports(data.reports))
      .finally(() => setLoading(false));
  }, [token, user]);

  if (user?.role === "MANAGER") return <Navigate to="/dashboard" replace />;
  if (loading) return <PageLoader message="Loading your reports…" />;

  return (
    <main className="max-w-4xl min-h-screen p-4 mx-auto md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Welcome, {user?.name}</h1>
          <p className="mt-1 text-sm text-text-muted">
            Signed in as <span className="status-pill submitted">{user?.role}</span>
          </p>
        </div>
        <button onClick={logout} className="btn-ghost">Sign out</button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Your weekly reports</h2>
        <Link to="/reports/new" className="btn-primary">+ New report</Link>
      </div>

      {reports.length === 0 ? (
        <div className="p-6 text-sm text-center glass-panel text-text-muted">
          No reports yet — create your first weekly report.
        </div>
      ) : (
        <div className="divide-y glass-panel divide-glass-border">
          {reports.map((r) => (
            <Link
              key={r.id}
              to={`/reports/${r.id}`}
              className="flex items-center justify-between p-4 transition-colors hover:bg-glass-fill"
            >
              <div>
                <p className="font-medium">
                  Week of {new Date(r.weekStartDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-text-muted">{r.project?.name}</p>
              </div>
              <StatusPill status={r.status} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}