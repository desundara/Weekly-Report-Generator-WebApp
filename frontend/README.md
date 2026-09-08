# Weekly Reports — Frontend

React (Create React App) frontend for the Weekly Report Generator & Team Dashboard.

## Setup

1. Install dependencies:
```bash
   npm install
```
2. Copy `.env.example` to `.env`:

3. Make sure the backend is running first (`cd ../backend && npm run dev`).
4. Start the frontend:
```bash
   npm start
```
5. Visit http://localhost:3000/login.

## Seeded login credentials

Password for every account: password123

| Role         | Email                  |
|--------------|-------------------------|
| Manager      | manager@sisenco.dev     |
| Team Member  | member1@sisenco.dev     |
| Team Member  | member2@sisenco.dev     |
| Team Member  | member3@sisenco.dev     |
| Team Member  | member4@sisenco.dev     |

These are created by the backend's seed script (npm run db:seed in backend/).

## Project structure
```
backend/
  prisma/schema.prisma     # users, roles, projects, reports, versions, review comments
  prisma/seed.ts
  src/index.ts             # Express app entry
  src/routes/               # auth, users (+ reports, projects — Day 2+)
  src/middleware/            # JWT auth + role-based access control
  src/lib/                   # prisma client, jwt helpers

frontend/
  public/index.html
  src/pages/                # Login, Register, Reports (+ dashboard, review — Day 3+)
  src/context/AuthContext.tsx
  src/components/ProtectedRoute.tsx
  src/lib/api.ts             # fetch wrapper, attaches JWT
  src/index.css              # Tailwind + glassmorphism design system
  src/index.tsx, App.tsx
  tailwind.config.js
```

## AI Chat Assistant (optional feature)

A manager-only floating chat widget (bottom-right, on every manager page) lets managers ask
questions like *"What did the team work on last week?"* or *"Any recurring blockers?"*. The
Dashboard also has a **"Generate summary"** button that produces a short AI-written team summary
(completed work, recurring blockers, workload imbalances).

**Approach**: lightweight RAG without a vector store — at the data volume a small team produces
(a handful of reports per week), the backend simply pulls the most recent ~60 reports, formats
them as plain text (member, project, week, status, tasks, blockers, achievements), and passes
that as context to the model alongside the manager's question. The model is instructed to answer
only from that data and say so plainly if the answer isn't there.

**Model**: [Groq](https://console.groq.com) running Llama 3.3 70B — a free API tier for an
open-source model, called via its OpenAI-compatible chat completions endpoint (plain `fetch`,
no extra SDK). Get a free key at [console.groq.com/keys](https://console.groq.com/keys), set
`GROQ_API_KEY` in `backend/.env`. Leave it unset to disable the feature — the chat widget only
appears for managers, and calls fail gracefully with a clear error if no key is configured.

**Data privacy**: only report content already visible to managers (team names, project names,
task/blocker/achievement text) is sent to the model provider's API — no passwords, emails, or
other account data. This happens only when a manager explicitly opens the chat or requests a
summary.

## Available Scripts

- npm start — runs the app in development mode at http://localhost:3000
- npm run build — builds the app for production to the build/ folder

---
Bootstrapped with Create React App.