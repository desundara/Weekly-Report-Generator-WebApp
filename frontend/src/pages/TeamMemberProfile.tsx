import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { api } from "lib/api";
import { Report } from "lib/types";
import { StatusPill } from "components/StatusPill";
import { ManagerNav } from "components/ManagerNav";

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

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <ManagerNav />

      <div>
        <h1 className="text-xl font-semibold">{memberName}</h1>
        <p className="text-text-muted text-sm">Full report history and stats</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel p-4">
          <p className="text-text-muted text-sm">Reports approved</p>
          <p className="text-2xl font-display font-semibold text-status-approved mt-1">{approved}</p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-text-muted text-sm">Needs correction</p>
          <p className="text-2xl font-display font-semibold text-status-correction mt-1">{needsCorrection}</p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-text-muted text-sm">Tasks completed (all time)</p>
          <p className="text-2xl font-display font-semibold mt-1">{totalTasks}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-text-muted text-sm">Loading…</p>
      ) : (
        <div className="glass-panel divide-y divide-glass-border">
          {reports.map((r) => (
            <Link
              key={r.id}
              to={`/reports/${r.id}`}
              className="flex items-center justify-between p-4 hover:bg-glass-fill transition-colors"
            >
              <div>
                <p className="font-medium">Week of {new Date(r.weekStartDate).toLocaleDateString()}</p>
                <p className="text-text-muted text-sm">{r.project?.name}</p>
              </div>
              <StatusPill status={r.status} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
