import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';
import { authOptions } from '@/lib/auth';

const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_RESUME_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]);

type UploadTokenRequestBody = {
  fileName?: unknown;
  contentType?: unknown;
  fileSizeBytes?: unknown;
};

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(details ? { error: message, details } : { error: message }, { status });
}

function getSessionUserId(session: Awaited<ReturnType<typeof getServerSession>>) {
  return (session as { user?: { id?: string } } | null)?.user?.id;
}

function sanitizeFilename(fileName: string) {
  const withoutPath = fileName.split(/[\\/]/).pop() ?? '';

  return withoutPath
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^[-._]+|[-._]+$/g, '');
}

function getValidatedUploadMetadata(body: UploadTokenRequestBody) {
  const rawFileName = typeof body.fileName === 'string' ? body.fileName : '';
  const safeFileName = sanitizeFilename(rawFileName);
  const contentType = typeof body.contentType === 'string' ? body.contentType : '';
  const fileSizeBytes = typeof body.fileSizeBytes === 'number' ? body.fileSizeBytes : Number.NaN;

  const invalidReasons: string[] = [];

  if (!safeFileName) {
    invalidReasons.push('File name is required.');
  }

  if (safeFileName.length > 180) {
    invalidReasons.push('File name is too long.');
  }

  if (!ALLOWED_RESUME_MIME_TYPES.has(contentType)) {
    invalidReasons.push('Unsupported file type.');
  }

  if (!Number.isFinite(fileSizeBytes) || !Number.isInteger(fileSizeBytes) || fileSizeBytes < 1) {
    invalidReasons.push('File size must be a positive integer.');
  }

  if (Number.isFinite(fileSizeBytes) && fileSizeBytes > MAX_RESUME_FILE_SIZE_BYTES) {
    invalidReasons.push('File exceeds 5 MB limit.');
  }

  if (invalidReasons.length > 0) {
    return {
      success: false as const,
      errors: invalidReasons,
    };
  }

  return {
    success: true as const,
    safeFileName,
    contentType,
    fileSizeBytes,
  };
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return jsonError('unauthenticated', 401);
  }

  const readWriteToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!readWriteToken) {
    return jsonError('upload token unavailable/config error', 500);
  }

  const body = (await request.json().catch(() => null)) as UploadTokenRequestBody | null;

  if (!body) {
    return jsonError('invalid file metadata', 400, {
      file: ['Request body is required.'],
    });
  }

  const validated = getValidatedUploadMetadata(body);

  if (!validated.success) {
    return jsonError('invalid file metadata', 400, {
      file: validated.errors,
    });
  }

  const pathname = `resumes/${userId}/${Date.now()}-${validated.safeFileName}`;

  try {
    const clientToken = await generateClientTokenFromReadWriteToken({
      token: readWriteToken,
      pathname,
      allowedContentTypes: [validated.contentType],
      maximumSizeInBytes: MAX_RESUME_FILE_SIZE_BYTES,
      validUntil: Date.now() + 10 * 60 * 1000,
    });

    return NextResponse.json({
      clientToken,
      pathname,
      maxFileSizeBytes: MAX_RESUME_FILE_SIZE_BYTES,
      allowedContentTypes: Array.from(ALLOWED_RESUME_MIME_TYPES),
    });
  } catch {
    return jsonError('upload token unavailable/config error', 500);
  }
}
