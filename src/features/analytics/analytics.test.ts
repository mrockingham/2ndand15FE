import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  getGoogleAnalyticsMeasurementId,
  initializeGoogleAnalytics,
  isTrackableAnalyticsPath,
  readAnalyticsConsent,
  saveAnalyticsConsent,
  trackPublicPageView,
} from '@/features/analytics/analytics';

describe('Google Analytics boundary', () => {
  afterEach(() => {
    document.head
      .querySelector('script[data-google-analytics="true"]')
      ?.remove();
    delete window.dataLayer;
    delete window.gtag;
  });

  it('accepts a GA4 measurement ID and rejects malformed configuration', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'g-abc123');
    expect(getGoogleAnalyticsMeasurementId()).toBe('G-ABC123');
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'UA-legacy');
    expect(getGoogleAnalyticsMeasurementId()).toBeNull();
  });

  it('tracks public paths but excludes private and placeholder routes', () => {
    expect(isTrackableAnalyticsPath('/news/story')).toBe(true);
    expect(isTrackableAnalyticsPath('/power-rankings')).toBe(true);
    expect(isTrackableAnalyticsPath('/account')).toBe(false);
    expect(isTrackableAnalyticsPath('/admin/games')).toBe(false);
    expect(isTrackableAnalyticsPath('/reset-password')).toBe(false);
    expect(isTrackableAnalyticsPath('/fantasy')).toBe(false);
  });

  it('persists and announces the visitor consent choice', () => {
    const listener = vi.fn();
    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, listener);
    saveAnalyticsConsent('granted');
    expect(readAnalyticsConsent()).toBe('granted');
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, listener);
  });

  it('queues a sanitized pathname-only page view', () => {
    initializeGoogleAnalytics('G-TEST123');
    const gtag = vi.spyOn(window, 'gtag');
    trackPublicPageView('G-TEST123', '/news/week-one');

    expect(gtag).toHaveBeenCalledWith(
      'event',
      'page_view',
      expect.objectContaining({
        page_location: 'http://localhost:3000/news/week-one',
        page_path: '/news/week-one',
        send_to: 'G-TEST123',
      }),
    );
  });
});
