# Cyber UW

Standalone cyber underwriting app — Form Shipping Center + Dashboard.

Extracted from the Moody Submission Workbench monorepo as an independent product repo.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## What's included

- **Form Shipping Center** — broker outtake / form dispatch flows
- **Dashboard** — 5-stage cyber UW journey (New → Feedback → Review Risk → Review Platform → Closure)
- Demo ingest + mock cases (no API key)

## Tech stack

Vite · React · TypeScript · Tailwind · Zustand · HeroUI · Lucide

## Docs

Product research and forge artifacts live under [`docs/`](./docs/).

Portfolio insights metrics & visualization plan (Moody drill-down pattern → cyber UW): [`docs/planning/CYBER-INSIGHTS-METRICS-SPEC.md`](./docs/planning/CYBER-INSIGHTS-METRICS-SPEC.md).
