import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  return NextResponse.json({ message: 'Applications API placeholder' });
}

export async function POST() {
  return NextResponse.json({ message: 'Create application placeholder' });
}
