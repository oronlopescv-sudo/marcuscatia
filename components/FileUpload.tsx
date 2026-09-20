'use client';

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (url: string) => void;
  accept?: string;
  maxSize?: number; // em MB
}

export function FileUpload({ onFileSelect, accept = 'image/*', maxSize = 5 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFile = async (file: File) => {
    setError('');
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Only image files allowed');
      return;
    }

    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File too large (max ${maxSize}MB)`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Upload failed');
        return;
      }

      onFileSelect(data.url);
      setIsDragging(false);
    } catch (err) {
      setError('Network error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
          isDragging
            ? 'border-mindelo-blue bg-blue-50'
            : 'border-gray-300 hover:border-mindelo-blue hover:bg-blue-50'
        } ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={isUploading}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <Upload size={32} className="text-mindelo-blue" />
          <div className="text-center">
            <p className="font-semibold text-gray-700">
              {isUploading ? 'Uploading...' : 'Drag and drop your image here'}
            </p>
            <p className="text-sm text-gray-500">or click to select</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <X size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
