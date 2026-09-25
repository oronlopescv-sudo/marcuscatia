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

  // Carrega a playlist real (do banco). As faixas de demonstração só
  // permanecem se a API /api/music estiver indisponível — nunca sobrescrevem
  // o que o admin apagou.
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

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    setAudioError(false);
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

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
  };

  const handleEnded = () => {
    playNext();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
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
        onError={() => setAudioError(true)}
      />

      {/* Mini Player Fixo */}
      <div
        className={`fixed bottom-4 right-4 z-40 bg-gradient-to-br from-mindelo-blue to-blue-900 rounded-lg shadow-2xl transition-all duration-300 ${
          isMinimized ? 'w-16 h-16' : 'w-80 p-4'
        }`}
      >
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="w-full h-full flex items-center justify-center text-white hover:bg-blue-800 rounded-lg transition"
            title="Expand player"
          >
            <Music className="w-6 h-6" />
          </button>
        ) : (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Music className="w-5 h-5 text-blue-300 flex-shrink-0" />
                <p className="text-white text-sm font-semibold truncate">
                  {currentTrack.title}
                </p>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-blue-200 hover:text-white transition ml-2 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-blue-800 rounded-full cursor-pointer accent-blue-400"
              />
              <div className="flex justify-between text-xs text-blue-200">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={playPrev}
                className="p-2 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition"
                title="Previous track"
                aria-label="Previous track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span className="text-sm font-semibold">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 ml-0.5" />
                    <span className="text-sm font-semibold">Play</span>
                  </>
                )}
              </button>

              <button
                onClick={playNext}
                className="p-2 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition"
                title="Next track"
                aria-label="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-300 flex-shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-12 h-1 bg-blue-800 rounded-full cursor-pointer accent-blue-400"
                />
              </div>
            </div>

            {/* Playlist Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowList(!showList)}
                className="w-full bg-blue-800 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-between gap-2 px-3 text-sm transition"
              >
                <span className="truncate">Playlist ({tracks.length})</span>
                <ChevronDown className={`w-4 h-4 transition ${showList ? 'rotate-180' : ''}`} />
              </button>

              {showList && (
                <div className="absolute top-full mt-2 w-full bg-blue-900 border border-blue-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {tracks.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => {
                        setCurrentTrack(track);
                        setShowList(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition ${
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
            </div>

            {audioError && (
              <p className="text-xs text-amber-300">
                ⚠️ Could not load this audio.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
