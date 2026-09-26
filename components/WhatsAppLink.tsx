'use client';

import { useSiteInfo } from '@/lib/useSiteInfo';
import { whatsappLink } from '@/lib/siteInfo';

// A wa.me link to the WhatsApp number set in Admin → Settings.
export function WhatsAppLink({ text, className, children }: { text?: string; className?: string; children: React.ReactNode }) {
  const { site_whatsapp } = useSiteInfo();
  return (
    <a href={whatsappLink(site_whatsapp, text)} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
