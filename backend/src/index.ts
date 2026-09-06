import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.routes";
import { usersRouter } from "./routes/users.routes";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
// Day 2+: app.use("/api/reports", reportsRouter);
// Day 2+: app.use("/api/projects", projectsRouter);

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
