import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Track {
  id: string;
  title: string;
  url: string;
}

interface MusicStore {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
}

export const MUSIC_TRACKS: Track[] = [
  { id: '1', title: 'Mindelo Vibes', url: 'https://example.com/music/mindelo-vibes.mp3' },
  { id: '2', title: 'Sunset in Praia', url: 'https://example.com/music/sunset-praia.mp3' },
  { id: '3', title: 'Cape Verde Rhythm', url: 'https://example.com/music/cv-rhythm.mp3' },
  { id: '4', title: 'Cooking Ambiance', url: 'https://example.com/music/cooking.mp3' },
  { id: '5', title: 'Island Breeze', url: 'https://example.com/music/island-breeze.mp3' },
  { id: '6', title: 'Mornas Classic', url: 'https://example.com/music/mornas.mp3' },
  { id: '7', title: 'Funaná Energy', url: 'https://example.com/music/funana.mp3' },
  { id: '8', title: 'Ocean Waves', url: 'https://example.com/music/ocean.mp3' },
  { id: '9', title: 'Market Life', url: 'https://example.com/music/market.mp3' },
  { id: '10', title: 'Evening Calm', url: 'https://example.com/music/evening.mp3' },
];

export const useMusicStore = create<MusicStore>()(
  persist(
    (set) => ({
      currentTrack: MUSIC_TRACKS[0],
      isPlaying: false,
      volume: 0.5,

      setCurrentTrack: (track) => {
        set({ currentTrack: track });
        set({ isPlaying: !!track });
      },

      setIsPlaying: (playing) => set({ isPlaying: playing }),
      
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    }),
    {
      name: 'catia-music-store',
      version: 1,
    }
  )
);
