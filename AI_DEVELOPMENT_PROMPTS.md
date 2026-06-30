# AI Development Prompt Log

## Project Context

This capstone project is a full-stack Job Application Tracker with AI Match Insights. The goal of the project was to explore whether a simple but complete full-stack application could be planned, implemented, tested, and deployed using a structured AI-assisted development workflow.

It was created as a course-guided capstone inspired by Coursera's "Vibe Coding with GitHub Copilot and AI" by Edureka within the broader "Vibe Coding for Developers" specialization, while the project itself remained an original application.

The main development assistant used for this project was GitHub Copilot Pro. Instead of asking Copilot to build the entire app at once, the project was divided into small development phases: app scaffolding, database modeling, authentication, CRUD APIs, UI pages, dashboard summaries, optional AI insight generation, documentation, CI, and deployment.

Each prompt was written with clear context, implementation requirements, constraints, and verification steps. After each major phase, the app was built, tested, committed, and eventually deployed through GitHub Actions, Vercel, and Neon PostgreSQL.

This document records the prompt sequence and workflow used during development. It is intended to serve as both project documentation and a reusable reference for future AI-assisted full-stack app development.

---

## Prompting Strategy

1. Define scope clearly.
2. Build one feature at a time.
3. Tell Copilot what already exists.
4. Tell Copilot what not to change.
5. Require build verification.
6. Commit after each stable phase.
7. Keep AI/API integrations optional.
8. Never commit .env.
9. Deploy only after CI passes.
10. Treat deployment errors as feedback, not failure.

---

## Phase 0: Project Definition/MVP Scope

You are helping me build a full-stack portfolio project.

Project name:
Job Application Tracker with AI Match Insights

Goal:
Build a simple full-stack web app where a user can:
- sign up and sign in
- manage job applications
- manage resumes
- manage reminders
- view a dashboard summary
- optionally generate AI match insights between a resume and a job application

Tech stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- Neon PostgreSQL
- NextAuth credentials authentication
- Zod validation
- Optional OpenAI integration

Important constraints:
- Keep the MVP simple.
- Build step by step.
- Do not over-engineer.
- Do not add features before the core app works.
- After each phase, run npm run build and summarize what changed.

---

## Phase 1: Initial Next.js Scaffold

### Prompt 1 - Create App Structure

Create the initial structure for a Next.js App Router + TypeScript full-stack app.

Project:
Job Application Tracker with AI Match Insights

Implement:
1. Basic app layout.
2. Pages/routes:
   - /
   - /dashboard
   - /applications
   - /resumes
   - /reminders
   - /auth/signin
3. Basic navigation between pages.
4. Placeholder UI for each page.
5. Basic Tailwind styling.
6. Keep everything simple and clean.
7. Do not implement database logic yet.
8. Run npm run build.
9. Stop and summarize files changed.

---

## Phase 2: Database and Prisma

### Prompt 2A - Prisma Schema

Set up Prisma schema for the Job Application Tracker app.

Tech context:
- Prisma ORM
- Neon PostgreSQL
- Next.js App Router
- NextAuth credentials authentication

Models needed:
1. User
2. Account
3. Session
4. VerificationToken
5. Resume
6. Company
7. JobApplication
8. Reminder
9. AiInsight

Requirements:
- User should own resumes, companies, applications, reminders, and AI insights.
- Resume should have title, content, and isDefault.
- Company should have name, website, and location.
- JobApplication should have title, company relation, jobUrl, description, status, appliedDate, and notes.
- Reminder should have title, dueDate, status, optional linked application, and notes.
- AiInsight should link a user, application, and resume.
- Use enums for application status and reminder status.
- Add useful createdAt and updatedAt fields.
- Add ownership relations.
- Add reasonable unique constraints.

Do not implement UI yet.
Stop and summarize schema changes.

### Prompt 2B - Prisma Client Helper

Create Prisma helper utilities for this Next.js app.

Context:
- App uses Prisma with Neon PostgreSQL.
- App Router route handlers will need a shared Prisma client.
- The project uses TypeScript.

Implement:
1. Create src/lib/prisma.ts.
2. Export a reusable Prisma client.
3. Avoid creating too many Prisma clients during development.
4. Include any helper types if useful.
5. Keep it compatible with Next.js App Router.
6. Run npm run build.
7. Stop and summarize files changed.

### Prompt 2C - Zod Validation Schemas

Create Zod validation schemas for the app.

Context:
- The app has User, Resume, Company, JobApplication, Reminder, and AiInsight models.
- API route handlers should validate incoming request bodies.
- Keep validation practical and simple.

Implement schemas for:
1. Signup
2. Resume create/update
3. Company create/update
4. JobApplication create/update
5. Reminder create/update
6. AI insight request

Requirements:
- Put schemas in src/lib/validations.ts.
- Export inferred TypeScript types.
- Use enums consistent with Prisma schema.
- Support optional fields for update schemas.
- Run npm run build.
- Stop and summarize files changed.

---

## Phase 3: Authentication

### Prompt 3A - NextAuth Credentials Setup

Implement authentication using NextAuth v4 credentials provider.

Context:
- Next.js App Router
- TypeScript
- Prisma
- User model has email and passwordHash
- Use bcryptjs for password hashing
- Use NextAuth v4, not Auth.js v5

Implement:
1. src/lib/auth.ts with authOptions.
2. Credentials provider using email and password.
3. Password comparison with bcryptjs.
4. Return safe user data.
5. App Router NextAuth route at src/app/api/auth/[...nextauth]/route.ts.
6. Keep session strategy compatible with credentials auth.
7. Do not add OAuth providers.
8. Run npm run build.
9. Stop and summarize files changed.

### Prompt 3B - Signup API

Create a signup API route.

Context:
- Next.js App Router route handler
- Prisma User model
- bcryptjs
- Zod signup validation

Implement:
1. POST /api/auth/signup.
2. Validate request body.
3. Check whether email already exists.
4. Hash password.
5. Create user.
6. Return safe user data only.
7. Return clear errors for invalid input and duplicate email.
8. Do not return passwordHash.
9. Run npm run build.
10. Stop and summarize files changed.

### Prompt 3C - Sign In Page

Implement a simple sign-in page for credentials authentication.

Context:
- NextAuth v4 credentials provider is configured.
- Signup API exists.
- App route is /auth/signin.

Implement:
1. Sign-in form with email and password.
2. Call signIn("credentials", { redirect: false }).
3. On success, redirect to /dashboard.
4. Show readable error messages.
5. Include a simple signup form or signup flow if needed.
6. Keep styling simple with Tailwind.
7. Run npm run build.
8. Stop and summarize files changed.

---

## Phase 4: Applications and Companies

### Prompt 4A - Applications API

Implement application API routes.

Context:
- Next.js App Router route handlers
- Prisma
- NextAuth v4 getServerSession
- Zod validation
- Users can only access their own applications

Implement:
1. GET /api/applications
   - return current user's applications
   - include company if linked
2. POST /api/applications
   - create application for current user
   - optionally link company
3. PATCH /api/applications/[id]
   - update only current user's application
4. DELETE /api/applications/[id]
   - delete only current user's application

Requirements:
- Require authentication.
- Enforce ownership.
- Validate request bodies with Zod.
- Return clear JSON errors.
- Do not expose other users' data.
- Run npm run build.
- Stop and summarize files changed.

### Prompt 4B - Companies API

Implement company API routes.

Context:
- Companies belong to users.
- Applications can optionally link to a company.
- Users should not access other users' companies.

Implement:
1. GET /api/companies
   - return current user's companies
2. POST /api/companies
   - create company for current user
   - prevent duplicate company names per user if schema supports it
3. Require authentication.
4. Validate body with Zod.
5. Return 409 for duplicate company if appropriate.
6. Run npm run build.
7. Stop and summarize files changed.

### Prompt 4C - Applications UI Create/List

Implement the Applications page UI.

Context:
- API routes for applications and companies exist.
- User must be signed in.
- This is an MVP UI.

Implement:
1. Fetch and display current user's applications.
2. Show title, company, status, applied date, and notes.
3. Add a form to create a new application.
4. Allow creating or selecting a company if possible.
5. Use basic Tailwind styling.
6. Show loading and error states.
7. Keep the UI simple.
8. Run npm run build.
9. Stop and summarize files changed.

### Prompt 4D - Applications UI Edit/Delete

Extend the Applications page with edit and delete behavior.

Context:
- Applications can already be listed and created.
- API supports PATCH and DELETE.

Implement:
1. Add edit functionality for an application.
2. Allow updating:
   - title
   - company
   - status
   - jobUrl
   - description
   - appliedDate
   - notes
3. Add delete functionality.
4. Refresh the list after edits/deletes.
5. Show readable loading and error states.
6. Keep styling simple.
7. Run npm run build.
8. Stop and summarize files changed.

---

## Phase 5: Resumes

### Prompt 5A - Resume APIs

Implement resume API routes.

Context:
- Resumes belong to users.
- A user can have multiple resumes.
- One resume can be marked as default.
- Users can only access their own resumes.

Implement:
1. GET /api/resumes
   - return current user's resumes
2. POST /api/resumes
   - create a resume
   - if isDefault is true, unset other default resumes for that user
3. PATCH /api/resumes/[id]
   - update current user's resume
   - handle default resume behavior
4. DELETE /api/resumes/[id]
   - delete current user's resume

Requirements:
- Require authentication.
- Enforce ownership.
- Validate request bodies with Zod.
- Return clear JSON errors.
- Run npm run build.
- Stop and summarize files changed.

### Prompt 5B - Resumes UI

Implement the Resumes page UI.

Context:
- Resume API routes exist.
- User must be signed in.
- Resumes have title, content, and isDefault.

Implement:
1. Fetch and display user's resumes.
2. Add a form to create a resume.
3. Allow editing resume title, content, and default status.
4. Allow deleting a resume.
5. Clearly label the default resume.
6. Refresh list after create/edit/delete.
7. Show loading and error states.
8. Keep Tailwind styling simple.
9. Run npm run build.
10. Stop and summarize files changed.

---

## Phase 6: Reminders

### Prompt 6A - Reminder APIs

Implement reminder API routes.

Context:
- Reminders belong to users.
- Reminders can optionally link to a job application.
- Users can only access their own reminders and applications.

Implement:
1. GET /api/reminders
   - return current user's reminders
   - include linked application if present
2. POST /api/reminders
   - create reminder
   - optionally link to an application if user owns it
3. PATCH /api/reminders/[id]
   - update current user's reminder
   - preserve ownership checks
4. DELETE /api/reminders/[id]
   - delete current user's reminder

Requirements:
- Require authentication.
- Enforce ownership.
- Validate request bodies with Zod.
- Return clear JSON errors.
- Run npm run build.
- Stop and summarize files changed.

### Prompt 6B - Reminders UI

Implement the Reminders page UI.

Context:
- Reminder API routes exist.
- Applications API exists.
- Reminders can optionally link to applications.

Implement:
1. Fetch and display reminders.
2. Fetch applications for a dropdown.
3. Add a form to create a reminder.
4. Allow reminders with or without linked applications.
5. Allow editing reminders.
6. Allow deleting reminders.
7. Show title, due date, status, notes, and linked application if present.
8. Show loading and error states.
9. Keep styling simple.
10. Run npm run build.
11. Stop and summarize files changed.

---

## Phase 7: Dashboard

### Prompt 7A - Dashboard Summary

Implement the Dashboard page.

Context:
- APIs exist for applications, resumes, and reminders.
- User must be signed in.
- Dashboard should summarize the user's job search activity.

Implement:
1. Fetch applications, resumes, and reminders.
2. Show summary cards:
   - total applications
   - application count by status
   - total resumes
   - default resume title if available
   - pending reminders
   - upcoming reminders
3. Show a recent applications list.
4. Show an upcoming reminders list.
5. Add links to Applications, Resumes, and Reminders pages.
6. Show loading and error states.
7. Keep UI simple and clean.
8. Run npm run build.
9. Stop and summarize files changed.

---

## Phase 8: AI Insights

### Prompt 8A - AI Helper

Create an AI helper for optional resume-job match insights.

Context:
- The app may use OpenAI, but OPENAI_API_KEY should be optional.
- The app must still work without an OpenAI key.
- AI insights compare a resume with a job application.

Implement:
1. Create src/lib/ai.ts.
2. Add a function to generate a match insight.
3. If OPENAI_API_KEY is missing, throw a readable configuration error.
4. Ask the model to return structured JSON with:
   - matchScore
   - summary
   - strengths
   - gaps
   - suggestions
5. Validate or safely parse the JSON response.
6. Do not call OpenAI unless the API key exists.
7. Run npm run build.
8. Stop and summarize files changed.

### Prompt 8B - AI Insight API

Implement the AI insight API route.

Context:
- AI helper exists.
- AiInsight Prisma model exists.
- Applications and resumes belong to users.
- User must own both selected application and resume.

Implement:
1. POST /api/ai-insights.
2. Require authentication.
3. Accept applicationId and resumeId.
4. Verify the user owns both records.
5. Load application and resume data.
6. Call the AI helper.
7. Store or upsert the AiInsight record.
8. Return structured insight JSON.
9. If OPENAI_API_KEY is missing, return a safe readable error.
10. Run npm run build.
11. Stop and summarize files changed.

### Prompt 8C - AI Insight UI

Add AI insight UI to the Applications page.

Context:
- AI insight API exists.
- Resumes API exists.
- Users should be able to select a resume for an application and generate an insight.
- OPENAI_API_KEY may be missing, and that should show a readable error.

Implement:
1. Fetch user's resumes on the Applications page.
2. For each application, allow selecting a resume.
3. Add a "Generate AI Insight" button.
4. Call POST /api/ai-insights with applicationId and resumeId.
5. Display:
   - matchScore
   - summary
   - strengths
   - gaps
   - suggestions
6. Show loading state while generating.
7. Show readable error if AI is not configured.
8. Keep UI simple.
9. Run npm run build.
10. Stop and summarize files changed.

---

## Phase 9: Documentation and Deployment

### Prompt 9A - MVP Documentation

Update documentation for the MVP.

Context:
- The app now has auth, applications, companies, resumes, reminders, dashboard, and optional AI insights.
- The project is a full-stack portfolio project built with AI-assisted development.
- Do not change app code.

Update:
1. README.md
2. API_SPEC.md
3. DEVELOPMENT.md
4. .env.example if needed

Include:
- Project overview
- Feature list
- Tech stack
- Local setup steps
- Environment variables:
  - DATABASE_URL
  - NEXTAUTH_URL
  - NEXTAUTH_SECRET
  - OPENAI_API_KEY
- Note that OPENAI_API_KEY is optional
- API endpoint summary
- Database/migration notes
- Development workflow notes
- Security note: .env should never be committed

Run npm run build.
Stop and summarize files changed.

### Prompt 9B - Vercel Deployment Docs

Implement Vercel deployment documentation and configuration.

Context:
- This is a Next.js App Router + TypeScript app.
- Database is Neon PostgreSQL.
- ORM is Prisma 7 using @prisma/adapter-pg.
- Auth uses NextAuth v4 credentials.
- AI insights use OpenAI only when OPENAI_API_KEY is configured.
- Deployment target is Vercel.
- Do not add Dockerfile or Procfile.
- Do not change prisma/schema.prisma.
- Do not change app feature code unless absolutely necessary.
- Keep the project buildable.

Implement:
1. Update README.md or DEVELOPMENT.md with Vercel deployment steps.
2. Make sure .env.example includes all deployment variables:
   - DATABASE_URL
   - NEXTAUTH_URL
   - NEXTAUTH_SECRET
   - OPENAI_API_KEY
3. Add notes about setting environment variables in Vercel.
4. Add notes about using the Neon production connection string.
5. Add notes that NEXTAUTH_URL should be the deployed Vercel URL in production.
6. Add notes that OPENAI_API_KEY is optional unless real AI generation is needed.
7. Add a production checklist:
   - npm run build passes
   - Prisma migrations are applied
   - Vercel environment variables are configured
   - signup/signin tested
   - applications/resumes/reminders tested
8. Add a minimal vercel.json only if it is actually useful for this project.
9. Run npm run build.
10. Stop and summarize files changed.

---

## Phase 10: CI and Production Readiness

### Prompt 10A - GitHub Actions CI

Create a simple GitHub Actions workflow for this Next.js project.

Context:
- This is a Next.js App Router + TypeScript project.
- The project uses npm.
- The main verification command is npm run build.
- Tests are not required yet.
- Do not add deployment automation.
- Do not add coverage thresholds.
- Do not change app code.
- Keep the workflow simple and reliable.

Implement:
1. Create .github/workflows/ci.yml.
2. Run on push and pull_request to master and main.
3. Use Node.js 22.
4. Run npm ci.
5. Run npx prisma generate if needed for build.
6. Run npm run build.
7. If npm test exists, run npm test; otherwise skip tests.
8. Stop and summarize files changed.

### Prompt 10B - CI Environment Variables

Fix the GitHub Actions CI failure caused by missing environment variables.

Context:
- The project builds locally because .env exists locally.
- .env is intentionally not committed.
- GitHub Actions does not have DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, or OPENAI_API_KEY.
- The workflow should run npm ci, npx prisma generate, and npm run build.
- Do not change app code.
- Only modify .github/workflows/ci.yml.
- Do not use real secrets in the workflow file.
- Use safe CI placeholder values where possible.

Implement:
1. Add env variables to the build job:
   - DATABASE_URL with a valid placeholder PostgreSQL URL
   - NEXTAUTH_URL="http://localhost:3000"
   - NEXTAUTH_SECRET="ci-secret-for-build-only"
   - OPENAI_API_KEY=""
2. Keep Node.js 22 unless there is a compatibility reason to change it.
3. Keep npm ci, npx prisma generate, and npm run build.
4. Do not add deployment.
5. Stop and summarize the workflow changes.

---

## Phase 11: Final Smoke Test Checklist

### Prompt 11A - Smoke Test Documentation

Add final smoke test checklist documentation.

Context:
- The MVP implementation is complete.
- Auth, applications, resumes, reminders, dashboard, AI insight UI, docs, deployment docs, and CI are implemented.
- Do not change app code.
- Do not change prisma/schema.prisma.
- Add documentation only.

Implement:
1. Create or update DEVELOPMENT.md with a “Final Smoke Test Checklist” section.
2. Include manual checks for:
   - npm run build
   - signup
   - signin
   - dashboard summary
   - application create/edit/delete
   - company creation through application form
   - resume create/edit/delete/default behavior
   - reminder create/edit/delete with and without linked application
   - AI insight button with missing OPENAI_API_KEY showing safe error
   - Prisma Studio DB verification
3. Include pre-deployment checks:
   - .env is not committed
   - .env.example is complete
   - git status is clean
   - GitHub Actions workflow exists
4. Stop and summarize files changed.

---

## Phase 12: Deployment Fix Prompt

### Prompt 12A - Generate Prisma Client Before Build

Fix the Vercel build failure caused by Prisma Client not being generated before Next.js build.

Context:
- This project uses Prisma with @prisma/client.
- The app builds locally, but Vercel may fail because Prisma Client is not generated before next build.
- GitHub Actions already runs npx prisma generate before npm run build, but Vercel may only run npm run build.
- Do not change schema.prisma.
- Do not change app logic.
- Keep the fix minimal and deployment-safe.

Implement:
1. Update package.json scripts so Prisma Client is generated before production build.
2. Prefer changing the build script from:
   "build": "next build"
   to:
   "build": "prisma generate && next build"
3. Keep dev/start/lint scripts unchanged.
4. Do not add real environment variables or secrets.
5. Run npm run build locally.
6. Stop and summarize the changed file and result.

---

## Optional Future Feature Prompts

### Future Prompt A - Better Unauthenticated Dashboard Redirect

Improve unauthenticated dashboard behavior.

Context:
- This is a Next.js App Router app using NextAuth v4.
- The dashboard currently may show "Failed to load applications" when a user opens /dashboard without being signed in.
- Do not change database schema.
- Do not change API behavior.
- Keep the fix minimal.

Implement:
1. In the dashboard page, detect unauthenticated users.
2. If the user is not signed in, redirect them to /auth/signin instead of fetching dashboard data.
3. If using client-side session state, show a small loading state while session status is loading.
4. Do not show "Failed to load applications" for unauthenticated users.
5. Run npm run build.
6. Stop and summarize changed files.

### Future Prompt B - Homepage Polish

Polish the homepage for the deployed portfolio app.

Context:
- The app is deployed and functional.
- Current users may not know to visit /auth/signin directly.
- Do not change database schema.
- Keep the change simple and visual.

Implement:
1. Update the homepage with a clear product intro.
2. Add primary buttons:
   - Get Started
   - Sign In
3. Link Get Started and Sign In to /auth/signin or the appropriate auth flow.
4. Mention core features:
   - Track applications
   - Manage resumes
   - Set reminders
   - Generate optional AI match insights
5. Keep Tailwind styling clean.
6. Run npm run build.
7. Stop and summarize changed files.

### Future Prompt C - Status Celebration UI

Add lightweight status celebration UI to the Applications page.

Context:
- Applications have statuses such as SAVED, APPLIED, INTERVIEW, OFFER, REJECTED, and ARCHIVED.
- This should be a UI-only polish feature.
- Do not change database schema.
- Do not change API behavior.

Implement:
1. When an application status is INTERVIEW, show a small encouraging message such as "🎉 Interview stage!".
2. When status is OFFER, show a stronger celebration message such as "🥳 Congrats on the offer!".
3. When status is REJECTED, show a supportive message such as "Keep going — every application is progress."
4. Keep the UI tasteful and not overwhelming.
5. Run npm run build.
6. Stop and summarize changed files.

### Future Prompt D - Follow-Up Reminder Button

Add a follow-up reminder helper for job applications.

Context:
- The app already has applications and reminders.
- Reminders can optionally link to applications.
- This should not send emails yet.
- Do not change database schema unless absolutely necessary.
- Keep the feature simple.

Implement:
1. On each application card, add a "Create follow-up reminder" button.
2. When clicked, create a reminder linked to that application.
3. Default reminder title:
   "Follow up with [Company or Application Title]"
4. Default due date:
   7 days from today
5. Default status:
   PENDING
6. Show success/error feedback.
7. Refresh reminders or show a confirmation after creation.
8. Run npm run build.
9. Stop and summarize changed files.

### Future Prompt E - Email Reminder Research / Planning Only

Plan an email reminder feature, but do not implement it yet.

Context:
- The app has reminders with due dates.
- I may later want the app to email users when reminders are due.
- The app is deployed on Vercel and uses Neon PostgreSQL.
- Do not write code yet.

Create a short implementation plan covering:
1. Whether to use Vercel Cron.
2. Whether to use an email provider such as Resend.
3. What environment variables would be needed.
4. What database fields might be needed to avoid duplicate reminder emails.
5. Security/privacy concerns.
6. A minimal MVP approach.
7. Risks and complexity.

---

## Reusable Meta-Prompt Template

*For future projects, this format worked really well:*

Implement [Phase Name].

Context:
- [Current stack]
- [What already exists]
- [What should not be changed]
- [Important constraints]

Implement:
1. [Specific task]
2. [Specific task]
3. [Specific task]

Requirements:
- Keep the change minimal.
- Preserve existing behavior unless explicitly stated.
- Do not change schema unless necessary.
- Do not add unrelated features.
- Use TypeScript safely.
- Validate inputs.
- Enforce user ownership where relevant.
- Run npm run build.
- Stop and summarize files changed and result.

---

## Reflection

I used GitHub Copilot Pro as the primary implementation assistant while controlling the development process through structured prompts. I decomposed the project into small full-stack phases, verified each phase with builds and manual tests, committed stable milestones, and used deployment feedback from GitHub Actions and Vercel to refine the production readiness of the app.