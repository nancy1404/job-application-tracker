import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { WeeklyGoalType } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { weeklyGoalsUpsertSchema } from '@/lib/validations';

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(details ? { error: message, details } : { error: message }, { status });
}

function getSessionUserId(session: Awaited<ReturnType<typeof getServerSession>>) {
  return (session as { user?: { id?: string } } | null)?.user?.id;
}

function normalizeWeekStartDate(value: Date) {
  const weekStartDate = new Date(value);
  const dayIndex = (weekStartDate.getDay() + 6) % 7;
  weekStartDate.setDate(weekStartDate.getDate() - dayIndex);
  weekStartDate.setHours(0, 0, 0, 0);
  return weekStartDate;
}

const weeklyGoalSelect = {
  id: true,
  goalType: true,
  targetCount: true,
  weekStartDate: true,
  createdAt: true,
  updatedAt: true,
} as const;

function parseWeekStartQuery(searchParams: URLSearchParams) {
  const rawWeekStart = searchParams.get('weekStart');

  if (!rawWeekStart) {
    return null;
  }

  const parsed = new Date(rawWeekStart);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return normalizeWeekStartDate(parsed);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const weekStartDate = parseWeekStartQuery(new URL(request.url).searchParams);

  if (!weekStartDate) {
    return jsonError('Validation failed', 400, { weekStart: ['A valid weekStart query parameter is required.'] });
  }

  const weeklyGoals = await prisma.weeklyGoal.findMany({
    where: {
      userId,
      weekStartDate,
    },
    orderBy: {
      goalType: 'asc',
    },
    select: weeklyGoalSelect,
  });

  return NextResponse.json({ weeklyGoals, weekStartDate });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = weeklyGoalsUpsertSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
  }

  const weekStartDate = normalizeWeekStartDate(parsed.data.weekStartDate);

  const weeklyGoals = await prisma.$transaction(async (transaction) => {
    // Replace the entire set for this user/week so omitted goals are removed explicitly.
    await transaction.weeklyGoal.deleteMany({
      where: {
        userId,
        weekStartDate,
      },
    });

    if (parsed.data.goals.length > 0) {
      await transaction.weeklyGoal.createMany({
        data: parsed.data.goals.map((goal) => ({
          userId,
          weekStartDate,
          goalType: goal.goalType as WeeklyGoalType,
          targetCount: goal.targetCount,
        })),
      });
    }

    return transaction.weeklyGoal.findMany({
      where: {
        userId,
        weekStartDate,
      },
      orderBy: {
        goalType: 'asc',
      },
      select: weeklyGoalSelect,
    });
  });

  return NextResponse.json({ weeklyGoals, weekStartDate });
}