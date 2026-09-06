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

src/pages/          Login, Register, Reports (+ dashboard, review — Day 3+)
src/context/         AuthContext.tsx — JWT + user state
src/components/      ProtectedRoute.tsx — route guards
src/lib/api.ts       fetch wrapper, attaches JWT to requests
src/index.css        Tailwind + glassmorphism design system

## Available Scripts

- npm start — runs the app in development mode at http://localhost:3000
- npm run build — builds the app for production to the build/ folder

---
Bootstrapped with Create React App.