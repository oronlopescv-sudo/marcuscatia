'use client';

import { useRef, useState, useEffect } from 'react';
import { Music, Play, Pause, Volume2, X, ChevronDown, SkipBack, SkipForward } from 'lucide-react';
import { useMusicStore } from '@/lib/musicStore';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    tracks,
    currentTrack,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    setCurrentTrack,
    hydrateTracks,
  } = useMusicStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showList, setShowList] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // Guard contra loop infinito quando todas as faixas estão quebradas.
  const errorCountRef = useRef(0);

  // Carrega a playlist real (do banco). hydrateTracks já ativa o autoplay da
  // primeira faixa.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/music')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          hydrateTracks(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load music:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [hydrateTracks]);

  // Sincroniza play/pause com o <audio>. Se o browser bloquear o autoplay,
  // voltamos ao estado pausado (o utilizador pode carregar em Play).
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
    errorCountRef.current = 0;
    setAudioError(false);
  };

  const handleEnded = () => {
    playNext();
  };

  const handleError = () => {
    setAudioError(true);
    errorCountRef.current += 1;
    if (tracks.length > 1 && errorCountRef.current < tracks.length) {
      playNext();
      setAudioError(false);
    } else {
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const playNext = () => {
    if (tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === currentTrack?.id);
    const next = tracks[(idx + 1) % tracks.length];
    if (next) setCurrentTrack(next);
  };

  const playPrev = () => {
    if (tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === currentTrack?.id);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    if (prev) setCurrentTrack(prev);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* Barra fina, fixa no canto inferior ESQUERDO (o WhatsApp ocupa o
          canto inferior direito — evita sobreposição) */}
      <div
        className={`fixed bottom-4 left-4 z-40 bg-gradient-to-r from-mindelo-blue to-blue-900 shadow-2xl transition-all duration-300 ${
          isMinimized ? 'w-12 h-12 rounded-full' : 'w-80 rounded-full'
        }`}
      >
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="w-full h-full flex items-center justify-center text-white hover:bg-blue-800 rounded-full transition"
            title="Expand player"
            aria-label="Expand player"
          >
            <Music className="w-5 h-5" />
          </button>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-2 h-12 px-3">
              {/* Play/Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 shrink-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition"
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>

              {/* Título + progresso */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white text-xs font-medium truncate">
                    {currentTrack.title}
                  </p>
                  <span className="text-[10px] text-blue-200 shrink-0 tabular-nums">
                    {formatTime(currentTime)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-0.5 mt-1 bg-blue-800 rounded-full cursor-pointer accent-blue-400"
                />
              </div>

              {/* Anterior / Seguinte */}
              <button
                onClick={playPrev}
                className="shrink-0 p-1 text-blue-200 hover:text-white transition"
                title="Previous track"
                aria-label="Previous track"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={playNext}
                className="shrink-0 p-1 text-blue-200 hover:text-white transition"
                title="Next track"
                aria-label="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-1 shrink-0">
                <Volume2 className="w-4 h-4 text-blue-300" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-10 h-0.5 bg-blue-800 rounded-full cursor-pointer accent-blue-400"
                />
              </div>

              {/* Playlist */}
              <button
                onClick={() => setShowList(!showList)}
                className="shrink-0 p-1 text-blue-200 hover:text-white transition"
                title="Playlist"
                aria-label="Playlist"
              >
                <ChevronDown
                  className={`w-4 h-4 transition ${showList ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Minimizar */}
              <button
                onClick={() => setIsMinimized(true)}
                className="shrink-0 p-1 text-blue-200 hover:text-white transition"
                title="Minimize"
                aria-label="Minimize"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Playlist dropdown */}
            {showList && (
              <div className="absolute top-full mt-1.5 left-0 right-0 bg-blue-900 border border-blue-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {tracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setCurrentTrack(track);
                      setShowList(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition ${
                      currentTrack.id === track.id
                        ? 'bg-blue-700 text-white font-semibold'
                        : 'text-blue-100 hover:bg-blue-800'
                    }`}
                  >
                    {track.title}
                  </button>
                ))}
              </div>
            )}

            {audioError && (
              <p className="px-3 pb-1 text-[10px] text-amber-300">
                ⚠️ This track could not be loaded.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
