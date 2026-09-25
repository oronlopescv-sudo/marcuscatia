'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Upload, Music, X, Play } from 'lucide-react';

interface MusicTrack {
  id: string;
  title: string;
  url: string;
}

export function MusicManager() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTracks = useCallback(async () => {
    try {
      const response = await fetch('/api/music');
      const data = await response.json();
      setTracks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching music:', err);
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const allowedExt = /\.(mp3|wav|ogg|m4a|aac|webm)$/i.test(f.name);
    const allowedType = f.type.startsWith('audio/');
    if (!allowedExt && !allowedType) {
      setError('Only audio files (MP3, WAV, OGG, M4A, AAC, WebM) are allowed');
      return;
    }

    if (f.size > 20 * 1024 * 1024) {
      setError('File cannot be larger than 20MB');
      return;
    }

    setFile(f);
    setFileName(f.name);
    setError('');
  };

  const handleUpload = async () => {
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!file) {
      setError('Please choose an audio file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('file', file);

      const response = await fetch('/api/music', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to upload track');
        return;
      }

      setSuccess('✅ Track uploaded!');
      setTitle('');
      setFile(null);
      setFileName('');
      setShowForm(false);
      await fetchTracks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error uploading track');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this track?')) return;
    setDeletingId(id);
    setError('');
    try {
      const response = await fetch(`/api/music?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSuccess('✅ Track deleted');
        await fetchTracks();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete track');
      }
    } catch (err) {
      setError('Error deleting track');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-mindelo-dark">Music Player</h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload background music (morna/funaná) played by the site's mini player.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-mindelo-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            <Plus size={20} />
            Add Track
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

      {/* Formulário de upload */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
          <h3 className="font-bold text-mindelo-dark">Add New Track</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue focus:border-transparent"
              placeholder="e.g., Sodade (Morna)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Audio File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.webm"
                onChange={handleFileChange}
                className="hidden"
                id="music-input"
              />
              <label htmlFor="music-input" className="cursor-pointer block">
                <Upload size={32} className="mx-auto mb-2 text-mindelo-blue" />
                <p className="font-semibold text-gray-700">
                  {fileName || 'Click to choose an audio file'}
                </p>
                <p className="text-xs text-gray-500">MP3, WAV, OGG, M4A, AAC, WebM — up to 20MB</p>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-mindelo-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {uploading ? '⏳ Uploading...' : '✅ Upload Track'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setFile(null);
                setFileName('');
                setTitle('');
                setError('');
              }}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Lista de faixas */}
      {isLoading ? (
        <p className="text-gray-600 text-center py-8">Loading...</p>
      ) : tracks.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          No tracks yet. Upload your first song above.
        </p>
      ) : (
        <div className="space-y-2">
          {tracks.map((track, idx) => (
            <div
              key={track.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Music className="w-5 h-5 text-mindelo-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{track.title}</p>
                <audio src={track.url} controls className="w-full max-w-xs mt-1 h-8" />
              </div>
              <span className="text-xs text-gray-400 hidden sm:block">{idx + 1}</span>
              <button
                onClick={() => handleDelete(track.id)}
                disabled={deletingId === track.id}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                title="Delete track"
                aria-label={`Delete ${track.title}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
