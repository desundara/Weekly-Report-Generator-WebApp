import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { api } from "lib/api";
import { Report, Project } from "lib/types";
import { StatusPill } from "components/StatusPill";
import { ManagerNav } from "components/ManagerNav";
import { PageLoader } from "components/PageLoader";

type TeamMember = { id: string; name: string };

export default function ManagerReview() {
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("SUBMITTED");
  const [memberFilter, setMemberFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ status: "SUBMITTED", pageSize: "50" });
    Promise.all([
      api("/api/projects", { token }),
      api("/api/users", { token }),
      api(`/api/reports?${params.toString()}`, { token })
    ])
      .then(([projectsData, membersData, reportsData]) => {
        setProjects(projectsData);
        setMembers(membersData);
        setReports(reportsData.reports);
      })
      .finally(() => setInitialLoading(false));
  }, [token]);

  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setReportsLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (memberFilter) params.set("userId", memberFilter);
    if (projectFilter) params.set("projectId", projectFilter);
    params.set("pageSize", "50");

    api(`/api/reports?${params.toString()}`, { token })
      .then((data) => setReports(data.reports))
      .finally(() => setReportsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, memberFilter, projectFilter]);

  if (initialLoading) return <PageLoader message="Loading review queue…" />;

  return (
    <main className="max-w-5xl min-h-screen p-4 mx-auto md:p-8">
      <ManagerNav />

      <h1 className="mb-4 text-xl font-semibold">Review queue</h1>

      <div className="grid grid-cols-1 gap-3 p-4 mb-4 glass-panel md:grid-cols-3">
        <div>
          <label className="block text-sm text-text-muted mb-1.5">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-glass">
            <option value="">All</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="NEEDS_CORRECTION">Needs Correction</option>
            <option value="APPROVED">Approved</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1.5">Team member</label>
          <select value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)} className="input-glass">
            <option value="">All members</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1.5">Project</label>
          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="input-glass">
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {reportsLoading ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : reports.length === 0 ? (
        <div className="p-6 text-sm text-center glass-panel text-text-muted">
          No reports match these filters.
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
                <p className="font-medium">{r.user?.name} — Week of {new Date(r.weekStartDate).toLocaleDateString()}</p>
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