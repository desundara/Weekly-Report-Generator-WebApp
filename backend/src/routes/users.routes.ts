import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, AuthedRequest } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { z } from "zod";

export const usersRouter = Router();

// Manager-only: list all team members, for the User Management page
usersRouter.get("/", authenticate, requireRole(["MANAGER"]), async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { name: "asc" }
  });
  res.json(users);
});

const roleSchema = z.object({ role: z.enum(["TEAM_MEMBER", "MANAGER"]) });

// Manager-only: promote/demote a team member
usersRouter.patch("/:id/role", authenticate, requireRole(["MANAGER"]), async (req: AuthedRequest, res) => {
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "role must be TEAM_MEMBER or MANAGER" });

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true }
  });
  res.json(user);
});
