import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const newFeedback = await prisma.userMessageBox.create({
      data: {
        message: message.trim(),
      },
    });

    return NextResponse.json({ success: true, feedback: newFeedback });
  } catch (error) {
    console.error("Error saving user message:", error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
