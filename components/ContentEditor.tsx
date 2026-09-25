'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, X, Plus, Trash2, Edit3 } from 'lucide-react';

// The site_content table only has: id, section, key_name, content, type.
// This component stores {title, description, body} as JSON inside the
// `content` column so FAQ / Testimonial / Hero items can have multiple
// fields without needing extra DB columns.
interface StoredFields {
  title: string;
  description: string;
  body: string;
}

interface ContentRow {
  id: string;
  section: string;
  key_name: string;
  content: string;
  type: string;
}

interface ContentEditorProps {
  category: 'hero' | 'features' | 'faq' | 'testimonial' | 'social';
  title: string;
}

function parseFields(raw: string): StoredFields {
  try {
    const parsed = JSON.parse(raw);
    return {
      title: parsed.title || '',
      description: parsed.description || '',
      body: parsed.body || '',
    };
  } catch {
    // Legacy plain-text row: treat the whole value as the body.
    return { title: '', description: '', body: raw || '' };
  }
}

const FIELD_LABELS: Record<ContentEditorProps['category'], { title: string; description: string; body: string; hint?: string }> = {
  faq: { title: 'Question', description: 'Short summary (optional)', body: 'Answer', hint: 'While this list is empty, the site shows the default FAQ.' },
  testimonial: { title: 'Guest name', description: 'Where they are from (e.g. "Traveler from France")', body: 'Testimonial text', hint: 'The testimonials section is hidden until you add one.' },
  hero: { title: 'Headline', description: 'Tagline', body: 'Intro paragraph', hint: 'Only the first item is used. Empty fields keep the default text.' },
  features: { title: 'Title', description: 'Description', body: 'Content' },
  social: { title: 'Title', description: 'Description', body: 'Content' },
};

export function ContentEditor({ category, title }: ContentEditorProps) {
  const labels = FIELD_LABELS[category];
  const [items, setItems] = useState<ContentRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StoredFields>({ title: '', description: '', body: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadContent = useCallback(async () => {
    try {
      const response = await fetch(`/api/content?section=${category}`);
      if (response.ok) {
        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load content:', err);
    }
  }, [category]);

  useEffect(() => {
    const load = async () => {
      await loadContent();
    };
    load();
  }, [loadContent]);

  const handleEdit = (item: ContentRow) => {
    setEditingId(item.id);
    setFormData(parseFields(item.content));
  };

  const handleAddNew = () => {
    setEditingId('new');
    setFormData({ title: '', description: '', body: '' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', body: '' });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const isNew = editingId === 'new';
      const existing = !isNew ? items.find((i) => i.id === editingId) : undefined;
      const keyName = existing?.key_name || `${category}_${Date.now()}`;
      const id = existing?.id || `${category}_${Date.now()}`;

      const payload = {
        id,
        section: category,
        key_name: keyName,
        content: JSON.stringify(formData),
        type: 'rich_text',
      };

      const response = isNew
        ? await fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/content/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (response.ok) {
        setMessage('✅ Saved successfully');
        setEditingId(null);
        setFormData({ title: '', description: '', body: '' });
        await loadContent();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to save');
      }
    } catch (err) {
      setMessage('❌ Error: ' + (err instanceof Error ? err.message : 'Unknown'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;

    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('✅ Deleted successfully');
        await loadContent();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to delete');
      }
    } catch (err) {
      setMessage('❌ Error: ' + (err instanceof Error ? err.message : 'Unknown'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-mindelo-dark">{title}</h3>
        {!editingId && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-mindelo-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Plus size={18} />
            Add New
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          {message}
        </div>
      )}

      {/* Form */}
      {editingId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{labels.title}</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue focus:border-transparent"
              placeholder="Enter title..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{labels.description}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue focus:border-transparent resize-none"
              placeholder="Enter description..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{labels.body}</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue focus:border-transparent resize-none"
              placeholder="Enter content..."
              rows={5}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-mindelo-blue hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No items yet.{labels.hint ? ` ${labels.hint}` : ''}</p>
        ) : (
          items.map((item) => {
            const fields = parseFields(item.content);
            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{fields.title || '(untitled)'}</h4>
                  {fields.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{fields.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-mindelo-blue hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
