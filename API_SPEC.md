# API Specification

## Overview
The backend uses Next.js Route Handlers. All user data routes are ownership-scoped: a signed-in user can only read and mutate their own records.

## Authentication
- Auth route: `/api/auth/[...nextauth]` (NextAuth v4)
- Custom signup route: `POST /api/auth/signup`
- Protected routes return `401` when no valid session exists.

## Response Conventions
- `200` for successful reads/updates/deletes
- `201` for successful creates
- `400` for validation errors
- `401` for unauthenticated requests
- `404` for missing or unauthorized resource references
- `409` for unique constraint conflicts (example: duplicate company name)
- `500` for unexpected server errors

---

## Auth Endpoints

### POST /api/auth/signup
Create a credentials user.

Request body:
```json
{
  "name": "Alex",
  "email": "alex@example.com",
  "password": "password123"
}
```

### /api/auth/[...nextauth]
NextAuth v4 route handler for credentials sign-in/sign-out/session.

---

## Applications

### GET /api/applications
Return current user's applications.

### POST /api/applications
Create an application for current user.

Request body:
```json
{
  "title": "Frontend Developer",
  "companyId": "cmp_1",
  "jobUrl": "https://example.com/jobs/1",
  "description": "Build UI components for a SaaS product.",
  "status": "SAVED",
  "appliedDate": "2026-06-20T10:00:00.000Z",
  "notes": "Follow up next week."
}
```

### GET /api/applications/[id]
Return one user-owned application.

### PATCH /api/applications/[id]
Update one user-owned application.

### DELETE /api/applications/[id]
Delete one user-owned application.

---

## Companies

### GET /api/companies
Return current user's companies.

### POST /api/companies
Create a company for current user.

Request body:
```json
{
  "name": "Example Labs",
  "website": "https://examplelabs.com",
  "location": "Remote"
}
```

---

## Resumes

### GET /api/resumes
Return current user's resumes.

### POST /api/resumes
Create a resume for current user.

Request body:
```json
{
  "title": "Resume - June 2026",
  "content": "Experienced frontend developer...",
  "isDefault": true
}
```

Behavior:
- If `isDefault=true`, other user resumes are unset so only one default resume remains.

### GET /api/resumes/[id]
Return one user-owned resume.

### PATCH /api/resumes/[id]
Update one user-owned resume.

### DELETE /api/resumes/[id]
Delete one user-owned resume.

---

## Reminders

### GET /api/reminders
Return current user's reminders.

### POST /api/reminders
Create a reminder for current user.

Request body:
```json
{
  "title": "Follow up with recruiter",
  "dueDate": "2026-06-25T09:00:00.000Z",
  "status": "PENDING",
  "notes": "Send a thank-you note.",
  "applicationId": "app_1"
}
```

Behavior:
- If `applicationId` is provided, the application must belong to the current user.

### GET /api/reminders/[id]
Return one user-owned reminder.

### PATCH /api/reminders/[id]
Update one user-owned reminder.

### DELETE /api/reminders/[id]
Delete one user-owned reminder.

---

## AI Insights

### POST /api/ai-insights
Generate and upsert an AI match insight for `(applicationId, resumeId)`.

Request body:
```json
{
  "applicationId": "app_1",
  "resumeId": "resume_1"
}
```

Behavior:
- Requires ownership of both application and resume.
- Uses OpenAI through `src/lib/ai.ts`.
- Upserts `AiInsight` using unique `(applicationId, resumeId)`.
- Returns `matchScore`, `summary`, `strengths`, `gaps`, `suggestions` in saved JSON fields.

If `OPENAI_API_KEY` is missing:
- Returns a safe `500` error: `OPENAI_API_KEY is not configured.`

---

## Ownership Checks
- Applications: user-scoped
- Companies: user-scoped
- Resumes: user-scoped
- Reminders: user-scoped
- AI insight source entities (application/resume): user-scoped
