'use client';

import { useRef, useState, useEffect } from 'react';
import { Music, Play, Pause, Volume2, X } from 'lucide-react';
import { useMusicStore } from '@/lib/musicStore';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { 
    currentTrack, 
    isPlaying, 
    setIsPlaying, 
    volume, 
    setVolume,
    tracks 
  } = useMusicStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Sincronizar play/pause com o store
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  // Sincronizar volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Atualizar duração e tempo
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
    setIsPlaying(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack || tracks.length === 0) {
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
      />

      {/* Mini Player Fixo */}
      <div
        className={`fixed bottom-4 right-4 z-40 bg-gradient-to-br from-mindelo-blue to-blue-900 rounded-lg shadow-2xl transition-all duration-300 ${
          isMinimized ? 'w-16 h-16' : 'w-80 p-4'
        }`}
      >
        {isMinimized ? (
          // Botão minimizado
          <button
            onClick={() => setIsMinimized(false)}
            className="w-full h-full flex items-center justify-center text-white hover:bg-blue-800 rounded-lg transition"
            title="Click to expand"
          >
            <Music className="w-6 h-6" />
          </button>
        ) : (
          // Player expandido
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Music className="w-5 h-5 text-blue-300 flex-shrink-0" />
                <p className="text-white text-sm font-semibold truncate">
                  {currentTrack.title || 'Untitled'}
                </p>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-blue-200 hover:text-white transition ml-2 flex-shrink-0"
                title="Minimize"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Barra de progresso */}
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

            {/* Controles */}
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
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

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-300 flex-shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-blue-800 rounded-full cursor-pointer accent-blue-400"
                  title="Volume"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
