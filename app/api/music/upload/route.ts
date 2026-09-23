// app/api/music/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'public/music';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'];

async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin (placeholder - implement your auth)
    const isAdmin = req.headers.get('x-admin-verified') === 'true';
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = (formData.get('title') as string) || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only audio files allowed.' },
        { status: 400 }
      );
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    await ensureUploadDir();

    // Gerar nome único
    const ext = path.extname(file.name);
    const id = crypto.randomBytes(8).toString('hex');
    const filename = `${id}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Salvar ficheiro
    const buffer = await file.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(buffer));

    const track = {
      id,
      title: title || file.name.replace(ext, ''),
      url: `/music/${filename}`,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(track, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureUploadDir();
    const files = await fs.readdir(UPLOAD_DIR);
    
    const tracks = files.map((filename) => {
      const ext = path.extname(filename);
      const id = filename.replace(ext, '');
      return {
        id,
        title: id,
        url: `/music/${filename}`,
        createdAt: new Date().toISOString(),
      };
    });

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Failed to list music files:', error);
    return NextResponse.json([], { status: 200 });
  }
}
