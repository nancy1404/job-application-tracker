import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateResumeSchema } from '@/lib/validations';

type RouteContext = {
  params: {
    id: string;
  };
};

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(details ? { error: message, details } : { error: message }, { status });
}

function getSessionUserId(session: Awaited<ReturnType<typeof getServerSession>>) {
  return (session as { user?: { id?: string } } | null)?.user?.id;
}

function hasOwnProperty(object: unknown, key: string) {
  return Boolean(object && typeof object === 'object' && Object.prototype.hasOwnProperty.call(object, key));
}

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const resume = await prisma.resume.findFirst({
    where: {
      id: params.id,
      userId,
    },
  });

  if (!resume) {
    return jsonError('Resume not found', 404);
  }

  return NextResponse.json({ resume });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateResumeSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
  }

  const existingResume = await prisma.resume.findFirst({
    where: {
      id: params.id,
      userId,
    },
  });

  if (!existingResume) {
    return jsonError('Resume not found', 404);
  }

  const data = parsed.data;
  const shouldSetDefault = data.isDefault === true;
  const updateData: {
    title?: string;
    content?: string;
    isDefault?: boolean;
  } = {};

  if (hasOwnProperty(body, 'title')) {
    updateData.title = data.title;
  }

  if (hasOwnProperty(body, 'content')) {
    updateData.content = data.content;
  }

  if (hasOwnProperty(body, 'isDefault')) {
    updateData.isDefault = data.isDefault;
  }

  const resume = shouldSetDefault
    ? (
        await prisma.$transaction([
          prisma.resume.updateMany({
            where: {
              userId,
              isDefault: true,
              id: {
                not: params.id,
              },
            },
            data: {
              isDefault: false,
            },
          }),
          prisma.resume.update({
            where: {
              id: params.id,
            },
            data: updateData,
          }),
        ])
      )[1]
    : await prisma.resume.update({
        where: {
          id: params.id,
        },
        data: updateData,
      });

  return NextResponse.json({ resume });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  const existingResume = await prisma.resume.findFirst({
    where: {
      id: params.id,
      userId,
    },
  });

  if (!existingResume) {
    return jsonError('Resume not found', 404);
  }

  await prisma.resume.delete({
    where: {
      id: params.id,
    },
  });

  return NextResponse.json({ success: true });
}