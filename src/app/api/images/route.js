import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary config is automatically loaded from process.env.CLOUDINARY_URL

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      orderBy: { createdAt: 'asc' } // Sorted from oldest to newest for sequential grid rendering
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error("GET images error:", error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');
    const uploader = data.get('uploader') || 'Anonymous';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer for Cloudinary stream upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using upload_stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'tribute_wall' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Save image record in the database
    const savedImage = await prisma.image.create({
      data: {
        url: uploadResult.secure_url,
        uploader: uploader,
      }
    });

    return NextResponse.json(savedImage);
  } catch (error) {
    console.error("POST image error:", error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Delete all images from the database
    await prisma.image.deleteMany();
    return NextResponse.json({ message: 'Wall cleared successfully' });
  } catch (error) {
    console.error("DELETE images error:", error);
    return NextResponse.json({ error: 'Failed to clear wall' }, { status: 500 });
  }
}
