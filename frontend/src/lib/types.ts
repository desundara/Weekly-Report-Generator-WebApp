export type Task = {
  taskName: string;
  priority: string;
  plannedPct: number;
  actualPct: number;
  status: string;
  timePlanned: number;
  timeSpent: number;
  output: string;
};

export type PlannedTask = { description: string };
export type FlaggedNote = { text: string; isKey: boolean };

export type ReportStatus = "DRAFT" | "SUBMITTED" | "NEEDS_CORRECTION" | "APPROVED";

export type Project = { id: string; name: string; description?: string | null };

export type Report = {
  id: string;
  userId: string;
  projectId: string;
  weekStartDate: string;
  weekEndDate: string;
  status: ReportStatus;
  currentVersion: number;
  tasksCompleted: Task[];
  tasksPlanned: PlannedTask[];
  blockers: FlaggedNote[];
  achievements: FlaggedNote[];
  hoursByType?: Record<string, number>;
  notes?: string;
  user?: { id: string; name: string };
  project?: { id: string; name: string };
  reviewComments?: Array<{ id: string; action: string; comment: string | null; createdAt: string; versionNumber: number }>;
};

export const emptyTask: Task = {
  taskName: "",
  priority: "Medium",
  plannedPct: 0,
  actualPct: 0,
  status: "Not Started",
  timePlanned: 0,
  timeSpent: 0,
  output: ""
};

export const HOUR_TYPES = ["Development", "Testing", "Meetings", "Documentation"] as const;
