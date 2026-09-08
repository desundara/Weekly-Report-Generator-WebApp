import { prisma } from "./prisma";

// Keeps the prompt small and predictable: recent reports only, plain text,
// hard character cap. This is deliberately simple "retrieval" — at the data
// volumes a small team produces, pulling everything relevant beats the
// complexity of embeddings/a vector store.
const MAX_REPORTS = 60;
const MAX_CONTEXT_CHARS = 12000;

export async function buildReportContext() {
  const reports = await prisma.report.findMany({
    include: { user: { select: { name: true } }, project: { select: { name: true } } },
    orderBy: { weekStartDate: "desc" },
    take: MAX_REPORTS
  });

  const lines = reports.map((r) => {
    const tasks = Array.isArray(r.tasksCompleted) ? (r.tasksCompleted as any[]) : [];
    const blockers = Array.isArray(r.blockers) ? (r.blockers as any[]) : [];
    const achievements = Array.isArray(r.achievements) ? (r.achievements as any[]) : [];
    const week = r.weekStartDate.toISOString().slice(0, 10);

    return [
      `Member: ${r.user.name} | Project: ${r.project.name} | Week of ${week} | Status: ${r.status}`,
      `Tasks completed: ${tasks.map((t) => t.taskName).filter(Boolean).join(", ") || "none"}`,
      `Blockers: ${blockers.map((b) => b.text).filter(Boolean).join("; ") || "none"}`,
      `Achievements: ${achievements.map((a) => a.text).filter(Boolean).join("; ") || "none"}`
    ].join("\n");
  });

  let context = lines.join("\n\n");
  if (context.length > MAX_CONTEXT_CHARS) {
    context = context.slice(0, MAX_CONTEXT_CHARS) + "\n\n[older reports truncated]";
  }
  return context || "No reports have been submitted yet.";
}
