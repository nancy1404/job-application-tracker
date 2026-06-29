# Job Application Tracker with AI Match Insights

A polished full-stack portfolio project for job seekers who want a simple way to organize applications, save resume versions, and get AI-powered match insights.

## Why this project?
This app combines practical product thinking with modern web development. It demonstrates:
- full-stack development with Next.js and TypeScript
- database design with Prisma and PostgreSQL
- authentication with Auth.js
- AI integration with OpenAI
- polished UI with Tailwind and shadcn/ui

## Key Features
- Secure sign-in and protected user dashboard
- Create, edit, and track job applications by status
- Save company information and job links
- Store multiple resume versions and mark one as default
- Generate AI match insights from a resume and job description
- Save AI results for later review
- Create reminders for follow-ups and interviews
- View simple dashboard analytics

## Tech Stack
- Next.js App Router
- TypeScript
- Prisma 7 + PostgreSQL on Neon
- Auth.js
- OpenAI API
- Tailwind CSS + shadcn/ui
- Zod + react-hook-form
- Recharts
- Vercel deployment

## Screenshots / Demo
Add screenshots here later:
- Landing page
- Dashboard
- Application detail page
- AI insight panel

## Local Setup
```bash
npm install
cp .env.example .env
npx prisma generate
npm run dev
```

## Environment Variables
```env
DATABASE_URL=your-neon-url
OPENAI_API_KEY=your-openai-key
AUTH_SECRET=your-random-secret
AUTH_URL=http://localhost:3000
```

> This project uses `AUTH_SECRET` and `AUTH_URL` consistently for Auth.js. Older examples may mention `NEXTAUTH_SECRET` and `NEXTAUTH_URL`, but this project should use `AUTH_SECRET` and `AUTH_URL` unless the auth setup changes.

## Prisma Notes
The project uses Prisma 7 with a dedicated Prisma config file:
- prisma/schema.prisma
- prisma.config.ts

Current commands:
```bash
npx prisma validate
npx prisma format
npx prisma generate
```

Once a real Neon database URL is available:
```bash
npx prisma migrate dev --name init
```

## MVP Scope
This version focuses on a realistic portfolio-ready experience:
- authentication
- application CRUD
- resume text storage
- reminders
- AI match insights
- dashboard analytics

## Future Improvements
- PDF resume upload and parsing
- cover letter generation
- calendar/email reminders
- richer analytics and trend charts
- import from LinkedIn or CSV

## Learning Highlights
This project is a strong portfolio example because it demonstrates:
- full-stack data modeling
- authenticated user flows
- server-side API design
- AI integration with safe, user-triggered requests
- polished UI and deployment readiness
