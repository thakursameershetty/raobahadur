import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const visitorRecord = await prisma.visitorCount.findUnique({
      where: { id: 1 },
    });
    return NextResponse.json({ count: visitorRecord ? visitorRecord.count : 0 });
  } catch (error) {
    console.error("Error fetching visitor count:", error);
    return NextResponse.json({ error: 'Failed to fetch visitor count' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const visitorRecord = await prisma.visitorCount.upsert({
      where: { id: 1 },
      update: {
        count: {
          increment: 1,
        },
      },
      create: {
        id: 1,
        count: 1,
      },
    });
    return NextResponse.json({ count: visitorRecord.count });
  } catch (error) {
    console.error("Error updating visitor count:", error);
    return NextResponse.json({ error: 'Failed to update visitor count' }, { status: 500 });
  }
}
