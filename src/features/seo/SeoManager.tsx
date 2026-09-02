import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { resolveRouteSeo } from '@/features/seo/routeSeo';
import { useSeoMetadata } from '@/features/seo/seo';

export const SeoManager = () => {
  const { pathname } = useLocation();
  const metadata = useMemo(() => resolveRouteSeo(pathname), [pathname]);
  useSeoMetadata(metadata);
  return null;
};
