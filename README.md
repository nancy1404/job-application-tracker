# Job Application Tracker with AI Match Insights

Full-stack Next.js portfolio project for tracking job applications, managing resume versions, scheduling reminders, and generating AI match insights.

## AI-Assisted Development Workflow

This project was developed as a course-guided capstone inspired by Coursera's "Vibe Coding with GitHub Copilot and AI" by Edureka. It uses a structured AI-assisted workflow with GitHub Copilot Pro, where the development process was broken into small phases with prompts guiding implementation, validation, documentation, CI, and deployment.

See [AI_DEVELOPMENT_PROMPTS.md](./AI_DEVELOPMENT_PROMPTS.md) for the prompt sequence, development phases, and reflection.

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

## Deploy to Vercel
1. Push the repository to GitHub.
2. Create a new Vercel project and import this repository.
3. In Vercel Project Settings, configure environment variables:
	- `DATABASE_URL`
	- `NEXTAUTH_URL`
	- `NEXTAUTH_SECRET`
	- `OPENAI_API_KEY` (optional)
4. Use the Neon production connection string for `DATABASE_URL`.
5. Set `NEXTAUTH_URL` to your deployed Vercel URL (for example, `https://your-app.vercel.app`).
6. Deploy.

Notes:
- The app works without `OPENAI_API_KEY`, but real AI insight generation requires it.
- Never commit `.env`.

## Production Checklist
- `npm run build` passes locally.
- Prisma migrations are applied to production (`npx prisma migrate deploy`).
- Vercel environment variables are configured.
- Signup/signin is tested on the deployed app.
- Applications, resumes, and reminders flows are tested on the deployed app.

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
