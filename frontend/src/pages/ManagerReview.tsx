import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { api } from "lib/api";
import { Report, Project } from "lib/types";
import { StatusPill } from "components/StatusPill";
import { ManagerNav } from "components/ManagerNav";

type TeamMember = { id: string; name: string };

export default function ManagerReview() {
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("SUBMITTED");
  const [memberFilter, setMemberFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  useEffect(() => {
    api("/api/projects", { token }).then(setProjects).catch(() => {});
    api("/api/users", { token }).then(setMembers).catch(() => {});
  }, [token]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (memberFilter) params.set("userId", memberFilter);
    if (projectFilter) params.set("projectId", projectFilter);
    params.set("pageSize", "50");

    api(`/api/reports?${params.toString()}`, { token })
      .then((data) => setReports(data.reports))
      .finally(() => setLoading(false));
  }, [token, statusFilter, memberFilter, projectFilter]);

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <ManagerNav />

      <h1 className="text-xl font-semibold mb-4">Review queue</h1>

      <div className="glass-panel p-4 grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
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

      {loading ? (
        <p className="text-text-muted text-sm">Loading…</p>
      ) : reports.length === 0 ? (
        <div className="glass-panel p-6 text-center text-text-muted text-sm">
          No reports match these filters.
        </div>
      ) : (
        <div className="glass-panel divide-y divide-glass-border">
          {reports.map((r) => (
            <Link
              key={r.id}
              to={`/reports/${r.id}`}
              className="flex items-center justify-between p-4 hover:bg-glass-fill transition-colors"
            >
              <div>
                <p className="font-medium">{r.user?.name} — Week of {new Date(r.weekStartDate).toLocaleDateString()}</p>
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
