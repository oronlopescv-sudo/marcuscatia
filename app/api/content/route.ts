import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json({ error: 'Category required' }, { status: 400 });
    }

    const results = await query(
      'SELECT * FROM site_content WHERE category = ? ORDER BY createdAt DESC',
      [category]
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Content GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: ContentItem = await request.json();

    if (!data.title || !data.category) {
      return NextResponse.json(
        { error: 'Title and category required' },
        { status: 400 }
      );
    }

    const id = `${data.category}-${Date.now()}`;
    const now = new Date().toISOString();

    await query(
      `INSERT INTO site_content (id, title, description, content, category, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.title, data.description || null, data.content || null, data.category, now, now]
    );

    return NextResponse.json({ id, ...data, createdAt: now, updatedAt: now });
  } catch (error) {
    console.error('Content POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
