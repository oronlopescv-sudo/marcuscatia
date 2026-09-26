'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSiteInfo } from '@/lib/useSiteInfo';
import { whatsappLink } from '@/lib/siteInfo';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Watermark } from '@/components/Watermark';
import Image from 'next/image';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, ZoomIn, ArrowRight, Utensils, MessageCircle, Play, Share2, Search, Filter, Camera, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryItem {
  id?: number;
  src: string;
  title: string;
  category: string;
  type: 'photo' | 'video';
  youtubeId?: string;
}

export default function GalleryPage() {
  return (
    <Suspense fallback={null}>
      <GalleryContent />
    </Suspense>
  );
}

function GalleryContent() {
  const router = useRouter();
  const site = useSiteInfo();
  const tab: 'photos' | 'videos' = useSearchParams().get('tab') === 'videos' ? 'videos' : 'photos';
  const isVideos = tab === 'videos';
  const [allItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const galleryItems = useMemo(
    () => allItems.filter((item) => (isVideos ? item.type === 'video' : item.type !== 'video')),
    [allItems, isVideos]
  );
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [shareMessage, setShareMessage] = useState('');

  const switchTab = (next: 'photos' | 'videos') => {
    setSelectedCategory('All');
    setSearchQuery('');
    setActiveIdx(null);
    router.replace(next === 'videos' ? '/gallery?tab=videos' : '/gallery', { scroll: false });
  };

  // Extrair categorias únicas e contar
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    galleryItems.forEach(item => {
      counts.set(item.category, (counts.get(item.category) || 0) + 1);
    });
    return ['All', ...Array.from(counts.keys())].map(cat => ({
      name: cat,
      count: cat === 'All' ? galleryItems.length : counts.get(cat) || 0
    }));
  }, [galleryItems]);

  // Filter and search
  const filteredItems = useMemo(() => {
    return galleryItems.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [galleryItems, selectedCategory, searchQuery]);

  // Load photos/videos uploaded by the admin. O banco é a única fonte de
  // verdade — se a API falhar, a galeria fica simplesmente vazia (sem fotos
  // "fantasma" hardcoded).
  useEffect(() => {
    let cancelled = false;

    fetch('/api/gallery')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: GalleryItem[]) => {
        if (!cancelled && Array.isArray(data)) {
          setGalleryItems(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load gallery:', err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePrev = useCallback(() => {
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev! === 0 ? filteredItems.length - 1 : prev! - 1));
  }, [activeIdx, filteredItems.length]);

  const handleNext = useCallback(() => {
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev! === filteredItems.length - 1 ? 0 : prev! + 1));
  }, [activeIdx, filteredItems.length]);

  const handleShare = useCallback(() => {
    const currentItem = filteredItems[activeIdx!];
    const text = `Check out this photo from Catia Cooking: "${currentItem.title}"`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  }, [activeIdx, filteredItems]);

  const copyToClipboard = useCallback(() => {
    if (activeIdx === null) return;
    const currentItem = filteredItems[activeIdx];
    navigator.clipboard.writeText(`Catia Cooking - ${currentItem.title}`);
    setShareMessage('Copied to clipboard!');
    setTimeout(() => setShareMessage(''), 2000);
  }, [activeIdx, filteredItems]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeIdx === null || filteredItems.length === 0) return;
      if (e.key === 'Escape') {
        setActiveIdx(null);
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft') {
        handlePrev();
        e.preventDefault();
      }
      if (e.key === 'ArrowRight') {
        handleNext();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIdx, handlePrev, handleNext, filteredItems.length]);

  // Extrair YouTube ID de diferentes formatos de URL
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

  // Gerar URL do thumbnail do YouTube
  // hqdefault exists for every video (maxresdefault doesn't).
  const getYoutubeThumbnail = (youtubeId: string): string => {
    return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 relative">
      <Watermark position="bottom-left" opacity={0.08} size="medium" />
      <Header />
      
      <main className="flex-grow">
        {/* Header */}
        <div className="bg-mindelo-dark py-12 md:py-16 text-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {/* Logo */}
              <div className="flex-shrink-0 w-20 h-20 md:w-28 md:h-28">
                <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg border-4 border-mindelo-gold bg-white">
                  <Image 
                    src="/logo.png" 
                    alt="Catia Cooking Mindelo Logo" 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              
              {/* Text */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                  {isVideos ? 'Cooking Videos' : 'Photo Gallery'}
                </h1>
                <p className="text-base md:text-lg text-gray-300">
                  {isVideos
                    ? 'Watch Cátia prepare Cape Verdean dishes step by step.'
                    : 'Take a peek at our previous classes and experience the joy of cooking together in Mindelo.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          {/* Photos / Videos */}
          <div className="grid grid-cols-2 gap-2 max-w-md mx-auto mb-8 sm:mb-10 p-1.5 bg-white rounded-2xl border border-blue-100 shadow-sm" role="tablist">
            {([
              { id: 'photos', label: 'Photos', icon: Camera },
              { id: 'videos', label: 'Videos', icon: Video },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => switchTab(id)}
                className={`flex items-center justify-center gap-2 min-h-12 px-3 py-3 rounded-xl font-bold transition-colors ${
                  tab === id ? 'bg-mindelo-blue text-white shadow-md' : 'text-mindelo-dark hover:bg-blue-50'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="mb-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveIdx(null);
              }}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-mindelo-blue focus:outline-none focus:ring-2 focus:ring-mindelo-blue/20 transition-all bg-white shadow-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-8 flex flex-wrap gap-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Filter size={16} />
              Filter:
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setActiveIdx(null);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.name
                      ? 'bg-mindelo-blue text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                  <span className="ml-1.5 text-xs opacity-75">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results Counter */}
          <div className="mb-8 text-sm text-gray-600">
            Showing <span className="font-semibold text-mindelo-dark">{filteredItems.length}</span> of <span className="font-semibold text-mindelo-dark">{galleryItems.length}</span> {isVideos ? 'videos' : 'photos'}
          </div>

          {/* Gallery Grid */}
          <div className={`grid gap-4 sm:gap-6 ${isVideos ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
            {filteredItems.map((item, idx) => {
              if (isVideos) {
                return (
                  <button
                    key={item.id ?? idx}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className="group text-left bg-white rounded-xl overflow-hidden border border-gray-200/70 shadow-sm hover:shadow-xl transition-shadow focus:outline-none focus:ring-4 focus:ring-mindelo-blue/30"
                    aria-label={`Play video: ${item.title}`}
                  >
                    <div className="relative aspect-video bg-gray-900">
                      <Image
                        src={getYoutubeThumbnail(item.youtubeId || '')}
                        alt={item.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors">
                        <span className="w-14 h-14 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                          <Play size={28} className="text-white fill-white ml-1" />
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-mindelo-dark leading-snug line-clamp-2">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                    </div>
                  </button>
                );
              }

              const thumbnail = item.type === 'video' 
                ? getYoutubeThumbnail(item.youtubeId || '')
                : item.src;

              return (
                <motion.button
                  key={item.id ?? idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  onClick={() => setActiveIdx(idx)}
                  className="group relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200/50 text-left focus:outline-none focus:ring-4 focus:ring-mindelo-blue/30"
                  aria-label={`View ${item.type === 'video' ? 'video' : 'photo'}: ${item.title}`}
                >
                  <Image
                    src={thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Play button para vídeos */}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors shadow-lg">
                        <Play size={32} className="text-white fill-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                    <span className="text-[10px] uppercase font-bold text-mindelo-gold tracking-widest mb-2 block">
                      {item.type === 'video' ? '▶ VIDEO' : '📷 ' + item.category}
                    </span>
                    <p className="text-xs font-semibold leading-tight line-clamp-2">
                      {item.title}
                    </p>
                    <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-blue-200">
                      <ZoomIn size={12} />
                      <span>Click to view</span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* No Results State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-gray-600">
                {galleryItems.length === 0
                  ? isVideos
                    ? 'Cooking videos are coming soon.'
                    : 'Photos are coming soon.'
                  : `No ${isVideos ? 'videos' : 'photos'} found matching your search.`}
              </p>
              {galleryItems.length > 0 && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="mt-4 px-6 py-2 text-sm font-medium text-mindelo-blue hover:text-mindelo-dark transition-colors underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Bottom CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-[#0A3D78] via-[#0A2240] to-[#0A3D78] rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-mindelo-gold text-xs uppercase font-bold tracking-widest block">
                Join Our Table
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black">
                Would you like to experience these moments in Cátia&apos;s kitchen?
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Classes are limited to 8 people to ensure personalized guidance and an authentic, unforgettable experience.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 bg-mindelo-red hover:bg-red-700 text-white px-7 py-3.5 rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Utensils size={16} />
                <span>Book a Class</span>
              </Link>
              <a
                href={whatsappLink(site.site_whatsapp, 'Hello Cátia! I saw the photos in your gallery and would love to book a class for our group.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3.5 rounded-full font-bold text-sm transition-all"
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Lightbox Modal */}
      <AnimatePresence>
        {activeIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveIdx(null)}
          >
            {/* Top Toolbar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider font-semibold text-gray-300">
                  {activeIdx + 1} of {filteredItems.length} · {filteredItems[activeIdx]?.category}
                </span>
                {shareMessage && (
                  <span className="text-xs text-emerald-300 font-medium">
                    {shareMessage}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="p-2.5 rounded-full bg-green-600/20 hover:bg-green-600/40 text-green-300 hover:text-green-200 transition-colors"
                  aria-label="Share on WhatsApp"
                  title="Share on WhatsApp"
                >
                  <MessageCircle size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard();
                  }}
                  className="p-2.5 rounded-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-blue-200 transition-colors"
                  aria-label="Copy to clipboard"
                  title="Copy title"
                >
                  <Share2 size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIdx(null);
                  }}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Close gallery"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-20"
              aria-label="Previous photo"
            >
              <ChevronLeft size={28} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-20"
              aria-label="Next photo"
            >
              <ChevronRight size={28} />
            </button>

            {/* Main Modal Container - Photo or Video */}
            {activeIdx !== null && filteredItems[activeIdx] && filteredItems[activeIdx].type === 'photo' ? (
              <div 
                className="relative max-w-4xl w-full max-h-[80vh] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={filteredItems[activeIdx].src}
                  alt={filteredItems[activeIdx].title}
                  fill
                  className="object-contain sm:object-cover"
                  referrerPolicy="no-referrer"
                  priority
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <p className="font-serif font-bold text-lg">
                    {filteredItems[activeIdx].title}
                  </p>
                </div>
              </div>
            ) : activeIdx !== null && filteredItems[activeIdx] ? (
              <div
                className="relative max-w-4xl w-full max-h-[80vh] aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${filteredItems[activeIdx].youtubeId}?autoplay=1&modestbranding=1&playsinline=1`}
                  title={filteredItems[activeIdx].title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white pointer-events-none">
                  <p className="font-serif font-bold text-lg">
                    {filteredItems[activeIdx].title}
                  </p>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
