'use client';

// Shrinks phone photos in the browser before upload (they're often 4–12MB):
// longest side at most `maxSize` px, re-encoded as JPEG (or PNG to keep
// transparency). Falls back to the original file if the browser can't decode it.
export async function compressImage(
  file: File,
  { maxSize = 1920, quality = 0.85, keepTransparency = false }: { maxSize?: number; quality?: number; keepTransparency?: boolean } = {}
): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    const outType = keepTransparency ? 'image/png' : 'image/jpeg';
    if (outType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outType, quality));
    if (!blob) return file;
    // Keep the original if re-encoding didn't help (already small and small enough).
    if (scale === 1 && blob.size >= file.size && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + (outType === 'image/png' ? '.png' : '.jpg');
    return new File([blob], name, { type: outType });
  } catch {
    return file;
  }
}
