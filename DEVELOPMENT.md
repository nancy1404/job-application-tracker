# Development Guide

## Prerequisites
- Node.js 20+
- npm or pnpm
- A Neon PostgreSQL database (when ready)
- An OpenAI API key (for AI insights)
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
DATABASE_URL=your-placeholder-or-neon-url
OPENAI_API_KEY=your-openai-key
AUTH_SECRET=your-random-secret
AUTH_URL=http://localhost:3000
```

> This project uses `AUTH_SECRET` and `AUTH_URL` consistently for Auth.js. Older examples may mention `NEXTAUTH_SECRET` and `NEXTAUTH_URL`, but this project should use `AUTH_SECRET` and `AUTH_URL` unless the auth setup changes.
>
> The project is currently ready for Prisma setup and local validation. A real Neon `DATABASE_URL` is still required before running migration or database-dependent commands.

## Prisma 7 Setup Notes
This project uses Prisma 7 and a separate Prisma config file:
- prisma/schema.prisma
- prisma.config.ts

The Prisma schema uses `@@map` for tables, while the actual column names remain camelCase unless `@map` is added.

### Prisma commands
Run these without a real database URL for local validation:
```bash
npx prisma validate
npx prisma format
npx prisma generate
```

Once a real Neon database URL is available, run:
```bash
npx prisma migrate dev --name init
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
npx prisma generate
npm run dev
```

Then open:
- http://localhost:3000

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
   - `OPENAI_API_KEY`
   - `AUTH_SECRET`
   - `AUTH_URL`
5. Trigger a deployment.
6. Verify auth, database access, and AI route behavior in production.

## Final Buffer / Demo Prep
The last day of the plan should be used for:
- final bug fixes
- demo recording
- screenshot capture
- README polish
- deployment verification
