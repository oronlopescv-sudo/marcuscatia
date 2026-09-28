'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_SITE_INFO, SiteInfo } from '@/lib/siteInfo';

// Fetches fresh on every mount rather than caching the response for the
// lifetime of the page: a module-level cache here would keep showing the
// old hero photo/contact info after the admin changes it, until the visitor
// does a full page reload (client-side navigation between pages doesn't
// reset module state). This endpoint is small and infrequently called, so
// the extra request is worth the freshness.
export function useSiteInfo(): SiteInfo {
  const [info, setInfo] = useState<SiteInfo>(DEFAULT_SITE_INFO);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings/public')
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: Partial<SiteInfo>) => {
        if (cancelled) return;
        setInfo({
          site_title: data.site_title || DEFAULT_SITE_INFO.site_title,
          site_email: data.site_email || DEFAULT_SITE_INFO.site_email,
          site_whatsapp: data.site_whatsapp || DEFAULT_SITE_INFO.site_whatsapp,
          site_location: data.site_location || DEFAULT_SITE_INFO.site_location,
          hero_image: data.hero_image || DEFAULT_SITE_INFO.hero_image,
        });
      })
      .catch(() => {
        if (!cancelled) setInfo(DEFAULT_SITE_INFO);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return info;
}
