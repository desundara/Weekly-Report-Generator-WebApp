// Local development entry point — Vercel doesn't use this file at all
// (it calls api/index.ts instead); this one just runs the same Express
// app as a normal long-running server for `npm run dev` / `npm start`.
import app from "./app";

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));