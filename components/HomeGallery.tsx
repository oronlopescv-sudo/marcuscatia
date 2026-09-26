'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Camera, Play } from 'lucide-react';

interface GalleryItem {
  id: number;
  src: string;
  title: string;
  type: 'photo' | 'video';
  youtubeId?: string;
}

// Latest photos from the gallery (uploaded in Admin → Gallery).
export function HomeGallery() {
  const [items, setItems] = useState<GalleryItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/gallery')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const photos = (items || []).filter((i) => i.type !== 'video').slice(0, 8);
  const hasVideos = (items || []).some((i) => i.type === 'video');

  return (
    <section className="py-14 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 sm:mb-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-mindelo-dark mb-4">Gallery</h2>
            <p className="text-base sm:text-lg text-gray-600">Moments from our classes, the market and Cátia&apos;s kitchen in Mindelo.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <Link href="/gallery" className="inline-flex items-center gap-2 py-2 font-bold text-mindelo-blue hover:text-mindelo-dark transition-colors">
              See all photos <ArrowRight size={18} />
            </Link>
            {hasVideos && (
              <Link href="/gallery?tab=videos" className="inline-flex items-center gap-2 py-2 font-bold text-mindelo-red hover:text-red-800 transition-colors">
                <Play size={16} /> Watch videos
              </Link>
            )}
          </div>
        </div>

        {items === null ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-gray-300 bg-white">
            <Camera size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Photos are coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {photos.map((photo) => (
              <Link
                key={photo.id}
                href="/gallery"
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-200 shadow-sm"
                aria-label={photo.title}
              >
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/70 to-transparent text-white text-xs sm:text-sm font-semibold line-clamp-2">
                  {photo.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
