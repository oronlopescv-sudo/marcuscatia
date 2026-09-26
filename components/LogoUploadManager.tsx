'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { compressImage } from '@/lib/compressImage';

interface LogoUploadManagerProps {
  currentLogoUrl?: string;
}

export function LogoUploadManager({ currentLogoUrl = '/logo.png' }: LogoUploadManagerProps) {
  const [preview, setPreview] = useState<string>(currentLogoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccess('');
    
    const original = e.currentTarget.files?.[0];
    if (!original) return;

    if (!original.type.startsWith('image/')) {
      setError('Only image files allowed');
      return;
    }

    // PNG output keeps a transparent background
    const file = await compressImage(original, { maxSize: 1024, keepTransparency: true });
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large (max 10MB)');
      return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Upload failed');
        setPreview(currentLogoUrl);
        return;
      }

      setSuccess('Logo saved. Reloading…');
      
      // Reload para usar nova logo
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      setError('Network error during upload');
      setPreview(currentLogoUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRestoreDefault = async () => {
    if (!confirm('Go back to the original logo?')) return;
    setError('');
    setIsUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'logo' }),
      });
      if (!res.ok) {
        setError('Could not restore the default logo');
        return;
      }
      setSuccess('Default logo restored. Reloading…');
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setError('Network error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-mindelo-dark mb-2">Logo Management</h2>
        <p className="text-gray-600">Upload a new logo for your site (PNG, JPG or WebP). It is saved in the database.</p>
      </div>

      {/* Current Logo Preview */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Current Logo</label>
        <div className="relative w-32 h-32 rounded-lg border-2 border-gray-300 overflow-hidden bg-gray-50">
          <Image
            src={currentLogoUrl}
            alt="Current Logo"
            fill
            unoptimized
            className="object-contain p-2"
          />
        </div>
      </div>

      {/* Upload Area */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Upload New Logo</label>
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-mindelo-blue transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload size={32} className="text-mindelo-blue" />
            <p className="font-semibold text-gray-700">
              {isUploading ? 'Uploading...' : 'Click to select logo'}
            </p>
            <p className="text-xs text-gray-500">or drag and drop</p>
          </div>
        </div>
      </div>

      {/* Preview */}
      {preview !== currentLogoUrl && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Preview</label>
          <div className="relative w-32 h-32 rounded-lg border-2 border-mindelo-blue overflow-hidden bg-blue-50">
            <Image
              src={preview}
              alt="Logo Preview"
              fill
              className="object-contain p-2"
            />
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <X size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✅ {success}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={handleRestoreDefault}
          disabled={isUploading}
          className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
        >
          Restore default logo
        </button>
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p>💡 <strong>Tip:</strong> The logo updates across the whole site after upload (pages already open may take up to a minute).</p>
      </div>
    </div>
  );
}
