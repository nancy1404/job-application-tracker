# API Specification

## Overview
This project uses Next.js Route Handlers for backend logic. The API is REST-style and is designed for an authenticated single-user MVP.

## Authentication
All protected endpoints require an active Auth.js session. Requests without a valid session should return `401 Unauthorized`.

Auth.js handles sign-in, sign-out, and session management through its configured route handler, typically `/api/auth/[...nextauth]`. If you implement a custom credentials signup flow, a custom route such as `POST /api/auth/signup` may be used.

## Conventions
- JSON request and response bodies
- Standard success responses return `200` or `201`
- Validation failures return `400`
- Not found returns `404`
- Unauthorized returns `401`
- Server errors return `500`

---

## Auth Endpoints

### POST /api/auth/signup
Create a new user account when a custom credentials signup flow is implemented.

Request body:
```json
{
  "email": "student@example.com",
  "password": "securepassword"
}
```

Success response:
```json
{
  "user": {
    "id": "clx123",
    "email": "student@example.com"
  }
}
```

Auth.js handles sign-in, sign-out, and session management through its configured route handler, typically `/api/auth/[...nextauth]`. In most setups, you do not manually implement `POST /api/auth/signin`, `POST /api/auth/signout`, or `GET /api/auth/session` as custom routes.

---

## Applications Endpoints

### GET /api/applications
Return all applications for the authenticated user.

Query params:
- `status` optional
- `search` optional

Success response:
```json
[
  {
    "id": "app_1",
    "title": "Frontend Developer",
    "companyId": "cmp_1",
    "jobUrl": "https://example.com/jobs/1",
    "description": "Build UI components for a SaaS product.",
    "status": "APPLIED",
    "appliedDate": "2026-06-20T10:00:00.000Z",
    "notes": "Follow up next week.",
    "createdAt": "2026-06-20T10:00:00.000Z",
    "updatedAt": "2026-06-20T10:00:00.000Z"
  }
]
```

### POST /api/applications
Create a new application.

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

Validation rules:
- `title` is required
- `status` must be one of: `SAVED`, `APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`, `ARCHIVED`
- `description` is optional in v1, but required for AI insight generation

### GET /api/applications/[id]
Return one application by ID.

### PATCH /api/applications/[id]
Update an existing application.

### DELETE /api/applications/[id]
Delete an application.

Behavior:
- Related `AiInsight` rows are deleted by cascade.
- Related `Reminder` rows are kept but detached because `applicationId` uses `onDelete: SetNull`.

---

## Companies Endpoints

### GET /api/companies
Return companies for the current user.

### POST /api/companies
Create a new company.

Request body:
```json
{
  "name": "Example Labs",
  "website": "https://examplelabs.com",
  "location": "Remote"
}
```

---

## Resumes Endpoints

### GET /api/resumes
Return all saved resumes for the current user.

### POST /api/resumes
Create a new resume version.

Request body:
```json
{
  "title": "Resume - June 2026",
  "content": "Experienced frontend developer with React and TypeScript experience.",
  "isDefault": true
}
```

Validation rules:
- `content` is required
- `isDefault` is boolean
- Application logic should enforce only one default resume per user

### PATCH /api/resumes/[id]
Update a resume.

---

## Reminders Endpoints

### GET /api/reminders
Return reminders for the authenticated user.

### POST /api/reminders
Create a reminder.

Request body:
```json
{
  "title": "Follow up with recruiter",
  "dueDate": "2026-06-25T09:00:00.000Z",
  "notes": "Send a thank-you note.",
  "applicationId": "app_1"
}
```

### PATCH /api/reminders/[id]
Mark a reminder as completed or update its fields.

### DELETE /api/reminders/[id]
Delete a reminder.

---

## AI Insight Endpoints

### POST /api/applications/[applicationId]/insights
Generate AI match insights for a selected application and resume.

Request body:
```json
{
  "resumeId": "resume_1"
}
```

Validation rules:
- `resumeId` is required
- The application must have a non-empty job description
- The route should reject the request if the application description is missing
- `AiInsight` is unique per application/resume pair

Success response:
```json
{
  "id": "insight_1",
  "applicationId": "app_1",
  "resumeId": "resume_1",
  "matchScore": 86,
  "summary": "Strong frontend fit with a few gaps in backend experience.",
  "strengths": ["React", "TypeScript", "UI systems"],
  "gaps": ["Node.js", "API design"],
  "suggestions": ["Highlight backend projects", "Add more API examples"],
  "modelName": "gpt-4o-mini",
  "generatedAt": "2026-06-20T10:00:00.000Z"
}
```

### GET /api/applications/[applicationId]/insights?resumeId=...
Return the saved AI insight for a specific application and resume if one exists.

---

## Dashboard Analytics Endpoints

### GET /api/analytics/dashboard
Return summary data for the dashboard.

Success response:
```json
{
  "totalApplications": 8,
  "applicationsByStatus": {
    "SAVED": 2,
    "APPLIED": 4,
    "INTERVIEW": 1,
    "OFFER": 0,
    "REJECTED": 1,
    "ARCHIVED": 0
  },
  "upcomingReminders": 3,
  "recentActivity": [
    {
      "type": "application",
      "title": "Frontend Developer",
      "createdAt": "2026-06-20T10:00:00.000Z"
    }
  ]
}
```

---

## Error Handling
Common error responses:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

Other errors:
- `401` for missing authentication
- `404` for missing resources
- `400` for invalid payloads
- `500` for unexpected server failures

---

## Validation Notes
- All request bodies should be validated with Zod.
- AI insight generation should validate that the job description exists before calling OpenAI.
- `matchScore` should be validated as an integer between 0 and 100 in application code.
