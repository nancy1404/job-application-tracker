# PostgreSQL Database Schema for Job Application Tracker with AI Match Insights

## 1. Recommended Data Model

This schema is designed for a realistic 3-week portfolio MVP and is intentionally simple, secure, and easy to explain in interviews.

### Prisma naming note
The Prisma schema uses @@map for table names, so table names are snake_case in PostgreSQL (for example, users, job_applications, ai_insights). However, Prisma field names remain camelCase unless @map is added explicitly. In practice, this means the actual database columns will use names like createdAt, updatedAt, emailVerified, passwordHash, applicationId, resumeId, and matchScore.

### Core design principles
- One authenticated user owns their data.
- Applications are linked to a company and to zero or more reminders and AI insights.
- Resume versions are stored separately so the user can keep multiple drafts.
- AI insights are generated on demand and saved for later reuse.
- The schema favors clarity and practicality over over-engineering.
- The app logic should enforce only one default resume per user.
- The application code should validate matchScore as an integer from 0 to 100 using Zod.

### Tables / models

1. User
   - Represents an authenticated job seeker.
2. Account
   - Supports Auth.js provider-based and credential-based authentication.
3. Session
   - Stores session tokens for Auth.js.
4. VerificationToken
   - Supports email-based verification flows if needed.
5. Resume
   - Stores one saved resume version for a user.
6. Company
   - Stores company metadata for reuse across applications.
7. JobApplication
   - Stores each job application the user tracks.
8. Reminder
   - Stores follow-up or interview reminders.
9. AiInsight
   - Stores AI-generated match analysis for a specific application and resume.

---

## 2. Table Design Summary

### User
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | String | Yes | cuid() | Primary key |
| name | String | No | null | Optional display name |
| email | String | Yes | - | Unique |
| emailVerified | DateTime | No | null | Auth.js support; actual DB column name is emailVerified |
| image | String | No | null | Optional avatar |
| passwordHash | String | No | null | Nullable for OAuth users; actual DB column name is passwordHash |
| createdAt | DateTime | Yes | now() | Actual DB column name is createdAt |
| updatedAt | DateTime | Yes | now() | Actual DB column name is updatedAt |

### Account
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | String | Yes | cuid() | Primary key |
| userId | String | Yes | - | FK to User |
| type | String | Yes | - | Auth.js account type |
| provider | String | Yes | - | e.g. credentials, github |
| providerAccountId | String | Yes | - | Unique per provider |
| refresh_token | String | No | null | |
| access_token | String | No | null | |
| expires_at | Int | No | null | |
| token_type | String | No | null | |
| scope | String | No | null | |
| id_token | String | No | null | |
| session_state | String | No | null | |

### Session
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | String | Yes | cuid() | Primary key |
| sessionToken | String | Yes | - | Unique |
| userId | String | Yes | - | FK to User |
| expires | DateTime | Yes | - | Session expiry |

### VerificationToken
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| identifier | String | Yes | - | |
| token | String | Yes | - | Unique |
| expires | DateTime | Yes | - | |

### Resume
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | String | Yes | cuid() | Primary key |
| userId | String | Yes | - | FK to User |
| title | String | Yes | "Untitled Resume" | |
| content | String | Yes | - | Resume text |
| isDefault | Boolean | Yes | false | Default resume for analysis |
| createdAt | DateTime | Yes | now() | |
| updatedAt | DateTime | Yes | now() | |

### Company
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | String | Yes | cuid() | Primary key |
| userId | String | Yes | - | FK to User |
| name | String | Yes | - | |
| website | String | No | null | |
| location | String | No | null | |
| createdAt | DateTime | Yes | now() | |
| updatedAt | DateTime | Yes | now() | |

### JobApplication
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | String | Yes | cuid() | Primary key |
| userId | String | Yes | - | FK to User |
| companyId | String | No | null | FK to Company |
| title | String | Yes | - | Job title |
| jobUrl | String | No | null | Optional link to the original job posting |
| description | String | No | null | Optional job description |
| status | ApplicationStatus | Yes | SAVED | Enum |
| appliedDate | DateTime | No | null | |
| notes | String | No | null | Optional notes |
| createdAt | DateTime | Yes | now() | |
| updatedAt | DateTime | Yes | now() | |

### Reminder
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | String | Yes | cuid() | Primary key |
| userId | String | Yes | - | FK to User |
| applicationId | String | No | null | FK to JobApplication |
| title | String | Yes | - | Reminder title |
| dueDate | DateTime | Yes | - | Reminder deadline |
| status | ReminderStatus | Yes | PENDING | Enum |
| notes | String | No | null | Optional note |
| createdAt | DateTime | Yes | now() | |
| updatedAt | DateTime | Yes | now() | |

### AiInsight
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | String | Yes | cuid() | Primary key |
| userId | String | Yes | - | FK to User |
| applicationId | String | Yes | - | FK to JobApplication; actual DB column name is applicationId |
| resumeId | String | Yes | - | FK to Resume; actual DB column name is resumeId |
| matchScore | Int | Yes | - | 0-100; actual DB column name is matchScore |
| summary | String | No | null | Short written summary |
| strengths | Json | No | null | Array of strengths |
| gaps | Json | No | null | Array of missing skills/keywords |
| suggestions | Json | No | null | Improvement suggestions |
| rawResponse | Json | No | null | Optional full model response |
| modelName | String | No | null | e.g. gpt-4o-mini |
| generatedAt | DateTime | Yes | now() | |
| createdAt | DateTime | Yes | now() | |
| updatedAt | DateTime | Yes | now() | |

---

## 3. Application Status Design

### Recommendation: Use an enum
For this MVP, an enum is the best fit because application status is a small, fixed set of values and it keeps the schema easy to understand.

### Recommended statuses
- SAVED
- APPLIED
- INTERVIEW
- OFFER
- REJECTED
- ARCHIVED

### Why not a separate status table?
A separate table would be overkill for this scope because:
- there are only six statuses,
- they will rarely change,
- the UI can easily map them to badges and filters.

---

## 4. AI Insight Storage Design

### Recommendation: Store the main result fields directly in AiInsight
For v1, this is the simplest and most practical design.

### Store these fields
- matchScore: integer 0–100
- summary: short summary string
- strengths: JSON array of strings
- gaps: JSON array of strings
- suggestions: JSON array of strings
- rawResponse: optional full JSON response from OpenAI
- modelName: model used for generation
- generatedAt: timestamp

### Why not separate tables for each AI field?
A separate table would be unnecessary for a small MVP because the insight is naturally treated as one record per application+resume pair.

### Relationship design
- One AiInsight belongs to one application.
- One AiInsight belongs to one resume.
- One user can have many AI insights.

### Constraint suggestion
To prevent duplicate generation for the same application+resume pairing, add a unique constraint on (applicationId, resumeId).

---

## 5. Dashboard Analytics Support

The schema supports the following analytics without needing extra tables:

### Total applications
- Count rows in JobApplication where userId = current user.

### Applications by status
- Group JobApplication rows by status.

### Upcoming reminders
- Query Reminder rows where userId = current user and status = PENDING and dueDate >= now().

### Response rate
- Compute as:
  - number of applications in OFFER or INTERVIEW / total applications applied
  - or more simply, count of applications with status OFFER or INTERVIEW and compare against total applications.

### Recent activity
- Use createdAt/updatedAt timestamps from JobApplication, Reminder, and AiInsight.

---

## 6. SQL Schema (PostgreSQL)

```sql
CREATE TYPE application_status AS ENUM (
  'SAVED',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'ARCHIVED'
);

CREATE TYPE reminder_status AS ENUM (
  'PENDING',
  'COMPLETED'
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  emailVerified TIMESTAMPTZ,
  image TEXT,
  passwordHash TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  sessionToken TEXT NOT NULL UNIQUE,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE resumes (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Resume',
  content TEXT NOT NULL,
  isDefault BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT,
  location TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(userId, name)
);

CREATE TABLE job_applications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  companyId TEXT REFERENCES companies(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  jobUrl TEXT,
  description TEXT,
  status application_status NOT NULL DEFAULT 'SAVED',
  appliedDate TIMESTAMPTZ,
  notes TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  applicationId TEXT REFERENCES job_applications(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  dueDate TIMESTAMPTZ NOT NULL,
  status reminder_status NOT NULL DEFAULT 'PENDING',
  notes TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_insights (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  applicationId TEXT NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  resumeId TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  matchScore INTEGER NOT NULL CHECK (matchScore BETWEEN 0 AND 100),
  summary TEXT,
  strengths JSONB,
  gaps JSONB,
  suggestions JSONB,
  rawResponse JSONB,
  modelName TEXT,
  generatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(applicationId, resumeId)
);

CREATE INDEX idx_resumes_user_created ON resumes("userId", "createdAt");
CREATE INDEX idx_companies_user_name ON companies("userId", name);
CREATE INDEX idx_job_applications_user_status ON job_applications("userId", status);
CREATE INDEX idx_job_applications_user_created ON job_applications("userId", "createdAt");
CREATE INDEX idx_reminders_user_status_due ON reminders("userId", status, "dueDate");
CREATE INDEX idx_ai_insights_user_application ON ai_insights("userId", "applicationId");
```

---

## 7. Key Design Decisions

### Why User exists
The User table is the root of the data model. Every piece of user-owned data should be associated with a user for secure access control.

### Why Account, Session, VerificationToken exist
These tables are included to support Auth.js cleanly and make authentication integration straightforward.

### Why Resume is separate from JobApplication
Resumes are not just one field on an application because the user may save multiple versions and compare them against different jobs over time.

### Why Resume.isDefault exists
The schema keeps isDefault so the app can support a single primary resume per user. The application logic should enforce that only one resume is marked as default for each user.

### Why Company is separate
The company is a reusable entity. Storing it separately avoids duplication and makes it easier to build future features like company history or employer tracking.

### Why AiInsight is separate
AI results are a distinct entity because they need their own lifecycle, timestamps, and possible future expansion.

### Why matchScore is validated in application code
The schema stores matchScore as an integer, but the app should validate it with Zod as an integer from 0 to 100 before saving or displaying it.

### Why the schema stays simple for v1
The MVP does not need:
- multi-user teams
- complex collaboration tables
- recurring reminders
- OCR or PDF extraction
- separate analytics tables

Those can be added in v2.

---

## 8. v2 Expansion Opportunities

The schema can be expanded later to support:
- resume file storage with object storage
- multiple AI insight versions per application
- recurring reminders
- tags and custom labels
- interview stages and interview notes
- analytics snapshots or reporting tables
- sharing with mentors or recruiters

---

## 9. Final Recommendation
Use the schema above as the MVP foundation. It is professional, simple, and realistic for a 3-week portfolio project while still demonstrating strong database design and full-stack thinking.
