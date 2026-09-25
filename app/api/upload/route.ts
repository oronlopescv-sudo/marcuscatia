import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { IMAGE_EXTENSIONS } from '@/lib/media';

const UPLOAD_DIR = 'public/uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const ext = IMAGE_EXTENSIONS[file.type];
    if (!ext) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP or GIF images are allowed' }, { status: 400 });
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Logo uploads overwrite the site's fixed /logo.png so every page
    // that references it (Header, Hero, Footer, etc.) picks it up
    // immediately — no extra DB write or component change needed.
    if (type === 'logo') {
      const logoPath = join(process.cwd(), 'public', 'logo.png');
      await writeFile(logoPath, buffer);

      return NextResponse.json({
        success: true,
        url: '/logo.png',
        filename: 'logo.png',
        size: file.size,
      }, { status: 201 });
    }

    // Generic upload: unique filename under public/uploads
    const filename = `${randomBytes(8).toString('hex')}.${ext}`;
    const filepath = join(process.cwd(), UPLOAD_DIR, filename);

    try {
      await mkdir(join(process.cwd(), UPLOAD_DIR), { recursive: true });
    } catch {
      // Directory already exists
    }

    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      filename,
      size: file.size,
    }, { status: 201 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - remover um ficheiro local previamente carregado (body: { url })
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const url = (body?.url as string) || '';

    if (!url) {
      return NextResponse.json({ error: 'No url provided' }, { status: 400 });
    }

    // Só apaga ficheiros locais (caminhos relativos a /public). URLs externas
    // (ex.: Wix/S3) são ignoradas.
    if (url.startsWith('/')) {
      const rel = url.replace(/^\/+/, '');
      const publicDir = join(process.cwd(), 'public');
      const filepath = join(publicDir, rel);

      // Only files this app uploaded; never logo.png or build assets.
      const allowed = ['uploads', 'gallery', 'music'].some((d) => filepath.startsWith(join(publicDir, d) + '/'));
      if (allowed) {
        try {
          await unlink(filepath);
        } catch {
          // Ficheiro pode não existir — ignora
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
