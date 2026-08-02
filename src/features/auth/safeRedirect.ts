const fallbackDestination = '/account';
const publicAuthenticationPaths = new Set([
  '/forgot-password',
  '/login',
  '/register',
  '/reset-password',
  '/choose-team',
]);

export const sanitizeInternalDestination = (
  destination: unknown,
  fallback = fallbackDestination,
) => {
  if (
    typeof destination !== 'string' ||
    !destination.startsWith('/') ||
    destination.startsWith('//') ||
    destination.includes('\\')
  ) {
    return fallback;
  }

  try {
    const url = new URL(destination, 'https://app.2ndand15.local');
    if (url.origin !== 'https://app.2ndand15.local') {
      return fallback;
    }
    if (publicAuthenticationPaths.has(url.pathname)) {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
};

export const readIntendedDestination = (locationState: unknown) => {
  if (
    typeof locationState !== 'object' ||
    locationState === null ||
    !('from' in locationState)
  ) {
    return fallbackDestination;
  }

  return sanitizeInternalDestination(locationState.from);
};
