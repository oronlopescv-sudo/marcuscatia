'use client';

import { useState, useEffect } from 'react';
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

  // Carregar galeria
  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      setGalleryItems(data);
    } catch (err) {
      console.error('Error fetching gallery:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Extrair YouTube ID de URL
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
      setError('Apenas JPEG, PNG e WebP são permitidos');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Ficheiro não pode ter mais de 10MB');
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

  // Adicionar novo item
  const handleAddItem = async () => {
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    if (formData.type === 'photo' && !formData.file) {
      setError('Envie uma foto');
      return;
    }

    if (formData.type === 'video' && !formData.youtubeId.trim()) {
      setError('YouTube ID ou URL é obrigatório');
      return;
    }

    try {
      setUploading(true);

      let youtubeId = '';
      if (formData.type === 'video') {
        youtubeId = extractYoutubeId(formData.youtubeId) || '';
        if (!youtubeId) {
          setError('YouTube URL/ID inválido');
          return;
        }
      }

      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      if (formData.file) {
        data.append('file', formData.file);
      }
      if (youtubeId) {
        data.append('youtubeId', youtubeId);
      }

      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar item');
      }

      const result = await response.json();
      
      const newItem: GalleryItem = {
        id: result.id,
        src: result.src,
        title: formData.title,
        category: formData.category,
        type: formData.type as 'photo' | 'video',
        youtubeId: youtubeId || undefined,
      };

      setGalleryItems([newItem, ...galleryItems]);
      setSuccess('✅ Item adicionado com sucesso!');
      
      setFormData({
        title: '',
        category: 'Cooking Class',
        type: 'photo',
        file: null,
        youtubeId: '',
      });
      setPreviewUrl('');
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar item');
    } finally {
      setUploading(false);
    }
  };

  // Delete item
  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que quer apagar?')) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGalleryItems(galleryItems.filter(item => item.id !== id));
        setSuccess('✅ Foto apagada!');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Erro ao apagar');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-mindelo-dark">📷 Photo Gallery</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-mindelo-blue text-white rounded-lg hover:bg-mindelo-dark transition font-medium"
        >
          <Plus size={20} />
          Add Photo
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-mindelo-blue">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-mindelo-dark">
              ➕ Add New Photo
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  type: e.target.value as 'photo' | 'video',
                });
                setPreviewUrl('');
                setFormData({ ...formData, file: null, youtubeId: '' });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="photo">📷 Foto</option>
              <option value="video">🎥 Vídeo YouTube</option>
            </select>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="ex: Cachupa de Mindelo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="ex: Cooking Class"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Photo Upload or YouTube URL */}
          {formData.type === 'photo' ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload size={16} className="inline mr-2" />
                Upload Foto (JPEG, PNG, WebP - max 10MB)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-mindelo-blue"
              />

              {/* Preview */}
              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL ou ID
              </label>
              <input
                type="text"
                value={formData.youtubeId}
                onChange={(e) =>
                  setFormData({ ...formData, youtubeId: e.target.value })
                }
                placeholder="ex: https://youtube.com/watch?v=... ou dQw4w9WgXcQ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition font-medium"
            >
              {uploading ? '⏳ Enviando...' : '✅ Adicionar'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormData({
                  title: '',
                  category: 'Cooking Class',
                  type: 'photo',
                  file: null,
                  youtubeId: '',
                });
                setPreviewUrl('');
              }}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {isLoading ? (
        <p className="text-gray-600 text-center py-8">Carregando galeria...</p>
      ) : galleryItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Nenhuma foto na galeria ainda</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-mindelo-blue text-white rounded-lg hover:bg-mindelo-dark transition font-medium"
          >
            <Plus size={20} />
            Adicionar Primeira Foto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              {/* Image */}
              <div className="relative w-full h-48 bg-gray-200">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Overlay Delete Button */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => item.id && handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="flex items-center justify-center w-10 h-10 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 transition"
                  title="Apagar"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-mindelo-dark mb-1 truncate">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  {item.category}
                  {item.type === 'video' && ' 🎥'}
                  {item.type === 'photo' && ' 📷'}
                </p>

                {/* Delete Button Below */}
                <button
                  onClick={() => item.id && handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-xs font-medium disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {deletingId === item.id ? 'Apagando...' : 'Apagar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
