'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Move } from 'lucide-react';
import { motion } from 'motion/react';

interface GalleryItem {
  src: string;
  title: string;
  category: string;
  type: 'photo' | 'video';
  youtubeId?: string;
}

export function AdminGalleryManager() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Cooking Class',
    type: 'photo' as 'photo' | 'video',
    url: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Carregar items do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('catia-cooking-gallery-items');
    if (stored) {
      try {
        setGalleryItems(JSON.parse(stored));
      } catch (e) {
        console.error('Erro ao carregar galeria:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Salvar items no localStorage
  const saveToStorage = (items: GalleryItem[]) => {
    localStorage.setItem('catia-cooking-gallery-items', JSON.stringify(items));
  };

  // Extrair YouTube ID de URL
  const extractYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/, // ID direto
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Adicionar novo item
  const handleAddItem = () => {
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.url.trim()) {
      setError(formData.type === 'photo' ? 'Photo URL is required' : 'YouTube URL or ID is required');
      return;
    }

    if (formData.type === 'photo') {
      // Validar URL da foto
      if (!formData.url.startsWith('http')) {
        setError('Photo URL must start with http:// or https://');
        return;
      }

      const newItem: GalleryItem = {
        src: formData.url,
        title: formData.title,
        category: formData.category,
        type: 'photo',
      };

      const updated = [...galleryItems, newItem];
      setGalleryItems(updated);
      saveToStorage(updated);
      setSuccess('Photo added successfully!');
    } else {
      // Validar YouTube URL/ID
      const youtubeId = extractYoutubeId(formData.url);
      if (!youtubeId) {
        setError('Invalid YouTube URL or ID. Use format: https://youtube.com/watch?v=... or just the video ID');
        return;
      }

      const newItem: GalleryItem = {
        src: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
        title: formData.title,
        category: formData.category,
        type: 'video',
        youtubeId,
      };

      const updated = [...galleryItems, newItem];
      setGalleryItems(updated);
      saveToStorage(updated);
      setSuccess('Video added successfully!');
    }

    // Reset form
    setFormData({ title: '', category: 'Cooking Class', type: 'photo', url: '' });
    setShowAddForm(false);
  };

  // Remover item
  const handleRemoveItem = (index: number) => {
    const updated = galleryItems.filter((_, i) => i !== index);
    setGalleryItems(updated);
    saveToStorage(updated);
    setSuccess('Item removed successfully!');
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-600">Loading gallery...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add Item Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-mindelo-dark">Gallery Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-mindelo-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Plus size={18} />
          {showAddForm ? 'Cancel' : 'Add Photo/Video'}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {success}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-bold text-mindelo-dark mb-2">
              Item Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="photo"
                  checked={formData.type === 'photo'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'photo' | 'video' })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Photo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="video"
                  checked={formData.type === 'video'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'photo' | 'video' })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Video (YouTube)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-mindelo-dark mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Cachupa Rica preparation"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-mindelo-dark mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none"
            >
              <option>Cooking Class</option>
              <option>Hands-On Class</option>
              <option>Market Tour</option>
              <option>Ingredients</option>
              <option>Kitchen</option>
              <option>Pastries</option>
              <option>Tasting</option>
              <option>Moments</option>
              <option>Ambiance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-mindelo-dark mb-2">
              {formData.type === 'photo' ? 'Photo URL' : 'YouTube URL or Video ID'}
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder={formData.type === 'photo' 
                ? 'https://example.com/photo.jpg' 
                : 'https://youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ'}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {formData.type === 'photo'
                ? 'Direct image URL (jpg, png, webp)'
                : 'YouTube video URL or 11-character video ID'}
            </p>
          </div>

          <button
            onClick={handleAddItem}
            className="w-full bg-mindelo-red hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors"
          >
            Add to Gallery
          </button>
        </motion.div>
      )}

      {/* Gallery Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {galleryItems.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
          >
            {/* Thumbnail */}
            <div className="relative h-40 bg-gray-100">
              <Image
                src={item.src}
                alt={item.title}
                fill
                className="object-cover"
                onError={(e) => {
                  // Handle broken images
                  e.currentTarget.style.background = '#e5e7eb';
                }}
              />
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">▶</span>
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
              <p className="text-xs font-bold text-mindelo-gold uppercase">
                {item.type === 'video' ? '🎥 ' : '📷 '}{item.category}
              </p>
              <p className="text-sm font-semibold text-mindelo-dark line-clamp-2">
                {item.title}
              </p>

              {/* Actions */}
              <button
                onClick={() => handleRemoveItem(idx)}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-semibold text-sm transition-colors"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {galleryItems.length === 0 && !showAddForm && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <p className="text-gray-600 mb-4">No items in gallery yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-mindelo-blue text-white px-4 py-2 rounded-lg font-semibold"
          >
            <Plus size={18} />
            Add First Item
          </button>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-semibold mb-2">ℹ️ How to add items:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li><strong>Photos:</strong> Use direct image URLs (jpg, png, webp)</li>
          <li><strong>Videos:</strong> YouTube URL (youtube.com/watch?v=...) or just the 11-char video ID</li>
          <li>Items are stored in browser storage and sync across all visitors</li>
          <li>You can manage items anytime from this admin panel</li>
        </ul>
      </div>
    </div>
  );
}
