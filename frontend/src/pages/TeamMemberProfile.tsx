import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { api } from "lib/api";
import { Report } from "lib/types";
import { StatusPill } from "components/StatusPill";
import { ManagerNav } from "components/ManagerNav";
import { PageLoader } from "components/PageLoader";

export default function TeamMemberProfile() {
  const { userId } = useParams();
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/api/reports?userId=${userId}&pageSize=50`, { token })
      .then((data) => setReports(data.reports))
      .finally(() => setLoading(false));
  }, [userId, token]);

  const memberName = reports[0]?.user?.name ?? "Team member";
  const approved = reports.filter((r) => r.status === "APPROVED").length;
  const needsCorrection = reports.filter((r) => r.status === "NEEDS_CORRECTION").length;
  const totalTasks = reports.reduce((sum, r) => sum + (r.tasksCompleted?.length ?? 0), 0);

  if (loading) return <PageLoader message="Loading member profile…" />;

  return (
    <main className="max-w-4xl min-h-screen p-4 mx-auto space-y-6 md:p-8">
      <ManagerNav />

      <div>
        <h1 className="text-xl font-semibold">{memberName}</h1>
        <p className="text-sm text-text-muted">Full report history and stats</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 glass-panel">
          <p className="text-sm text-text-muted">Reports approved</p>
          <p className="mt-1 text-2xl font-semibold font-display text-status-approved">{approved}</p>
        </div>
        <div className="p-4 glass-panel">
          <p className="text-sm text-text-muted">Needs correction</p>
          <p className="mt-1 text-2xl font-semibold font-display text-status-correction">{needsCorrection}</p>
        </div>
        <div className="p-4 glass-panel">
          <p className="text-sm text-text-muted">Tasks completed (all time)</p>
          <p className="mt-1 text-2xl font-semibold font-display">{totalTasks}</p>
        </div>
      </div>

      <div className="divide-y glass-panel divide-glass-border">
        {reports.map((r) => (
          <Link
            key={r.id}
            to={`/reports/${r.id}`}
            className="flex items-center justify-between p-4 transition-colors hover:bg-glass-fill"
          >
            <div>
              <p className="font-medium">Week of {new Date(r.weekStartDate).toLocaleDateString()}</p>
              <p className="text-sm text-text-muted">{r.project?.name}</p>
            </div>
            <StatusPill status={r.status} />
          </Link>
        ))}
      </div>
    </main>
  );
}