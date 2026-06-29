import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { generateAiInsight, openai } from '@/lib/ai';
import { prisma } from '@/lib/prisma';
import { createAiInsightRequestSchema } from '@/lib/validations';

const aiInsightResponseSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  summary: z.string().min(1),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  suggestions: z.array(z.string()),
});

type RouteContext = {
  params: {
    id?: string;
  };
};

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(details ? { error: message, details } : { error: message }, { status });
}

function getSessionUserId(session: Awaited<ReturnType<typeof getServerSession>>) {
  return (session as { user?: { id?: string } } | null)?.user?.id;
}

function extractJsonResponse(text: string) {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const startIndex = trimmed.indexOf('{');
    const endIndex = trimmed.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      throw new Error('AI response was not valid JSON.');
    }

    return JSON.parse(trimmed.slice(startIndex, endIndex + 1)) as unknown;
  }
}

export async function POST(request: Request, _context: RouteContext) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('Unauthorized', 401);
  }

  if (!openai) {
    return jsonError('OPENAI_API_KEY is not configured.', 500);
  }

  const body = await request.json().catch(() => null);
  const parsed = createAiInsightRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
  }

  const { resumeId } = parsed.data;

  const applicationId = typeof body?.applicationId === 'string' ? body.applicationId.trim() : '';
  if (!applicationId) {
    return jsonError('Validation failed', 400, { applicationId: ['Application is required'] });
  }

  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      userId,
    },
    include: {
      company: true,
    },
  });

  if (!application) {
    return jsonError('Application not found', 404);
  }

  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId,
    },
  });

  if (!resume) {
    return jsonError('Resume not found', 404);
  }

  const rawInsight = await generateAiInsight({
    title: application.title,
    description: [
      application.company?.name ? `Company: ${application.company.name}` : '',
      application.description ?? '',
    ]
      .filter(Boolean)
      .join('\n'),
    resumeContent: resume.content,
    companyName: application.company?.name ?? undefined,
  });

  let insightData: z.infer<typeof aiInsightResponseSchema>;

  try {
    const parsedInsight = extractJsonResponse(rawInsight);
    insightData = aiInsightResponseSchema.parse(parsedInsight);
  } catch (error) {
    return jsonError('Unable to parse AI response.', 500);
  }

  const insight = await prisma.aiInsight.upsert({
    where: {
      applicationId_resumeId: {
        applicationId,
        resumeId,
      },
    },
    create: {
      userId,
      applicationId,
      resumeId,
      matchScore: insightData.matchScore,
      summary: insightData.summary,
      strengths: insightData.strengths,
      gaps: insightData.gaps,
      suggestions: insightData.suggestions,
      rawResponse: insightData,
      modelName: 'gpt-4o-mini',
      generatedAt: new Date(),
    },
    update: {
      matchScore: insightData.matchScore,
      summary: insightData.summary,
      strengths: insightData.strengths,
      gaps: insightData.gaps,
      suggestions: insightData.suggestions,
      rawResponse: insightData,
      modelName: 'gpt-4o-mini',
      generatedAt: new Date(),
    },
    include: {
      application: true,
      resume: true,
    },
  });

  return NextResponse.json({ insight });
}