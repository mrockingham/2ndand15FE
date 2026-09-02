export type AnalyticsConsent = 'granted' | 'denied';

export const ANALYTICS_CONSENT_STORAGE_KEY = '2nd-and-15-analytics-consent';
export const ANALYTICS_CONSENT_CHANGE_EVENT =
  '2nd-and-15-analytics-consent-change';
export const ANALYTICS_CHOICES_REQUEST_EVENT =
  '2nd-and-15-analytics-choices-request';

const GA_MEASUREMENT_ID = /^G-[A-Z0-9]+$/;
const PRIVATE_ROUTE =
  /^\/(?:admin|account|choose-team|login|register|forgot-password|reset-password)(?:\/|$)/;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const getGoogleAnalyticsMeasurementId = () => {
  const candidate =
    import.meta.env.VITE_GA_MEASUREMENT_ID?.trim().toUpperCase();
  return candidate && GA_MEASUREMENT_ID.test(candidate) ? candidate : null;
};

export const isAnalyticsConfigured = () =>
  import.meta.env.PROD && getGoogleAnalyticsMeasurementId() !== null;

export const isTrackableAnalyticsPath = (pathname: string) =>
  !PRIVATE_ROUTE.test(pathname) && pathname !== '/fantasy';

export const readAnalyticsConsent = (): AnalyticsConsent | null => {
  try {
    const stored = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : null;
  } catch {
    return null;
  }
};

export const saveAnalyticsConsent = (consent: AnalyticsConsent) => {
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
  } catch {
    // The in-memory event still applies the choice for this page session.
  }
  window.dispatchEvent(
    new CustomEvent<AnalyticsConsent>(ANALYTICS_CONSENT_CHANGE_EVENT, {
      detail: consent,
    }),
  );
};

export const requestAnalyticsChoices = () => {
  window.dispatchEvent(new Event(ANALYTICS_CHOICES_REQUEST_EVENT));
};

const setGaDisabled = (measurementId: string, disabled: boolean) => {
  const flags = window as unknown as Record<string, boolean>;
  flags[`ga-disable-${measurementId}`] = disabled;
};

export const initializeGoogleAnalytics = (measurementId: string) => {
  setGaDisabled(measurementId, false);
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    });
  window.gtag('js', new Date());
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('config', measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  if (!document.querySelector('script[data-google-analytics="true"]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.googleAnalytics = 'true';
    document.head.append(script);
  }
};

export const disableGoogleAnalytics = (measurementId: string) => {
  setGaDisabled(measurementId, true);
  window.gtag?.('consent', 'update', {
    analytics_storage: 'denied',
  });
};

export const trackPublicPageView = (
  measurementId: string,
  pathname: string,
) => {
  if (!isTrackableAnalyticsPath(pathname)) return;
  const pageLocation = new URL(pathname, window.location.origin).toString();
  window.gtag?.('event', 'page_view', {
    send_to: measurementId,
    page_title: document.title,
    page_location: pageLocation,
    page_path: pathname,
  });
};
