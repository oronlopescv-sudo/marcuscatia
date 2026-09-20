import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

const UPLOAD_DIR = 'public/uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only images allowed' }, { status: 400 });
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Converter arquivo para buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Gerar nome único
    const ext = file.name.split('.').pop();
    const filename = `${randomBytes(8).toString('hex')}.${ext}`;
    const filepath = join(process.cwd(), UPLOAD_DIR, filename);

    // Criar diretório se não existir
    try {
      await mkdir(join(process.cwd(), UPLOAD_DIR), { recursive: true });
    } catch (err) {
      // Diretório já existe
    }

    // Salvar arquivo
    await writeFile(filepath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
    }, { status: 201 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
