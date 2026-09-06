import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

export const dashboardRouter = Router();
dashboardRouter.use(authenticate, requireRole(["MANAGER"]));

dashboardRouter.get("/", async (_req, res) => {
  const [allReports, teamMembers, reviewComments] = await Promise.all([
    prisma.report.findMany({
      include: { user: { select: { id: true, name: true } }, project: { select: { id: true, name: true } } },
      orderBy: { weekStartDate: "asc" }
    }),
    prisma.user.findMany({ where: { role: "TEAM_MEMBER" }, select: { id: true, name: true } }),
    prisma.reviewComment.findMany({
      include: {
        report: { select: { id: true, weekStartDate: true, user: { select: { name: true } } } },
        manager: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  // "this week" = the most recent weekStartDate present in the data
  const weekKeys = allReports.map((r) => r.weekStartDate.toISOString().slice(0, 10));
  const latestWeek = weekKeys.length ? weekKeys.sort().at(-1)! : null;
  const thisWeekReports = allReports.filter((r) => r.weekStartDate.toISOString().slice(0, 10) === latestWeek);

  const submittedThisWeek = thisWeekReports.filter((r) => r.status !== "DRAFT").length;
  const pendingThisWeek = teamMembers.length - submittedThisWeek;
  const needsCorrectionCount = allReports.filter((r) => r.status === "NEEDS_CORRECTION").length;
  const openBlockersCount = thisWeekReports.reduce(
    (sum, r) => sum + (Array.isArray(r.blockers) ? (r.blockers as any[]).length : 0),
    0
  );

  // tasks completed trend, team-wide, one point per distinct week
  const trendMap = new Map<string, number>();
  for (const r of allReports) {
    const key = r.weekStartDate.toISOString().slice(0, 10);
    const count = Array.isArray(r.tasksCompleted) ? (r.tasksCompleted as any[]).length : 0;
    trendMap.set(key, (trendMap.get(key) ?? 0) + count);
  }
  const taskTrend = [...trendMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([week, count]) => ({ week, count }));

  // submission status by team member, for the latest week
  const statusByMember = teamMembers.map((m) => {
    const report = thisWeekReports.find((r) => r.userId === m.id);
    return { member: m.name, status: report?.status ?? "NOT_STARTED" };
  });

  // workload by project — total tasks completed, all time
  const projectMap = new Map<string, number>();
  for (const r of allReports) {
    const count = Array.isArray(r.tasksCompleted) ? (r.tasksCompleted as any[]).length : 0;
    projectMap.set(r.project.name, (projectMap.get(r.project.name) ?? 0) + count);
  }
  const workloadByProject = [...projectMap.entries()].map(([project, taskCount]) => ({ project, taskCount }));

  // hours by type, aggregated across all reports
  const hoursByType: Record<string, number> = {};
  for (const r of allReports) {
    const hours = (r.hoursByType as Record<string, number>) ?? {};
    for (const [type, val] of Object.entries(hours)) {
      hoursByType[type] = (hoursByType[type] ?? 0) + (Number(val) || 0);
    }
  }

  const recentActivity = reviewComments.map((c) => ({
    id: c.id,
    action: c.action,
    comment: c.comment,
    createdAt: c.createdAt,
    reportId: c.report.id,
    memberName: c.report.user.name,
    managerName: c.manager.name
  }));

  res.json({
    summary: {
      totalSubmittedThisWeek: submittedThisWeek,
      pendingThisWeek: Math.max(0, pendingThisWeek),
      needsCorrectionCount,
      openBlockersCount
    },
    taskTrend,
    statusByMember,
    workloadByProject,
    hoursByType,
    recentActivity
  });
});
