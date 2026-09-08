import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { useAuth } from "context/AuthContext";
import { api } from "lib/api";
import { ManagerNav } from "components/ManagerNav";
import { renderInlineMarkdown } from "lib/markdown";
import { PageLoader } from "components/PageLoader";

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
    <div className="p-4 glass-panel">
      <p className="text-sm text-text-muted">{label}</p>
      <p className={`text-3xl font-display font-semibold mt-1 ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    api("/api/dashboard", { token }).then(setData).catch(() => {});
  }, [token]);

  async function generateSummary() {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await api("/api/ai/summary", { method: "POST", token });
      setSummary(res.summary);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : "Could not generate a summary.");
    } finally {
      setSummaryLoading(false);
    }
  }

  if (!data) {
    return <PageLoader message="Loading dashboard…" />;
  }

  const hoursData = Object.entries(data.hoursByType).map(([type, hours]) => ({ type, hours }));

  return (
    <main className="max-w-6xl min-h-screen p-4 mx-auto space-y-6 md:p-8">
      <ManagerNav />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Submitted this week" value={data.summary.totalSubmittedThisWeek} accent="text-status-submitted" />
        <MetricCard label="Pending this week" value={data.summary.pendingThisWeek} accent="text-status-draft" />
        <MetricCard label="Needs correction" value={data.summary.needsCorrectionCount} accent="text-status-correction" />
        <MetricCard label="Open blockers" value={data.summary.openBlockersCount} accent="text-status-blocker" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="p-4 glass-panel">
          <h2 className="mb-3 text-lg font-medium">Tasks completed trend</h2>
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

        <section className="p-4 glass-panel">
          <h2 className="mb-3 text-lg font-medium">Workload by project</h2>
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

        <section className="p-4 glass-panel">
          <h2 className="mb-3 text-lg font-medium">Submission status by team member (this week)</h2>
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

        <section className="p-4 glass-panel">
          <h2 className="mb-3 text-lg font-medium">Time spent by task type (team-wide)</h2>
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

      <section className="p-4 glass-panel border-accent-cyan/30">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">AI team summary</h2>
          <button onClick={generateSummary} disabled={summaryLoading} className="text-sm btn-primary">
            {summaryLoading ? "Generating…" : summary ? "Regenerate" : "Generate summary"}
          </button>
        </div>
        {summaryError && <p className="text-sm text-status-blocker">{summaryError}</p>}
        {summary ? (
          <p className="text-sm leading-relaxed whitespace-pre-line text-text-muted">{renderInlineMarkdown(summary)}</p>
        ) : (
          !summaryLoading && <p className="text-sm text-text-faint">Generate a summary of completed work, recurring blockers, and workload balance across the team.</p>
        )}
      </section>

      <section className="p-4 glass-panel">
        <h2 className="mb-3 text-lg font-medium">Recent activity</h2>
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-text-muted">No review activity yet.</p>
        ) : (
          <div className="space-y-2">
            {data.recentActivity.map((a) => (
              <Link
                key={a.id}
                to={`/reports/${a.reportId}`}
                className="flex items-center justify-between p-2 text-sm transition-colors rounded-lg hover:bg-glass-fill"
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