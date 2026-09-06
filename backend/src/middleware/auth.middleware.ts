import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../lib/jwt";

export interface AuthedRequest extends Request {
  user?: JwtPayload;
}

// Attaches req.user if a valid token is present. Does not reject by itself —
// pair with requireRole() on routes that need protection.
export function authenticate(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Unauthenticated" });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid or expired token" });

  req.user = payload;
  next();
}

// A team member may only touch their own reports; a manager may read any
// report but must never rewrite the team member's actual content.
export function canEditReportContent(user: JwtPayload, reportOwnerId: string) {
  return user.role === "TEAM_MEMBER" && user.id === reportOwnerId;
}
