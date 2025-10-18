FocusUp Dashboard - Menu Fixed (React + Vite)

This project is a React + Vite frontend that uses fetch() directly against your API base:
https://focus-up-backend.vercel.app/api

Features:
- Fixed top navigation menu with tabs: Ranking, History, Metrics
- Ranking: select game and see top 10 via GET /api/scores/ranking?game=
- History: combines top entries fetched for all games (backend must expose full history for complete data)
- Metrics: aggregated charts using recharts
- No login, no tokens. Uses fetch() directly.

Run locally:
1. unzip
2. npm install
3. npm run dev -- --force
4. open http://localhost:5173

Notes:
- If some endpoints are missing in backend, adjust API routes accordingly in src/pages/Dashboard.jsx
- This app intentionally keeps logic simple and uses fetch to avoid previous Vite plugin cache issues.
