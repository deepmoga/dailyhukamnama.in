import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { forceRegeneratePoster } from '@/lib/hukamnama-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publicBgPath = path.join(process.cwd(), 'public', 'assets', 'images', 'bg.jpg');
    if (!fsSync.existsSync(publicBgPath)) {
      return NextResponse.json({
        success: true,
        exists: false,
        message: 'Background image does not exist yet',
      });
    }

    const stat = await fs.stat(publicBgPath);
    return NextResponse.json({
      success: true,
      exists: true,
      url: `/assets/images/bg.jpg?t=${stat.mtimeMs}`,
      size: stat.size,
      updatedAt: stat.mtime,
    });
  } catch (err) {
    console.error('Error fetching template background:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') || formData.get('image');
    const autoRegenerate = formData.get('regenerate') === 'true' || formData.get('regenerate') === '1';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Target directories
    const publicDir = path.join(process.cwd(), 'public', 'assets', 'images');
    const rootAssetsDir = path.join(process.cwd(), 'assets', 'images');
    const backupDir = path.join(publicDir, 'backups');

    await fs.mkdir(publicDir, { recursive: true });
    await fs.mkdir(rootAssetsDir, { recursive: true });
    await fs.mkdir(backupDir, { recursive: true });

    const publicBgPath = path.join(publicDir, 'bg.jpg');
    const rootBgPath = path.join(rootAssetsDir, 'bg.jpg');

    // Backup existing bg.jpg if present
    if (fsSync.existsSync(publicBgPath)) {
      const backupPath = path.join(backupDir, `bg_${Date.now()}.jpg`);
      await fs.copyFile(publicBgPath, backupPath);
    }

    // Write new background image
    await fs.writeFile(publicBgPath, buffer);
    try {
      await fs.writeFile(rootBgPath, buffer);
    } catch (e) {
      console.warn('Could not write to root assets dir:', e.message);
    }

    let regenResult = null;
    if (autoRegenerate) {
      try {
        regenResult = await forceRegeneratePoster();
      } catch (e) {
        console.warn('Could not auto-regenerate poster:', e.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Background template image updated successfully!',
      url: `/assets/images/bg.jpg?t=${Date.now()}`,
      regenerated: regenResult,
    });
  } catch (err) {
    console.error('Error saving template background:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const dateStr = body?.dateStr || null;
    const result = await forceRegeneratePoster(dateStr);
    return NextResponse.json({
      success: true,
      message: 'Posters regenerated successfully!',
      result,
    });
  } catch (err) {
    console.error('Error regenerating posters:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
