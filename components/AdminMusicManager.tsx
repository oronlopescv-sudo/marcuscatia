'use client';

import { useState, useEffect } from 'react';
import { Music, Upload, Trash2, Play } from 'lucide-react';
import { useMusicStore, type Track } from '@/lib/musicStore';

export default function AdminMusicManager() {
  const { tracks, setTracks, setCurrentTrack, addTrack, deleteTrack } = useMusicStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Carregar tracks existentes
  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/music/upload');
      if (res.ok) {
        const data = await res.json();
        setTracks(data);
      }
    } catch (err) {
      setError('Failed to load tracks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title || selectedFile.name);

      const res = await fetch('/api/music/upload', {
        method: 'POST',
        headers: {
          'x-admin-verified': 'true', // TODO: implement real auth
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const track = await res.json();
      addTrack(track);
      setTitle('');
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this track?')) return;

    try {
      const res = await fetch(`/api/music/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-verified': 'true',
        },
      });

      if (res.ok) {
        deleteTrack(id);
      } else {
        setError('Failed to delete track');
      }
    } catch (err) {
      setError('Delete failed');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Music className="w-6 h-6" />
          Background Music
        </h2>

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Mindelo Ambiance"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mindelo-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Audio File
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mindelo-blue"
            />
            <p className="text-xs text-slate-500 mt-1">
              MP3, WAV, OGG, WebM (max 50MB)
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="w-full bg-mindelo-blue text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 flex items-center justify-center gap-2 transition"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Track'}
          </button>
        </form>
      </div>

      {/* Tracks List */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">
          Tracks ({tracks.length})
        </h3>

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : tracks.length === 0 ? (
          <p className="text-slate-500 text-sm">No tracks yet. Upload one above.</p>
        ) : (
          <div className="space-y-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-mindelo-blue transition"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Music className="w-5 h-5 text-mindelo-blue flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {track.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(track.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => setCurrentTrack(track)}
                    className="p-2 text-mindelo-blue hover:bg-blue-100 rounded-lg transition"
                    title="Play track"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(track.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                    title="Delete track"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
