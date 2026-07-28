# Application Tracker (Next.js Capstone)

A full-stack Application Tracker for managing opportunities across jobs, internships, research/lab roles, and outreach.

The app focuses on practical workflow tracking:
- current stage tracking with status
- final/archive tracking with outcome
- resume usage, follow-up reminders, and dashboard progress visibility

## Product Purpose

This project helps users organize opportunity pipelines in one place, from initial interest to final outcomes.

It is designed as a portfolio-ready capstone with strong fundamentals:
- user authentication
- user-scoped CRUD APIs
- production-oriented deployment flow (GitHub + Vercel)

## Main Features

- Auth: credential signup/signin with NextAuth v4
- Opportunities: create/update/delete opportunities in the Applications page
- Opportunity tracking scope: jobs, internships, research/lab roles, and outreach
- Opportunity types: Job, Internship, Research/Lab, Other Outreach (with compatibility mapping for legacy values)
- Status workflow (current stage): INTERESTED, SAVED, APPLIED, INTERVIEW, OFFER
- Outcome workflow (final/archive): ACTIVE, ACCEPTED, REJECTED, NO_RESPONSE, WITHDRAWN, ARCHIVED
- Active vs Final sections: split by outcome (not status)
- Search + filters on opportunities: title/company/contact + type/status/outcome
- Applications view toggle: card view and spreadsheet-style table view
- Table view reminder visibility: Next reminder column for each opportunity
- Dashboard summaries: status, outcomes, reminders, week/month progress metrics, and weekly goal progress
- Weekly goals: set targets for adding opportunities, applying to opportunities, and completing follow-ups; progress is shown on the dashboard card
- Reminder notification: dashboard alert with Dismiss and Hide for today behavior
- Profile page: edit formal display name, preferred name, and personal profile links
- Dashboard greeting: uses preferred name first when available
- Resume/CV library: manage resumes and optionally link one resume used per opportunity
- Resume/CV file links: track external file links only; files are not uploaded to app storage
- Profile links: save GitHub, LinkedIn, and portfolio URLs
- Reminders/follow-ups: due tracking with overdue/upcoming visibility
- Dark mode support across core pages
- Dashboard shell footer: subtle copyright line
- Optional AI match insights per opportunity + resume pair

## Tech Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Prisma ORM + Neon PostgreSQL
- NextAuth v4 (credentials)
- Zod validation
- GitHub Actions (CI) + Vercel deployment
- OpenAI API (optional feature)

## High-Level Data Model

Core entities:
- User
- JobApplication (internal model name used for broad opportunity tracking)
- Company
- Resume
- Reminder
- AiInsight

Relationship overview:
- A user owns many applications, resumes, reminders, and companies.
- An application can link to one company and one used resume.
- Reminders can be linked to an application.
- AI insights are stored per application + resume pair.

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Create local environment file

```bash
cp .env.example .env
```

3. Generate Prisma client and run migrations

```bash
npx prisma generate
npx prisma migrate dev
```

4. Start development server

```bash
npm run dev
```

5. Production build check

```bash
npm run build
```

## Environment Variables

Set these in `.env` (never commit secrets):

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-strong-random-secret"
OPENAI_API_KEY="optional"
```

Notes:
- `OPENAI_API_KEY` is optional for the main product workflow.
- Without `OPENAI_API_KEY`, AI insight generation is unavailable, but the rest of the app works normally.

## AI Feature Scope

AI is an optional enhancement, not the core product.

Core product value is opportunity management (status/outcome, resumes, reminders, dashboard tracking).
Optional AI match insights are available after sign-in when an API key is configured.

## Deployment (Vercel)

- Push to GitHub (main branch)
- Import the repo in Vercel
- Configure env vars in Vercel Project Settings:
  - `DATABASE_URL`
  - `NEXTAUTH_URL`
  - `NEXTAUTH_SECRET`
  - `OPENAI_API_KEY` (optional)
- Use Neon production connection string for `DATABASE_URL`
- Set `NEXTAUTH_URL` to the deployed Vercel URL

## Portfolio Summary

This capstone demonstrates end-to-end product development with Next.js:
- authenticated multi-entity CRUD
- clear status/outcome workflow design
- practical dashboard and reminder UX
- production deployment and CI-ready project structure

It highlights building a focused, user-friendly tracking product with optional AI augmentation rather than AI-first dependency.

## Future Work

- Add first-party resume/CV file upload and storage (intentionally deferred in current version to avoid storage/billing risk)
