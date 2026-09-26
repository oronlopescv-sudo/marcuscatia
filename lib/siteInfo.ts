// Public contact details, editable in Admin → Settings → Site Information.
export interface SiteInfo {
  site_title: string;
  site_email: string;
  site_whatsapp: string;
  site_location: string;
}

export const DEFAULT_SITE_INFO: SiteInfo = {
  site_title: 'Cátia Cooking Mindelo',
  site_email: 'deandradeleukelcatiasofia@gmail.com',
  site_whatsapp: '+238 595 3973',
  site_location: 'Fonte Francês, Mindelo, São Vicente, Cabo Verde',
};

export const PUBLIC_SITE_KEYS = ['site_title', 'site_email', 'site_whatsapp', 'site_location'] as const;

export function phoneDigits(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function whatsappLink(phone: string, text?: string): string {
  const base = `https://wa.me/${phoneDigits(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
