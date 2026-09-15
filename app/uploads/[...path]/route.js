import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};

export async function GET(request, { params }) {
  try {
    const rawPathSegments = params?.path || [];
    const relativePath = Array.isArray(rawPathSegments)
      ? rawPathSegments.join('/')
      : String(rawPathSegments);

    const uploadsBaseDir = path.resolve(process.cwd(), 'public', 'uploads');
    const safeFilePath = path.resolve(uploadsBaseDir, relativePath);

    // Prevent directory traversal attacks
    if (!safeFilePath.startsWith(uploadsBaseDir)) {
      return new Response('Forbidden', { status: 403 });
    }

    if (!fs.existsSync(safeFilePath) || fs.statSync(safeFilePath).isDirectory()) {
      return new Response('Not Found', { status: 404 });
    }

    const ext = path.extname(safeFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const fileBuffer = await fs.promises.readFile(safeFilePath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving upload file:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
