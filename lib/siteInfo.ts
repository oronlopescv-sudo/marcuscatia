// Public contact details, editable in Admin → Settings → Site Information.
export interface SiteInfo {
  site_title: string;
  site_email: string;
  site_whatsapp: string;
  site_location: string;
  hero_image: string;
}

// Real photo of Cátia used until one is uploaded in Admin → Settings.
export const DEFAULT_HERO_IMAGE = '/catia-cutting-fish.jpg';

export const DEFAULT_SITE_INFO: SiteInfo = {
  site_title: 'Cátia Cooking Mindelo',
  site_email: 'deandradeleukelcatiasofia@gmail.com',
  site_whatsapp: '+238 595 3973',
  site_location: 'Fonte Francês, Mindelo, São Vicente, Cabo Verde',
  hero_image: DEFAULT_HERO_IMAGE,
};

export const PUBLIC_SITE_KEYS = ['site_title', 'site_email', 'site_whatsapp', 'site_location', 'hero_image'] as const;

export function phoneDigits(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function whatsappLink(phone: string, text?: string): string {
  const base = `https://wa.me/${phoneDigits(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
