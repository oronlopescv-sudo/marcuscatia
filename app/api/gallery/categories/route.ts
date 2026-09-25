import { getSetting, setSetting } from '@/lib/settings';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Categorias da galeria são guardadas como JSON em app_settings (chave "gallery_categories").
const KEY = 'gallery_categories';

async function getCategories(): Promise<string[]> {
  const raw = await getSetting(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((c) => String(c)) : [];
  } catch {
    return [];
  }
}

async function saveCategories(categories: string[]): Promise<void> {
  await setSetting(KEY, JSON.stringify(categories));
}

// GET - Listar categorias
export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Adicionar categoria
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const categories = await getCategories();
    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    }

    categories.push(name);
    await saveCategories(categories);
    return NextResponse.json({ categories }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - Remover categoria (?name=...)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    }

    const categories = await getCategories();
    const filtered = categories.filter((c) => c.toLowerCase() !== name.toLowerCase());
    await saveCategories(filtered);
    return NextResponse.json({ categories: filtered });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT - Renomear categoria (body: { oldName, newName })
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const oldName = String(body?.oldName ?? '').trim();
    const newName = String(body?.newName ?? '').trim();
    if (!oldName || !newName) {
      return NextResponse.json({ error: 'oldName and newName are required' }, { status: 400 });
    }

    const categories = await getCategories();
    const idx = categories.findIndex((c) => c.toLowerCase() === oldName.toLowerCase());
    if (idx === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    if (categories.some((c, i) => i !== idx && c.toLowerCase() === newName.toLowerCase())) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    }

    const actualOldName = categories[idx];
    categories[idx] = newName;
    await saveCategories(categories);

    // Mantém consistência: itens da galeria com a categoria antiga passam a usar a nova.
    await query('UPDATE gallery_items SET category = ? WHERE category = ?', [newName, actualOldName]);

    return NextResponse.json({ categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
