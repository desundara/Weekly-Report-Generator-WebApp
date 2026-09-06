import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

export const projectsRouter = Router();
projectsRouter.use(authenticate);

// Any authenticated user can list projects — needed for the report form's
// project dropdown, not just managers.
projectsRouter.get("/", async (_req, res) => {
  const projects = await prisma.project.findMany({ orderBy: { name: "asc" } });
  res.json(projects);
});

const projectSchema = z.object({ name: z.string().min(1), description: z.string().optional() });

projectsRouter.post("/", requireRole(["MANAGER"]), async (req, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Project name is required" });

  const project = await prisma.project.create({ data: parsed.data });
  res.status(201).json(project);
});

projectsRouter.put("/:id", requireRole(["MANAGER"]), async (req, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Project name is required" });

  const project = await prisma.project.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(project);
});

projectsRouter.delete("/:id", requireRole(["MANAGER"]), async (req, res) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
