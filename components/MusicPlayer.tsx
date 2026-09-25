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
    // Faixa carregou bem → repõe o contador de erros.
    errorCountRef.current = 0;
    setAudioError(false);
  };

  const handleEnded = () => {
    playNext();
  };

  // Se uma faixa falhar, avança automaticamente para a seguinte (até um limite
  // igual ao nº de faixas, para não entrar em loop se estiverem todas avariadas).
  const handleError = () => {
    setAudioError(true);
    errorCountRef.current += 1;
    if (tracks.length > 1 && errorCountRef.current < tracks.length) {
      playNext();
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

      {/* Mini player compacto, fixo no canto inferior direito */}
      <div
        className={`fixed bottom-4 right-4 z-40 bg-gradient-to-br from-mindelo-blue to-blue-900 rounded-full shadow-2xl transition-all duration-300 ${
          isMinimized ? 'w-12 h-12' : 'w-64 p-3 rounded-2xl'
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
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Music className="w-4 h-4 text-blue-300 flex-shrink-0" />
                <p className="text-white text-xs font-semibold truncate">
                  {currentTrack.title}
                </p>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-blue-200 hover:text-white transition flex-shrink-0"
                title="Minimize"
                aria-label="Minimize"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress */}
            <div className="space-y-0.5">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-blue-800 rounded-full cursor-pointer accent-blue-400"
              />
              <div className="flex justify-between text-[10px] text-blue-200">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-1">
              <button
                onClick={playPrev}
                className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-full transition"
                title="Previous track"
                aria-label="Previous track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition"
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>

              <button
                onClick={playNext}
                className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-full transition"
                title="Next track"
                aria-label="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 ml-1">
                <Volume2 className="w-4 h-4 text-blue-300 flex-shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-10 h-1 bg-blue-800 rounded-full cursor-pointer accent-blue-400"
                />
              </div>
            </div>

            {/* Playlist */}
            <div className="relative">
              <button
                onClick={() => setShowList(!showList)}
                className="w-full bg-blue-800 hover:bg-blue-700 text-white py-1.5 rounded-lg flex items-center justify-between gap-2 px-3 text-xs transition"
              >
                <span className="truncate">Playlist ({tracks.length})</span>
                <ChevronDown className={`w-3.5 h-3.5 transition ${showList ? 'rotate-180' : ''}`} />
              </button>

              {showList && (
                <div className="absolute top-full mt-1.5 w-full bg-blue-900 border border-blue-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
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
            </div>

            {audioError && (
              <p className="text-[10px] text-amber-300">
                ⚠️ Não foi possível carregar esta faixa.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
