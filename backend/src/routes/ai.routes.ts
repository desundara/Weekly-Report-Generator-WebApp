import { Router } from "express";
import { z } from "zod";
import { callAi, isAiConfigured } from "../lib/aiClient";
import { buildReportContext } from "../lib/reportContext";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

export const aiRouter = Router();
aiRouter.use(authenticate, requireRole(["MANAGER"]));

function assertConfigured(res: any) {
  if (!isAiConfigured()) {
    res.status(500).json({ error: "AI assistant is not configured. Set GROQ_API_KEY in backend/.env." });
    return false;
  }
  return true;
}

const chatSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional()
});

// Conversational Q&A grounded in the team's own report data.
aiRouter.post("/chat", async (req, res) => {
  if (!assertConfigured(res)) return;
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "A message is required" });

  try {
    const context = await buildReportContext();
    const reply = await callAi([
      {
        role: "system",
        content:
          "You are an assistant for a team's weekly report system. Answer the manager's questions using ONLY " +
          "the report data provided below. If the answer isn't in the data, say so plainly rather than guessing. " +
          "Be concise and specific, referencing member names and weeks where relevant. Reply in plain prose or " +
          "simple hyphen bullet points only — never use markdown tables, since they render as raw text here.\n\n" +
          `REPORT DATA:\n${context}`
      },
      ...(parsed.data.history ?? []),
      { role: "user", content: parsed.data.message }
    ]);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "The AI assistant could not respond right now." });
  }
});

// AI-generated team summary — completed work, recurring blockers, workload imbalances.
aiRouter.post("/summary", async (_req, res) => {
  if (!assertConfigured(res)) return;

  try {
    const context = await buildReportContext();
    const summary = await callAi([
      {
        role: "system",
        content:
          "You write short team-activity summaries for an engineering manager, based only on the weekly report " +
          "data provided. Cover, in plain prose, under 200 words: (1) completed work highlights, (2) any blockers " +
          "that recur across more than one report, (3) workload imbalances — who appears over- or under-loaded. " +
          "If the data doesn't support a section, say so briefly rather than inventing detail. Write in plain " +
          "prose paragraphs with short section labels followed by a colon — never use markdown bold, headers, " +
          "or tables, since this renders as plain text.\n\n" +
          `REPORT DATA:\n${context}`
      },
      { role: "user", content: "Generate this week's team summary." }
    ]);
    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "The AI assistant could not generate a summary right now." });
  }
});