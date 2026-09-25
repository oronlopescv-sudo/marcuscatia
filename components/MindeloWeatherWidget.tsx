'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  CloudSun, 
  Wind, 
  Droplets, 
  RefreshCw, 
  Sparkles, 
  ExternalLink,
  X
} from 'lucide-react';

interface WeatherData {
  temperature: string;
  condition: string;
  conditionEnglish?: string;
  wind: string;
  humidity: string;
  iconType?: string;
  studentTip: string;
  comfortLevel: string;
}

interface WeatherResponse {
  weather: WeatherData;
  sources: Array<{ title: string; url: string }>;
  timestamp: number;
  cached?: boolean;
}

export function MindeloWeatherWidget({ 
  variant = 'header' 
}: { 
  variant?: 'header' | 'footer' 
}) {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/weather')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((json: WeatherResponse) => {
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch Mindelo weather:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/weather', { cache: 'no-cache' });
      if (res.ok) {
        const json: WeatherResponse = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to refresh Mindelo weather:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getWeatherIcon = (type?: string, className = "w-4 h-4") => {
    switch (type) {
      case 'sunny':
        return <Sun className={`${className} text-amber-500 animate-spin-slow`} />;
      case 'windy':
        return <Wind className={`${className} text-sky-500`} />;
      case 'cloudy':
      case 'partly-cloudy':
      default:
        return <CloudSun className={`${className} text-amber-500`} />;
    }
  };

  // FOOTER VARIANT: Clean, informative coastal badge
  if (variant === 'footer') {
    return (
      <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-blue-400/20 text-blue-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-amber-400/20 text-amber-300">
              {getWeatherIcon(data?.weather.iconType, "w-4 h-4")}
            </span>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-blue-200 block">
                Mindelo Weather
              </span>
              <span className="text-sm font-semibold text-white">
                {loading ? 'Loading...' : `${data?.weather.temperature || '26°C'} · ${data?.weather.condition || 'Sunny'}`}
              </span>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 -m-1 rounded-full hover:bg-white/10 text-blue-200 hover:text-white transition-colors"
            title="Refresh weather with Google Search"
            aria-label="Refresh weather"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {data?.weather && (
          <div className="text-xs text-blue-200/90 space-y-1.5 pt-2 border-t border-blue-400/20">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1">
                <Wind size={12} className="text-blue-300" />
                Wind: {data.weather.wind}
              </span>
              <span className="flex items-center gap-1">
                <Droplets size={12} className="text-blue-300" />
                Humidity: {data.weather.humidity}
              </span>
            </div>
            <p className="text-[11px] text-amber-200/90 italic pt-1 leading-snug">
              &ldquo;{data.weather.studentTip}&rdquo;
            </p>
            <div className="pt-1 flex items-center justify-between text-[10px] text-blue-300/70">
              <span className="flex items-center gap-1">
                <Sparkles size={10} className="text-amber-300" />
                Google Search Grounding
              </span>
              {data.sources && data.sources[0] && (
                <a
                  href={data.sources[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-200 inline-flex items-center gap-0.5"
                >
                  Source <ExternalLink size={8} />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // HEADER VARIANT: Interactive pill with dropdown card
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/90 hover:bg-blue-100/80 border border-blue-200/80 shadow-2xs text-xs font-medium text-[#0A3D78] transition-all duration-200 group"
        aria-label="View Mindelo weather for students"
        title={loading ? 'Mindelo weather' : `${data?.weather.condition || 'Sunny'} — ${data?.weather.temperature || '26°C'}`}
      >
        <span className="flex items-center justify-center">
          {loading ? (
            <RefreshCw size={12} className="animate-spin text-blue-500" />
          ) : (
            getWeatherIcon(data?.weather.iconType, "w-3.5 h-3.5")
          )}
        </span>

        <span className="font-semibold text-gray-800 whitespace-nowrap">
          {loading ? '...' : (data?.weather.temperature || '26°C')}
        </span>
      </button>

      {/* Popover / Dropdown Details Card */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop click dismisser for mobile/desktop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-[calc(100vw-2rem)] max-w-80 sm:w-80 p-4 bg-white rounded-2xl shadow-xl border border-blue-100 z-50 text-gray-800"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                    {getWeatherIcon(data?.weather.iconType, "w-5 h-5")}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-mindelo-dark leading-tight">
                      Mindelo, São Vicente
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Live weather via Google Search
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2 -m-1 text-gray-400 hover:text-mindelo-blue rounded-md transition-colors"
                    title="Refresh now"
                    aria-label="Refresh weather data"
                  >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
                    aria-label="Close popover"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Weather Highlights */}
              <div className="my-3 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100/50">
                  <span className="text-[10px] text-gray-500 block uppercase font-medium">Temperature</span>
                  <span className="text-base font-bold text-mindelo-dark">
                    {data?.weather.temperature || '26°C'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100/50">
                  <span className="text-[10px] text-gray-500 block uppercase font-medium">Wind</span>
                  <span className="text-xs font-bold text-sky-800 line-clamp-1">
                    {data?.weather.wind || '22 km/h NE'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100/50">
                  <span className="text-[10px] text-gray-500 block uppercase font-medium">Humidity</span>
                  <span className="text-xs font-bold text-blue-900">
                    {data?.weather.humidity || '68%'}
                  </span>
                </div>
              </div>

              {/* Student Visiting Advice */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 mb-3">
                <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs mb-1">
                  <Sparkles size={13} className="text-amber-600" />
                  <span>Tip for Students & Visitors</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">
                  {data?.weather.studentTip || 
                    'Pleasant weather in Mindelo for cooking! Bring comfortable clothes and enjoy the ocean breeze.'}
                </p>
                {data?.weather.comfortLevel && (
                  <p className="text-[11px] text-amber-800/80 mt-1">
                    {data.weather.comfortLevel}
                  </p>
                )}
              </div>

              {/* Sources & Grounding Attribution */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                <span className="flex items-center gap-1 text-mindelo-blue font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Google Search Grounded
                </span>

                {data?.sources && data.sources.length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <span>Sources:</span>
                    {data.sources.slice(0, 2).map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mindelo-blue hover:underline inline-flex items-center gap-0.5 max-w-[90px] truncate"
                        title={s.title}
                      >
                        {s.title.replace(/weather|previsão/gi, '').trim() || `Source ${idx + 1}`}
                        <ExternalLink size={8} />
                      </a>
                    ))}
                  </div>
                ) : (
                  <span>Mindelo, Cape Verde</span>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
