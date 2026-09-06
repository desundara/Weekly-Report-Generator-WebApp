import jwt from "jsonwebtoken";

export type JwtPayload = { id: string; name: string; email: string; role: "TEAM_MEMBER" | "MANAGER" };

const SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
