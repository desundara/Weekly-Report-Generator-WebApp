import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, AuthedRequest, canEditReportContent } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

export const reportsRouter = Router();
reportsRouter.use(authenticate);

const taskSchema = z.object({
  taskName: z.string().min(1),
  priority: z.string(),
  plannedPct: z.number().min(0).max(100),
  actualPct: z.number().min(0).max(100),
  status: z.string(),
  timePlanned: z.number().min(0),
  timeSpent: z.number().min(0),
  output: z.string().optional().default("")
});

const reportBodySchema = z.object({
  projectId: z.string(),
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  tasksCompleted: z.array(taskSchema),
  tasksPlanned: z.array(z.object({ description: z.string() })),
  blockers: z.array(z.object({ text: z.string(), isKey: z.boolean() })),
  achievements: z.array(z.object({ text: z.string(), isKey: z.boolean() })),
  hoursByType: z.record(z.number()).optional(),
  notes: z.string().optional()
});

// Create a new draft report — always owned by the requesting team member
reportsRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = reportBodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const report = await prisma.report.create({
    data: {
      userId: req.user!.id,
      projectId: parsed.data.projectId,
      weekStartDate: new Date(parsed.data.weekStartDate),
      weekEndDate: new Date(parsed.data.weekEndDate),
      status: "DRAFT",
      tasksCompleted: parsed.data.tasksCompleted,
      tasksPlanned: parsed.data.tasksPlanned,
      blockers: parsed.data.blockers,
      achievements: parsed.data.achievements,
      hoursByType: parsed.data.hoursByType,
      notes: parsed.data.notes
    }
  });
  res.status(201).json(report);
});

// List reports — team members see only their own; managers see everyone's,
// filterable by member/project/status/date range, with pagination.
reportsRouter.get("/", async (req: AuthedRequest, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Number(req.query.pageSize) || 10);

  const where: any = {};
  if (req.user!.role === "TEAM_MEMBER") {
    where.userId = req.user!.id; // team members can never see others' reports
  } else if (req.query.userId) {
    where.userId = String(req.query.userId);
  }
  if (req.query.projectId) where.projectId = String(req.query.projectId);
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.weekStart || req.query.weekEnd) {
    where.weekStartDate = {};
    if (req.query.weekStart) where.weekStartDate.gte = new Date(String(req.query.weekStart));
    if (req.query.weekEnd) where.weekStartDate.lte = new Date(String(req.query.weekEnd));
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: { user: { select: { id: true, name: true } }, project: { select: { id: true, name: true } } },
      orderBy: { weekStartDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.report.count({ where })
  ]);

  res.json({ reports, total, page, pageSize });
});

// Get a single report — owner or any manager
reportsRouter.get("/:id", async (req: AuthedRequest, res) => {
  const report = await prisma.report.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      reviewComments: { orderBy: { createdAt: "desc" } }
    }
  });
  if (!report) return res.status(404).json({ error: "Report not found" });

  if (req.user!.role === "TEAM_MEMBER" && report.userId !== req.user!.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.json(report);
});

// Edit report content — owner only, and only while it's editable
// (DRAFT or NEEDS_CORRECTION). A manager may never rewrite the content here.
reportsRouter.put("/:id", async (req: AuthedRequest, res) => {
  const existing = await prisma.report.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Report not found" });

  if (!canEditReportContent(req.user!, existing.userId)) {
    return res.status(403).json({ error: "Only the report's author can edit its content" });
  }
  if (!["DRAFT", "NEEDS_CORRECTION"].includes(existing.status)) {
    return res.status(409).json({ error: "This report is not editable in its current status" });
  }

  const parsed = reportBodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await prisma.report.update({
    where: { id: req.params.id },
    data: {
      projectId: parsed.data.projectId,
      weekStartDate: new Date(parsed.data.weekStartDate),
      weekEndDate: new Date(parsed.data.weekEndDate),
      tasksCompleted: parsed.data.tasksCompleted,
      tasksPlanned: parsed.data.tasksPlanned,
      blockers: parsed.data.blockers,
      achievements: parsed.data.achievements,
      hoursByType: parsed.data.hoursByType,
      notes: parsed.data.notes
    }
  });
  res.json(updated);
});

// Submit for review — snapshots the current content as a version (so
// history survives future edits), then flips status to SUBMITTED.
reportsRouter.post("/:id/submit", async (req: AuthedRequest, res) => {
  const report = await prisma.report.findUnique({ where: { id: req.params.id } });
  if (!report) return res.status(404).json({ error: "Report not found" });

  if (!canEditReportContent(req.user!, report.userId)) {
    return res.status(403).json({ error: "Only the report's author can submit it" });
  }
  if (!["DRAFT", "NEEDS_CORRECTION"].includes(report.status)) {
    return res.status(409).json({ error: "Only draft or needs-correction reports can be submitted" });
  }

  const [, updated] = await prisma.$transaction([
    prisma.reportVersion.create({
      data: {
        reportId: report.id,
        versionNumber: report.currentVersion,
        snapshot: {
          tasksCompleted: report.tasksCompleted,
          tasksPlanned: report.tasksPlanned,
          blockers: report.blockers,
          achievements: report.achievements,
          hoursByType: report.hoursByType,
          notes: report.notes
        } as any
      }
    }),
    prisma.report.update({
      where: { id: report.id },
      data: { status: "SUBMITTED", currentVersion: { increment: 1 } }
    })
  ]);

  res.json(updated);
});

// Version history for a report — owner or manager
reportsRouter.get("/:id/versions", async (req: AuthedRequest, res) => {
  const report = await prisma.report.findUnique({ where: { id: req.params.id } });
  if (!report) return res.status(404).json({ error: "Report not found" });
  if (req.user!.role === "TEAM_MEMBER" && report.userId !== req.user!.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const versions = await prisma.reportVersion.findMany({
    where: { reportId: req.params.id },
    orderBy: { versionNumber: "asc" }
  });
  res.json(versions);
});

const reviewSchema = z.object({
  action: z.enum(["APPROVED", "REQUESTED_CHANGES"]),
  comment: z.string().optional()
}).refine((data) => data.action === "APPROVED" || Boolean(data.comment?.trim()), {
  message: "A comment is required when requesting changes",
  path: ["comment"]
});

// Manager review action — approve or send back with one comment.
// Only ever touches status + comment fields, never the report's own content.
reportsRouter.post("/:id/review", requireRole(["MANAGER"]), async (req: AuthedRequest, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const report = await prisma.report.findUnique({ where: { id: req.params.id } });
  if (!report) return res.status(404).json({ error: "Report not found" });
  if (report.status !== "SUBMITTED") {
    return res.status(409).json({ error: "Only submitted reports can be reviewed" });
  }

  // the version just submitted is currentVersion - 1 (submit() snapshots
  // then increments currentVersion for the *next* submission cycle)
  const reviewedVersion = report.currentVersion - 1;

  const [, updated] = await prisma.$transaction([
    prisma.reviewComment.create({
      data: {
        reportId: report.id,
        managerId: req.user!.id,
        versionNumber: reviewedVersion,
        action: parsed.data.action,
        comment: parsed.data.comment ?? null
      }
    }),
    prisma.report.update({
      where: { id: report.id },
      data: { status: parsed.data.action === "APPROVED" ? "APPROVED" : "NEEDS_CORRECTION" }
    })
  ]);

  res.json(updated);
});
