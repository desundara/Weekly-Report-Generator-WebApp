import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { useAuth } from "context/AuthContext";
import { api } from "lib/api";
import { ManagerNav } from "components/ManagerNav";

type DashboardData = {
  summary: {
    totalSubmittedThisWeek: number;
    pendingThisWeek: number;
    needsCorrectionCount: number;
    openBlockersCount: number;
  };
  taskTrend: { week: string; count: number }[];
  statusByMember: { member: string; status: string }[];
  workloadByProject: { project: string; taskCount: number }[];
  hoursByType: Record<string, number>;
  recentActivity: {
    id: string;
    action: string;
    comment: string | null;
    createdAt: string;
    reportId: string;
    memberName: string;
    managerName: string;
  }[];
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "#6B7280",
  SUBMITTED: "#60A5FA",
  NEEDS_CORRECTION: "#FBBF24",
  APPROVED: "#34D399",
  NOT_STARTED: "#3A4155"
};

function MetricCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="glass-panel p-4">
      <p className="text-text-muted text-sm">{label}</p>
      <p className={`text-3xl font-display font-semibold mt-1 ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api("/api/dashboard", { token }).then(setData).catch(() => {});
  }, [token]);

  if (!data) {
    return (
      <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
        <ManagerNav />
        <p className="text-text-muted text-sm">Loading dashboard…</p>
      </main>
    );
  }

  const hoursData = Object.entries(data.hoursByType).map(([type, hours]) => ({ type, hours }));

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <ManagerNav />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Submitted this week" value={data.summary.totalSubmittedThisWeek} accent="text-status-submitted" />
        <MetricCard label="Pending this week" value={data.summary.pendingThisWeek} accent="text-status-draft" />
        <MetricCard label="Needs correction" value={data.summary.needsCorrectionCount} accent="text-status-correction" />
        <MetricCard label="Open blockers" value={data.summary.openBlockersCount} accent="text-status-blocker" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="glass-panel p-4">
          <h2 className="text-lg font-medium mb-3">Tasks completed trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.taskTrend}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="week" stroke="#8B93A8" fontSize={12} />
              <YAxis stroke="#8B93A8" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#151C33", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="count" stroke="#7C5CFF" strokeWidth={2} dot={{ fill: "#22D3EE" }} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="glass-panel p-4">
          <h2 className="text-lg font-medium mb-3">Workload by project</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.workloadByProject}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="project" stroke="#8B93A8" fontSize={12} />
              <YAxis stroke="#8B93A8" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#151C33", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Bar dataKey="taskCount" fill="#7C5CFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="glass-panel p-4">
          <h2 className="text-lg font-medium mb-3">Submission status by team member (this week)</h2>
          <div className="space-y-2">
            {data.statusByMember.map((s) => (
              <div key={s.member} className="flex items-center justify-between text-sm">
                <span>{s.member}</span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLOR[s.status] }} />
                  <span className="text-text-muted">{s.status.replace("_", " ").toLowerCase()}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel p-4">
          <h2 className="text-lg font-medium mb-3">Time spent by task type (team-wide)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hoursData} layout="vertical">
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis type="number" stroke="#8B93A8" fontSize={12} />
              <YAxis type="category" dataKey="type" stroke="#8B93A8" fontSize={12} width={90} />
              <Tooltip contentStyle={{ background: "#151C33", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Bar dataKey="hours" radius={[0, 6, 6, 0]}>
                {hoursData.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? "#7C5CFF" : "#22D3EE"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="glass-panel p-4">
        <h2 className="text-lg font-medium mb-3">Recent activity</h2>
        {data.recentActivity.length === 0 ? (
          <p className="text-text-muted text-sm">No review activity yet.</p>
        ) : (
          <div className="space-y-2">
            {data.recentActivity.map((a) => (
              <Link
                key={a.id}
                to={`/reports/${a.reportId}`}
                className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-glass-fill transition-colors"
              >
                <span>
                  <span className={a.action === "APPROVED" ? "text-status-approved" : "text-status-correction"}>
                    {a.action === "APPROVED" ? "Approved" : "Sent back"}
                  </span>{" "}
                  {a.memberName}'s report — {a.managerName}
                </span>
                <span className="text-text-faint">{new Date(a.createdAt).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
