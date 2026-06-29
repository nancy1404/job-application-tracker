# Job Application Tracker with AI Match Insights

Full-stack Next.js portfolio project for tracking job applications, managing resume versions, scheduling reminders, and generating AI match insights.

## Current Features
- Credentials authentication with NextAuth v4 (`/auth/signup`, `/auth/signin`)
- Applications CRUD (UI + API)
- Companies API with duplicate protection per user
- Resumes CRUD (UI + API) with one default resume per user
- Reminders CRUD (UI + API) with optional linked application
- Dashboard summary (applications, resumes, reminders)
- AI insight generation (UI + API) with persisted upserted results
- Ownership checks across user-scoped API data

## Tech Stack
- Next.js App Router + TypeScript
- NextAuth v4 (credentials)
- Prisma 7 + Neon PostgreSQL (`@prisma/adapter-pg` + `pg`)
- Tailwind CSS
- Zod validation
- OpenAI API (optional in local development)

## Environment Variables
Create a local `.env` file from `.env.example` and set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret"
OPENAI_API_KEY="your-openai-api-key"
```

Notes:
- `OPENAI_API_KEY` is optional for general app usage.
- AI generation requires `OPENAI_API_KEY`; without it, the app safely returns `OPENAI_API_KEY is not configured.`
- Never commit `.env` to source control.

## Local Setup
```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Build Check
```bash
npm run build
```

## Implemented API Surface
- `POST /api/auth/signup`
- `/api/auth/[...nextauth]`
- `/api/applications`
- `/api/applications/[id]`
- `/api/companies`
- `/api/resumes`
- `/api/resumes/[id]`
- `/api/reminders`
- `/api/reminders/[id]`
- `POST /api/ai-insights`

## Project Notes
- Data is user-scoped: routes verify session ownership before read/update/delete.
- Schema lives in `prisma/schema.prisma` and is not modified by runtime logic.
- AI insight rows are upserted by `(applicationId, resumeId)` uniqueness.
