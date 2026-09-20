'use client';

import { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, Edit3 } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  category: 'hero' | 'features' | 'faq' | 'testimonial' | 'social';
}

interface ContentEditorProps {
  category: 'hero' | 'features' | 'faq' | 'testimonial' | 'social';
  title: string;
}

export function ContentEditor({ category, title }: ContentEditorProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ContentItem>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadContent();
  }, [category]);

  const loadContent = async () => {
    try {
      const response = await fetch(`/api/content?category=${category}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to load content:', err);
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const url = editingId ? `/api/content/${editingId}` : '/api/content';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, category }),
      });

      if (response.ok) {
        setMessage('✅ Saved successfully');
        setEditingId(null);
        setFormData({});
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
            onClick={() => {
              setEditingId('new');
              setFormData({ category });
            }}
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue focus:border-transparent"
              placeholder="Enter title..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue focus:border-transparent resize-none"
              placeholder="Enter description..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
          <p className="text-gray-600 text-center py-8">No items yet</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
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
          ))
        )}
      </div>
    </div>
  );
}
