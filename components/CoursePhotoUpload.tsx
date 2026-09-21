'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, X, Trash2 } from 'lucide-react';

interface CoursePhotoUploadProps {
  courseId: string;
  courseName: string;
  currentImageUrl?: string;
  onImageUpdate?: (url: string) => void;
}

export function CoursePhotoUpload({
  courseId,
  courseName,
  currentImageUrl,
  onImageUpdate,
}: CoursePhotoUploadProps) {
  const [preview, setPreview] = useState<string>(currentImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError('');
    setSuccess('');

    // Validate
    if (!file.type.startsWith('image/')) {
      setError('Only image files allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File too large (max 5MB)');
      return;
    }

    // Show preview
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
      formData.append('courseId', courseId);
      formData.append('courseName', courseName);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Upload failed');
        setPreview(currentImageUrl || '');
        return;
      }

      setSuccess(`✅ Photo uploaded: ${data.filename}`);
      if (onImageUpdate) {
        onImageUpdate(data.url);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Network error during upload');
      setPreview(currentImageUrl || '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentImageUrl) return;

    if (!confirm('Remove this photo?')) return;

    setIsUploading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: currentImageUrl }),
      });

      if (response.ok) {
        setPreview('');
        setSuccess('✅ Photo removed');
        if (onImageUpdate) {
          onImageUpdate('');
        }
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to remove photo');
      }
    } catch (err) {
      setError('Network error during deletion');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div>
        <h4 className="font-semibold text-gray-800 mb-2">📸 Course Photo</h4>
        <p className="text-xs text-gray-600">PNG, JPG, WebP - Max 5MB</p>
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative w-full h-48 rounded-lg border-2 border-blue-200 overflow-hidden bg-gray-100">
          <Image
            src={preview}
            alt={courseName}
            fill
            className="object-cover"
          />
          <button
            onClick={handleRemove}
            disabled={isUploading}
            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
            title="Remove photo"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          disabled={isUploading}
          className="hidden"
          id={`photo-input-${courseId}`}
        />
        <label
          htmlFor={`photo-input-${courseId}`}
          className="flex flex-col items-center gap-2 cursor-pointer"
        >
          <Upload
            size={32}
            className={dragActive ? 'text-blue-500' : 'text-gray-400'}
          />
          <div>
            <p className="font-semibold text-gray-700">
              {isUploading ? 'Uploading...' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WebP (max 5MB)</p>
          </div>
        </label>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <X size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}
    </div>
  );
}
