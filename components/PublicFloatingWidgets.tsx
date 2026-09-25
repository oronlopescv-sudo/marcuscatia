'use client';

import { usePathname } from 'next/navigation';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import MusicPlayer from '@/components/MusicPlayer';

// The floating WhatsApp button and music player are for visitors; on the
// admin panel they would cover the controls (and the music would keep playing).
export function PublicFloatingWidgets() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return (
    <>
      <WhatsAppButton />
      <MusicPlayer />
    </>
  );
}
