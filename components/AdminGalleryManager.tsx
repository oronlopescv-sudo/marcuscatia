'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Upload, X } from 'lucide-react';

interface GalleryItem {
  id: number;
  src: string;
  title: string;
  category: string;
  type: 'photo' | 'video';
  youtubeId?: string;
  created_at?: string;
}

export function AdminGalleryManager() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
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
      setGalleryItems(data);
    } catch (err) {
      console.error('Error fetching gallery:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load gallery on mount
  useEffect(() => {
    const load = async () => {
      await fetchGallery();
    };
    load();
  }, [fetchGallery]);

  // Extract YouTube ID from URL
  const extractYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Handle file change
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

  // Add new item
  const handleAddItem = async () => {
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.file && !formData.youtubeId) {
      setError('Please provide a photo or YouTube ID');
      return;
    }

    setUploading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('type', formData.type);

      if (formData.file) {
        data.append('file', formData.file);
      } else if (formData.youtubeId) {
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

  // Delete item
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
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-mindelo-dark">Photo Gallery</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-mindelo-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            <Plus size={20} />
            Add Photo
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
          <X size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4">
          {success}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 space-y-4">
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
              <option>Cooking Class</option>
              <option>Market Tour</option>
              <option>Tasting</option>
              <option>Ambiance</option>
              <option>Ingredients</option>
              <option>Other</option>
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

      {/* Gallery List */}
      {isLoading ? (
        <p className="text-gray-600 text-center py-8">Loading...</p>
      ) : galleryItems.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No photos yet. Add your first photo!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {galleryItems.map((item) => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition">
              <Image
                src={item.src}
                alt={item.title}
                width={300}
                height={300}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-end justify-between p-3">
                <div className="text-white">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-gray-200">{item.category}</p>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  disabled={deletingId === item.id}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
