import { query } from '@/lib/db';

// The saved file extension always comes from this whitelist, never from the
// uploaded file name, so an upload can't become e.g. a public .html/.svg page.
export const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const AUDIO_EXTENSIONS: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/webm': 'webm',
};

export function audioExtension(file: File): string | null {
  if (AUDIO_EXTENSIONS[file.type]) return AUDIO_EXTENSIONS[file.type];
  const m = file.name.toLowerCase().match(/\.(mp3|wav|ogg|m4a|aac|webm)$/);
  return m ? m[1] : null;
}

export const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  webm: 'audio/webm',
};

export const MUSIC_TRACKS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS music_tracks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

let musicTableReady = false;
export async function ensureMusicTable() {
  if (musicTableReady) return;
  await query(MUSIC_TRACKS_TABLE_SQL);
  musicTableReady = true;
}
