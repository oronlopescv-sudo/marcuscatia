import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Track {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}

interface MusicStore {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  
  // Actions
  setTracks: (tracks: Track[]) => void;
  addTrack: (track: Track) => void;
  deleteTrack: (id: string) => void;
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
}

export const useMusicStore = create<MusicStore>()(
  persist(
    (set, get) => ({
      tracks: [],
      currentTrack: null,
      isPlaying: false,
      volume: 0.5,

      setTracks: (tracks) => set({ tracks }),
      
      addTrack: (track) => {
        const tracks = get().tracks;
        const updated = [...tracks, track];
        set({ tracks: updated });
        // Auto-select first track if none selected
        if (!get().currentTrack && updated.length === 1) {
          set({ currentTrack: track });
        }
      },

      deleteTrack: (id) => {
        const tracks = get().tracks.filter(t => t.id !== id);
        set({ tracks });
        // Clear current track if deleted
        if (get().currentTrack?.id === id) {
          set({ currentTrack: null, isPlaying: false });
        }
      },

      setCurrentTrack: (track) => {
        set({ currentTrack: track });
        // Reset playback when switching tracks
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
