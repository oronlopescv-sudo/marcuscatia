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

// Faixas de demonstração com áudio real e estável (amostras MP3 livres da
// SoundHelix) até serem substituídas por música cabo-verdiana licenciada
// (morna/funaná) hospedada em local estável.
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
      // bumped → discards any stale cached track so users get the fixed URLs
      version: 2,
    }
  )
);
