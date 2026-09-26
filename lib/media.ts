import { existsSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { query } from '@/lib/db';

// Uploaded photos, logos and music are stored in MySQL (media_files), not on
// disk: Hostinger replaces the app folder on every deploy, which deleted
// every file written to /public at runtime.

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const AUDIO_TYPES: Record<string, string> = {
  'audio/mpeg': 'audio/mpeg',
  'audio/mp3': 'audio/mpeg',
  'audio/wav': 'audio/wav',
  'audio/x-wav': 'audio/wav',
  'audio/ogg': 'audio/ogg',
  'audio/mp4': 'audio/mp4',
  'audio/x-m4a': 'audio/mp4',
  'audio/aac': 'audio/aac',
  'audio/webm': 'audio/webm',
};

const AUDIO_BY_EXTENSION: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  webm: 'audio/webm',
};

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

// Content type to store for an audio upload, or null if it isn't audio we accept.
export function audioMimeType(file: File): string | null {
  if (AUDIO_TYPES[file.type]) return AUDIO_TYPES[file.type];
  const ext = file.name.toLowerCase().split('.').pop() || '';
  return AUDIO_BY_EXTENSION[ext] || null;
}

export const MEDIA_FILES_TABLE_SQL = `CREATE TABLE IF NOT EXISTS media_files (
  id VARCHAR(40) PRIMARY KEY,
  mime VARCHAR(100) NOT NULL,
  size INT UNSIGNED NOT NULL,
  data LONGBLOB NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

export const MUSIC_TRACKS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS music_tracks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

let mediaTableReady = false;
export async function ensureMediaTable() {
  if (mediaTableReady) return;
  await query(MEDIA_FILES_TABLE_SQL);
  mediaTableReady = true;
}

let musicTableReady = false;
export async function ensureMusicTable() {
  if (musicTableReady) return;
  await query(MUSIC_TRACKS_TABLE_SQL);
  musicTableReady = true;
}

const MEDIA_URL_RE = /^\/api\/media\/([a-f0-9]{24})$/;

export function mediaIdFromUrl(url: unknown): string | null {
  const m = typeof url === 'string' ? url.match(MEDIA_URL_RE) : null;
  return m ? m[1] : null;
}

// Stores the file in MySQL and returns the URL it is served from.
export async function saveMedia(data: Buffer, mime: string): Promise<string> {
  await ensureMediaTable();
  const id = randomBytes(12).toString('hex');
  await query('INSERT INTO media_files (id, mime, size, data) VALUES (?, ?, ?, ?)', [id, mime, data.length, data]);
  return `/api/media/${id}`;
}

export async function deleteMediaByUrl(url: unknown): Promise<void> {
  const id = mediaIdFromUrl(url);
  if (!id) return;
  await ensureMediaTable();
  await query('DELETE FROM media_files WHERE id = ?', [id]);
}

// Files uploaded before media moved to MySQL lived in /public/{uploads,gallery,music}
// and were wiped by deploys; treat those references as missing.
export function isLostLocalUpload(url: unknown): boolean {
  if (typeof url !== 'string' || !/^\/(uploads|gallery|music)\//.test(url)) return false;
  return !existsSync(join(process.cwd(), 'public', url));
}
