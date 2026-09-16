import fs from 'fs';
import path from 'path';
import { getPublicSettings } from '@/lib/settings-service';

export const dynamic = 'force-dynamic';

const MIME_TYPES = {
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

export async function GET() {
  try {
    const settings = await getPublicSettings();
    let relUrl = (settings?.favicon || '').trim();
    if (!relUrl) relUrl = '/logo.png';

    relUrl = relUrl.split('?')[0];

    const cleanPath = relUrl.startsWith('/') ? relUrl.slice(1) : relUrl;
    const publicDir = path.resolve(process.cwd(), 'public');
    let targetPath = path.resolve(publicDir, cleanPath);

    if (!fs.existsSync(targetPath) || fs.statSync(targetPath).isDirectory()) {
      targetPath = path.resolve(publicDir, 'logo.png');
    }

    if (!fs.existsSync(targetPath)) {
      return new Response('Favicon not found', { status: 404 });
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'image/x-icon';
    const buffer = await fs.promises.readFile(targetPath);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('Favicon.ico serve error:', err);
    return new Response('Error serving favicon', { status: 500 });
  }
}
