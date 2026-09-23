// app/api/music/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'public/music';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin
    const isAdmin = req.headers.get('x-admin-verified') === 'true';
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Sanitize ID to prevent directory traversal
    if (!id.match(/^[a-f0-9]{16}$/i)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    // Find and delete the file
    try {
      const files = await fs.readdir(UPLOAD_DIR);
      const file = files.find(f => f.startsWith(id));
      
      if (!file) {
        return NextResponse.json(
          { error: 'Track not found' },
          { status: 404 }
        );
      }

      const filepath = path.join(UPLOAD_DIR, file);
      await fs.unlink(filepath);

      return NextResponse.json(
        { message: 'Track deleted' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete track' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
