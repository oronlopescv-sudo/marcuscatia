import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Track {
  id: string;
  title: string;
  url: string;
}

interface MusicStore {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;

  // Carrega a playlist real (do banco). Não auto-reproduz.
  hydrateTracks: (tracks: Track[]) => void;
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
}

// Sem faixas de demonstração: a playlist vem apenas do que o admin carrega
// no painel (tabela music_tracks). Enquanto não houver música, o player fica
// escondido.
export const useMusicStore = create<MusicStore>()(
  persist(
    (set) => ({
      tracks: [],
      currentTrack: null,
      isPlaying: false,
      volume: 0.5,

      hydrateTracks: (tracks) =>
        set({
          tracks,
          currentTrack: tracks.length > 0 ? tracks[0] : null,
          // Autoplay: ao carregar a playlist, começa a tocar a primeira faixa.
          isPlaying: tracks.length > 0,
        }),

      setCurrentTrack: (track) =>
        set({ currentTrack: track, isPlaying: !!track }),

      setIsPlaying: (playing) => set({ isPlaying: playing }),

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    }),
    {
      name: 'catia-music-store',
      // bumped → descarta faixas/dados antigos em cache (incluindo as demos)
      version: 4,
    }
  )
);
