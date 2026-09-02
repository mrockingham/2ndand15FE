import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  type AnalyticsConsent,
  disableGoogleAnalytics,
  getGoogleAnalyticsMeasurementId,
  initializeGoogleAnalytics,
  isTrackableAnalyticsPath,
  readAnalyticsConsent,
  trackPublicPageView,
} from '@/features/analytics/analytics';

export const AnalyticsRouteTracker = () => {
  const { pathname } = useLocation();
  const measurementId = getGoogleAnalyticsMeasurementId();
  const [consent, setConsent] = useState<AnalyticsConsent | null>(
    readAnalyticsConsent,
  );
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const handleConsent = (event: Event) => {
      setConsent((event as CustomEvent<AnalyticsConsent>).detail);
    };
    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, handleConsent);
    return () =>
      window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, handleConsent);
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || !measurementId) return;
    if (consent === 'granted') initializeGoogleAnalytics(measurementId);
    else {
      disableGoogleAnalytics(measurementId);
      lastTrackedPath.current = null;
    }
  }, [consent, measurementId]);

  useEffect(() => {
    if (
      !import.meta.env.PROD ||
      !measurementId ||
      consent !== 'granted' ||
      !isTrackableAnalyticsPath(pathname) ||
      lastTrackedPath.current === pathname
    )
      return;
    trackPublicPageView(measurementId, pathname);
    lastTrackedPath.current = pathname;
  }, [consent, measurementId, pathname]);

  return null;
};
