import { Response, NextFunction } from "express";
import { AuthedRequest } from "./auth.middleware";

// Usage: router.get("/", authenticate, requireRole(["MANAGER"]), handler)
export function requireRole(allowed: Array<"TEAM_MEMBER" | "MANAGER">) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
