# Development Guide

## Prerequisites
- Node.js 20+
- npm or pnpm
- A Neon PostgreSQL database
- An OpenAI API key (optional for local development)
- A Vercel account for deployment

## Local Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a local environment file:
   ```bash
   cp .env.example .env
   ```
4. Add the required environment variables.

## Environment Variables
Create the following values in your environment:

```env
DATABASE_URL=your-neon-url
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret
OPENAI_API_KEY=your-openai-key
```

Notes:
- `OPENAI_API_KEY` is optional if you are not testing AI generation.
- Without `OPENAI_API_KEY`, AI insight generation returns `OPENAI_API_KEY is not configured.` while the rest of the app remains usable.
- Never commit `.env`.
- In production, set `DATABASE_URL` to your Neon production connection string.
- In production, set `NEXTAUTH_URL` to your deployed Vercel URL.

## Prisma 7 Setup Notes
This project uses Prisma 7 and a separate Prisma config file:
- prisma/schema.prisma
- prisma.config.ts

The Prisma schema uses `@@map` for tables, while the actual column names remain camelCase unless `@map` is added.

### Prisma commands
Core commands:
```bash
npx prisma validate
npx prisma format
npx prisma generate
npx prisma migrate dev
```

Other database-dependent commands:
```bash
npx prisma migrate deploy
npx prisma db push
npx prisma studio
```

## How to Add Neon Later
1. Create a PostgreSQL database in Neon.
2. Copy the connection string.
3. Set `DATABASE_URL` in `.env` or your deployment environment.
4. Run the migration command.

## Local Development
Start the app locally:
```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

Then open:
- http://localhost:3000

Build check:
```bash
npm run build
```

## Testing Strategy
Recommended checks during development:
- Validate forms with Zod and react-hook-form
- Manually test sign-in/sign-up flows
- Test CRUD for applications
- Test reminder creation/completion
- Test AI insight generation with a valid job description
- Verify dashboard analytics render correctly

Suggested commands:
```bash
npm run lint
npm run build
```

## Deployment to Vercel
1. Push the repository to GitHub.
2. Create a Vercel project.
3. Import the repository.
4. Add environment variables in Vercel:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `OPENAI_API_KEY`
5. Trigger a deployment.
6. Verify auth, database access, and AI route behavior in production.

Production notes:
- Use your Neon production connection string for `DATABASE_URL`.
- Set `NEXTAUTH_URL` to your Vercel production domain (for example `https://your-app.vercel.app`).
- `OPENAI_API_KEY` is optional unless real AI generation is required.

## Production Checklist
- `npm run build` passes.
- Prisma migrations are applied to production (`npx prisma migrate deploy`).
- Vercel environment variables are configured.
- Signup/signin is tested in production.
- Applications/resumes/reminders flows are tested in production.

## Final Buffer / Demo Prep
The last day of the plan should be used for:
- final bug fixes
- demo recording
- screenshot capture
- README polish
- deployment verification
