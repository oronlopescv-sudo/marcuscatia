'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Upload, X, Pencil, Tag, Check } from 'lucide-react';

interface GalleryItem {
  id: number;
  src: string;
  title: string;
  category: string;
  type: 'photo' | 'video';
  youtubeId?: string;
  created_at?: string;
}

const DEFAULT_CATEGORIES = [
  'Cooking Class',
  'Market Tour',
  'Tasting',
  'Ambiance',
  'Ingredients',
  'Other',
];

export function AdminGalleryManager() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Categoria nova (gestão de categorias)
  const [newCategory, setNewCategory] = useState('');

  // Renomear categoria
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Edição
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    type: 'photo' as 'photo' | 'video',
    youtubeId: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Cooking Class',
    type: 'photo' as 'photo' | 'video',
    file: null as File | null,
    youtubeId: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchGallery = useCallback(async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      setGalleryItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setGalleryItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/gallery/categories');
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Load gallery + categories on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- state is only set after the fetch resolves
    fetchGallery();
    fetchCategories();
  }, [fetchGallery, fetchCategories]);

  // Extract YouTube ID from URL
  const extractYoutubeId = (url: string): string | null => {
    const patterns = [
      /[?&]v=([A-Za-z0-9_-]{11})/,
      /youtu\.be\/([A-Za-z0-9_-]{11})/,
      /youtube\.com\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/,
      /^([A-Za-z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.trim().match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // ---- Gestão de categorias ----
  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/gallery/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Failed to add category');
        return;
      }
      setCategories(result.categories);
      setNewCategory('');
      setSuccess('✅ Category added');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError('Error adding category');
    }
  };

  const handleDeleteCategory = async (name: string) => {
    if (!confirm(`Remove category "${name}"?`)) return;
    setError('');
    try {
      const response = await fetch(
        `/api/gallery/categories?name=${encodeURIComponent(name)}`,
        { method: 'DELETE' }
      );
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Failed to remove category');
        return;
      }
      setCategories(result.categories);
    } catch (err) {
      setError('Error removing category');
    }
  };

  const startRenameCategory = (name: string) => {
    setEditingCategory(name);
    setEditCategoryName(name);
    setError('');
    setSuccess('');
  };

  const cancelRenameCategory = () => {
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const handleRenameCategory = async () => {
    const oldName = editingCategory;
    const newName = editCategoryName.trim();
    if (!oldName || !newName) return;
    if (newName.toLowerCase() === oldName.toLowerCase()) {
      cancelRenameCategory();
      return;
    }
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/gallery/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Failed to rename category');
        return;
      }
      setCategories(result.categories);
      cancelRenameCategory();
      setSuccess('✅ Category renamed');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError('Error renaming category');
    }
  };

  // ---- Adicionar item ----
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG and WebP are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File cannot be larger than 10MB');
      return;
    }

    setFormData({ ...formData, file });
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = async () => {
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (formData.type === 'photo' ? !formData.file : !formData.youtubeId.trim()) {
      setError(formData.type === 'photo' ? 'Please choose a photo' : 'Please paste the YouTube link');
      return;
    }

    setUploading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      // The select shows the first category when the stored value isn't in the list.
      const category = categories.includes(formData.category) ? formData.category : categories[0] || 'General';
      data.append('category', category);
      data.append('type', formData.type);

      if (formData.type === 'photo' && formData.file) {
        data.append('file', formData.file);
      } else {
        const youtubeId = extractYoutubeId(formData.youtubeId);
        if (!youtubeId) {
          setError('Invalid YouTube URL or ID');
          setUploading(false);
          return;
        }
        data.append('youtubeId', youtubeId);
      }

      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to add item');
        return;
      }

      setSuccess('✅ Item added successfully!');
      setFormData({ title: '', category: 'Cooking Class', type: 'photo', file: null, youtubeId: '' });
      setPreviewUrl('');
      setShowAddForm(false);
      await fetchGallery();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding item');
    } finally {
      setUploading(false);
    }
  };

  // ---- Editar item ----
  const startEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      category: item.category,
      type: item.type,
      youtubeId: item.youtubeId || '',
    });
    setError('');
    setSuccess('');
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setError('');
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setError('');
    setSuccess('');

    if (!editForm.title.trim()) {
      setError('Title is required');
      return;
    }

    let youtubeId = '';
    if (editForm.type === 'video') {
      const extracted = extractYoutubeId(editForm.youtubeId);
      if (!extracted) {
        setError('Invalid YouTube URL or ID');
        return;
      }
      youtubeId = extracted;
    }

    setSavingEdit(true);
    try {
      const response = await fetch(`/api/gallery?id=${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          category: editForm.category,
          type: editForm.type,
          youtubeId: editForm.type === 'video' ? youtubeId : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to update item');
        return;
      }

      setSuccess('✅ Item updated!');
      setEditingItem(null);
      await fetchGallery();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error updating item');
    } finally {
      setSavingEdit(false);
    }
  };

  // ---- Eliminar item ----
  const handleDeleteItem = async (id: number) => {
    if (!confirm('Delete this item?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('✅ Item deleted');
        await fetchGallery();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('❌ Failed to delete');
      }
    } catch (err) {
      setError('Error deleting item');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', category: 'Cooking Class', type: 'photo', file: null, youtubeId: '' });
    setPreviewUrl('');
    setError('');
    setSuccess('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-8">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-mindelo-dark">Photo Gallery</h2>
        {!showAddForm && !editingItem && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-mindelo-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            <Plus size={20} />
            Add Photo / Video
          </button>
        )}
      </div>

      {/* Mensagens */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <X size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Gestão de Categorias */}
      <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/60">
        <div className="flex items-center gap-2 mb-3">
          <Tag size={18} className="text-mindelo-blue" />
          <h3 className="text-base font-bold text-mindelo-dark">Categories</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) =>
            editingCategory === cat ? (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-mindelo-blue text-sm shadow-sm"
              >
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleRenameCategory();
                    } else if (e.key === 'Escape') {
                      cancelRenameCategory();
                    }
                  }}
                  className="w-32 px-2 py-0.5 border border-gray-300 rounded focus:ring-2 focus:ring-mindelo-blue focus:border-transparent text-sm"
                  autoFocus
                />
                <button
                  onClick={handleRenameCategory}
                  className="text-green-600 hover:text-green-700"
                  aria-label="Save category name"
                  title="Save"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={cancelRenameCategory}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Cancel rename"
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </span>
            ) : (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm text-gray-700 shadow-sm"
              >
                {cat}
                <button
                  onClick={() => startRenameCategory(cat)}
                  className="p-2 -m-1 text-gray-400 hover:text-mindelo-blue transition-colors"
                  aria-label={`Rename category ${cat}`}
                  title={`Rename ${cat}`}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  className="p-2 -m-1 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label={`Remove category ${cat}`}
                  title={`Remove ${cat}`}
                >
                  <X size={14} />
                </button>
              </span>
            )
          )}
          {categories.length === 0 && (
            <span className="text-sm text-gray-500">No categories yet.</span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCategory();
              }
            }}
            className="flex-1 min-w-0 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue focus:border-transparent"
            placeholder="New category (e.g. Kitchen, Pastries…)"
          />
          <button
            onClick={handleAddCategory}
            className="bg-mindelo-blue hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold transition whitespace-nowrap"
          >
            + Add Category
          </button>
        </div>
      </div>

      {/* Formulário de Adicionar */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-mindelo-dark">Add New Item</h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue focus:border-transparent"
              placeholder="e.g., Cachupa cooking class"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'photo' | 'video' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue focus:border-transparent"
            >
              <option value="photo">Photo</option>
              <option value="video">YouTube Video</option>
            </select>
            {formData.type === 'video' && (
              <p className="text-xs text-gray-500 mt-1">
                Videos appear in the &quot;Videos&quot; section of the gallery. Upload the video to YouTube first, then paste its link here.
              </p>
            )}
          </div>

          {formData.type === 'photo' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Photo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-input"
                />
                <label htmlFor="photo-input" className="cursor-pointer">
                  <Upload size={32} className="mx-auto mb-2 text-mindelo-blue" />
                  <p className="font-semibold text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB</p>
                </label>
              </div>

              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Preview</p>
                  <div className="relative w-40 h-32 rounded-lg overflow-hidden">
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube URL or ID</label>
              <input
                type="text"
                value={formData.youtubeId}
                onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue focus:border-transparent"
                placeholder="e.g., https://youtube.com/watch?v=... or dQw4w9WgXcQ"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAddItem}
              disabled={uploading}
              className="flex-1 bg-mindelo-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {uploading ? '⏳ Uploading...' : '✅ Add'}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Formulário de Editar */}
      {editingItem && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-mindelo-dark">Edit Item</h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              {!categories.includes(editForm.category) && (
                <option value={editForm.category}>{editForm.category}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <select
              value={editForm.type}
              onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'photo' | 'video' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue focus:border-transparent"
            >
              <option value="photo">Photo</option>
              <option value="video">YouTube Video</option>
            </select>
          </div>

          {editForm.type === 'video' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube URL or ID</label>
              <input
                type="text"
                value={editForm.youtubeId}
                onChange={(e) => setEditForm({ ...editForm, youtubeId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue focus:border-transparent"
                placeholder="e.g., https://youtube.com/watch?v=... or dQw4w9WgXcQ"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSaveEdit}
              disabled={savingEdit}
              className="flex-1 bg-mindelo-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {savingEdit ? '⏳ Saving...' : '✅ Save Changes'}
            </button>
            <button
              onClick={cancelEdit}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Lista da Galeria */}
      {isLoading ? (
        <p className="text-gray-600 text-center py-8">Loading...</p>
      ) : galleryItems.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No photos yet. Add your first photo or video!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {galleryItems.map((item) => (
            <div key={item.id} className="flex flex-col rounded-lg overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition">
              <Image
                src={item.type === 'video' && item.youtubeId ? `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg` : item.src}
                alt={item.title}
                width={300}
                height={300}
                className="w-full aspect-square object-cover bg-gray-100"
              />
              <div className="p-2.5 sm:p-3 flex flex-col gap-2 flex-1">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 break-words">{item.title}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {item.category} · {item.type === 'video' ? 'Video' : 'Photo'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="h-10 flex items-center justify-center bg-mindelo-blue hover:bg-blue-700 text-white rounded-lg transition"
                    aria-label={`Edit ${item.title}`}
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={deletingId === item.id}
                    className="h-10 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50"
                    aria-label={`Delete ${item.title}`}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
