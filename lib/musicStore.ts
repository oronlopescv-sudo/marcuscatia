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

// Faixas de demonstração — usadas APENAS como fallback se a API
// /api/music estiver indisponível. Nunca sobrescrevem o que o admin
// apagou: quando a API responde (mesmo vazio), a lista real substitui isto.
export const MUSIC_TRACKS: Track[] = [
  { id: '1', title: 'Mindelo Vibes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: '2', title: 'Sunset in Praia', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: '3', title: 'Cape Verde Rhythm', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: '4', title: 'Cooking Ambiance', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: '5', title: 'Island Breeze', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: '6', title: 'Mornas Classic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  { id: '7', title: 'Funaná Energy', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
  { id: '8', title: 'Ocean Waves', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
  { id: '9', title: 'Market Life', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
  { id: '10', title: 'Evening Calm', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
];

export const useMusicStore = create<MusicStore>()(
  persist(
    (set) => ({
      tracks: MUSIC_TRACKS,
      currentTrack: MUSIC_TRACKS[0],
      isPlaying: false,
      volume: 0.5,

      hydrateTracks: (tracks) =>
        set({
          tracks,
          currentTrack: tracks.length > 0 ? tracks[0] : null,
          isPlaying: false,
        }),

      setCurrentTrack: (track) => {
        set({ currentTrack: track });
        set({ isPlaying: !!track });
      },

      setIsPlaying: (playing) => set({ isPlaying: playing }),

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    }),
    {
      name: 'catia-music-store',
      // bumped → descarta faixas/dados antigos em cache e garante os novos campos
      version: 3,
    }
  )
);
