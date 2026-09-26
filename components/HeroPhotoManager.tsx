'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { compressImage } from '@/lib/compressImage';
import { DEFAULT_HERO_IMAGE } from '@/lib/siteInfo';

// Admin: the big photo of Cátia at the top of the home page.
export function HeroPhotoManager() {
  const [current, setCurrent] = useState(DEFAULT_HERO_IMAGE);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings/public')
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: { hero_image?: string }) => {
        if (data.hero_image) setCurrent(data.hero_image);
      })
      .catch(() => {});
  }, []);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const original = e.target.files?.[0];
    e.target.value = '';
    if (!original) return;
    if (!original.type.startsWith('image/')) {
      setMessage({ ok: false, text: 'Please choose a photo' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const file = await compressImage(original, { maxSize: 1600 });
      const form = new FormData();
      form.append('file', file);
      form.append('type', 'hero');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ ok: false, text: data.error || 'Upload failed' });
        return;
      }
      setCurrent(data.url);
      setMessage({ ok: true, text: 'Photo saved — it now shows at the top of the home page.' });
    } catch {
      setMessage({ ok: false, text: 'Network error during upload' });
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    if (!confirm('Go back to the default photo?')) return;
    setBusy(true);
    const res = await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'hero' }),
    });
    setBusy(false);
    if (res.ok) {
      setCurrent(DEFAULT_HERO_IMAGE);
      setMessage({ ok: true, text: 'Default photo restored.' });
    } else {
      setMessage({ ok: false, text: 'Could not restore the default photo' });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-mindelo-dark">Home Page Photo</h2>
        <p className="text-gray-600 text-sm">The photo of Cátia at the top of the home page. Portrait photos work best.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="relative w-40 h-48 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
          <Image src={current} alt="Home page photo" fill unoptimized className="object-cover object-[center_20%]" />
        </div>
        <div className="flex flex-col gap-2">
          <label className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-mindelo-blue hover:bg-blue-700 cursor-pointer ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload size={18} />
            {busy ? 'Saving…' : 'Upload new photo'}
            <input type="file" accept="image/*" className="hidden" onChange={upload} disabled={busy} />
          </label>
          <button
            type="button"
            onClick={restore}
            disabled={busy || current === DEFAULT_HERO_IMAGE}
            className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
          >
            Use default photo
          </button>
        </div>
      </div>
      {message && (
        <p className={`text-sm p-3 rounded-lg ${message.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message.text}</p>
      )}
    </div>
  );
}
