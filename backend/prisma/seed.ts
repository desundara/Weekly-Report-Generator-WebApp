import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const manager = await prisma.user.create({
    data: { name: "Nadeesha Perera", email: "manager@sisenco.dev", passwordHash, role: "MANAGER" }
  });

  const members = await Promise.all(
    ["Ruwan Silva", "Dilani Fernando", "Kasun Jayasuriya", "Amaya Wickrama"].map((name, i) =>
      prisma.user.create({
        data: { name, email: `member${i + 1}@sisenco.dev`, passwordHash, role: "TEAM_MEMBER" }
      })
    )
  );

  const projects = await Promise.all(
    ["Client A", "Internal Tooling", "R&D", "Marketing Site"].map((name) =>
      prisma.project.create({ data: { name } })
    )
  );

  const statuses: Array<"DRAFT" | "SUBMITTED" | "NEEDS_CORRECTION" | "APPROVED"> = [
    "DRAFT",
    "SUBMITTED",
    "NEEDS_CORRECTION",
    "APPROVED"
  ];

  for (const member of members) {
    for (let week = 0; week < 3; week++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - week * 7);

      const status = statuses[(members.indexOf(member) + week) % statuses.length];
      const project = projects[(members.indexOf(member) + week) % projects.length];

      const report = await prisma.report.create({
        data: {
          userId: member.id,
          projectId: project.id,
          weekStartDate: weekStart,
          weekEndDate: weekStart,
          status,
          currentVersion: 1,
          tasksCompleted: [
            {
              taskName: "Implement feature module",
              priority: "High",
              plannedPct: 100,
              actualPct: 90,
              status: "In Progress",
              timePlanned: 16,
              timeSpent: 14,
              output: "PR opened"
            }
          ],
          tasksPlanned: [{ description: "Finish code review feedback" }],
          blockers: [{ text: "Waiting on API credentials", isKey: true }],
          achievements: [{ text: "Shipped v1 of the module", isKey: true }],
          hoursByType: { Development: 20, Testing: 6, Meetings: 4, Documentation: 2 }
        }
      });

      if (status !== "DRAFT") {
        await prisma.reportVersion.create({
          data: { reportId: report.id, versionNumber: 1, snapshot: report as any }
        });
      }

      if (status === "NEEDS_CORRECTION" || status === "APPROVED") {
        await prisma.reviewComment.create({
          data: {
            reportId: report.id,
            managerId: manager.id,
            versionNumber: 1,
            action: status === "APPROVED" ? "APPROVED" : "REQUESTED_CHANGES",
            comment: status === "APPROVED" ? null : "Please add more detail to the blockers section."
          }
        });
      }
    }
  }

  console.log("Seed complete. Login as manager@sisenco.dev or member1..4@sisenco.dev / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
