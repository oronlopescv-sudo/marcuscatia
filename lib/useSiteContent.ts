'use client';

import { useEffect, useState } from 'react';

// Items written by the admin Content Editor: {title, description, body} JSON
// stored in site_content.content.
export interface ContentFields {
  title: string;
  description: string;
  body: string;
}

function parse(raw: unknown): ContentFields {
  try {
    const p = JSON.parse(String(raw));
    return { title: p.title || '', description: p.description || '', body: p.body || '' };
  } catch {
    return { title: '', description: '', body: String(raw || '') };
  }
}

// Returns null until loaded (or if the request failed), then the section's items.
export function useSiteContent(section: string): ContentFields[] | null {
  const [items, setItems] = useState<ContentFields[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/content?section=${encodeURIComponent(section)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((rows) => {
        if (!cancelled && Array.isArray(rows)) {
          setItems(rows.map((r: { content: unknown }) => parse(r.content)));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [section]);

  return items;
}
