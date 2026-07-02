'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteMessage(id) {
  try {
    await prisma.userMessageBox.delete({
      where: { id }
    });
    revalidatePath('/admin/users/messages');
  } catch (error) {
    console.error("Failed to delete message:", error);
  }
}

export async function deleteMessages(ids) {
  try {
    await prisma.userMessageBox.deleteMany({
      where: { id: { in: ids } }
    });
    revalidatePath('/admin/users/messages');
  } catch (error) {
    console.error("Failed to delete messages:", error);
  }
}

export async function createMessage(formData) {
  try {
    const message = formData.get('message');
    if (!message || message.trim() === '') return;

    await prisma.userMessageBox.create({
      data: {
        message: message.trim()
      }
    });
    revalidatePath('/admin/users/messages');
  } catch (error) {
    console.error("Failed to create message:", error);
  }
}

export async function restoreMessage(data) {
  try {
    await prisma.userMessageBox.upsert({
      where: { id: data.id },
      update: {
        message: data.message,
      },
      create: {
        id: data.id,
        message: data.message,
        createdAt: new Date(data.createdAt)
      }
    });
    revalidatePath('/admin/users/messages');
  } catch (error) {
    console.error("Failed to restore message:", error);
  }
}

export async function restoreMessages(items) {
  try {
    await prisma.$transaction(
      items.map(item =>
        prisma.userMessageBox.upsert({
          where: { id: item.id },
          update: { message: item.message },
          create: {
            id: item.id,
            message: item.message,
            createdAt: new Date(item.createdAt)
          }
        })
      )
    );
    revalidatePath('/admin/users/messages');
  } catch (error) {
    console.error("Failed to restore messages:", error);
  }
}
