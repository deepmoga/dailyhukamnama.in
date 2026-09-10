import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') || formData.get('image');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get current year and month for subfolder organization (e.g. 2026/09)
    const now = new Date();
    const yearStr = String(now.getFullYear());
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');

    // Ensure uploads/YYYY/MM directory exists
    const datedUploadsDir = path.join(process.cwd(), 'public', 'uploads', yearStr, monthStr);
    await fs.mkdir(datedUploadsDir, { recursive: true });

    // Clean filename
    const originalName = file.name || 'image.jpg';
    const ext = path.extname(originalName) || '.jpg';
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${Date.now()}_${baseName}${ext}`;
    const filePath = path.join(datedUploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${yearStr}/${monthStr}/${filename}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: buffer.length,
    });
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: 'File upload failed: ' + err.message }, { status: 500 });
  }
}
