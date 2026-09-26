'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_SITE_INFO, SiteInfo } from '@/lib/siteInfo';

// One request per page load, shared by every component that needs it.
let pending: Promise<SiteInfo> | null = null;

function load(): Promise<SiteInfo> {
  if (!pending) {
    pending = fetch('/api/settings/public')
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: Partial<SiteInfo>) => ({
        site_title: data.site_title || DEFAULT_SITE_INFO.site_title,
        site_email: data.site_email || DEFAULT_SITE_INFO.site_email,
        site_whatsapp: data.site_whatsapp || DEFAULT_SITE_INFO.site_whatsapp,
        site_location: data.site_location || DEFAULT_SITE_INFO.site_location,
        hero_image: data.hero_image || DEFAULT_SITE_INFO.hero_image,
      }))
      .catch(() => DEFAULT_SITE_INFO);
  }
  return pending;
}

export function useSiteInfo(): SiteInfo {
  const [info, setInfo] = useState<SiteInfo>(DEFAULT_SITE_INFO);
  useEffect(() => {
    let cancelled = false;
    load().then((i) => {
      if (!cancelled) setInfo(i);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return info;
}
