export interface AppEnvironment {
  apiBaseUrl: string;
}

interface EnvironmentInput {
  VITE_API_BASE_URL?: unknown;
}

const normalizeApiBaseUrl = (value: string) => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error('VITE_API_BASE_URL must be an absolute URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('VITE_API_BASE_URL must use HTTP or HTTPS.');
  }

  if (url.username || url.password) {
    throw new Error('VITE_API_BASE_URL must not include credentials.');
  }

  url.hash = '';
  url.search = '';

  return url.toString().replace(/\/$/, '');
};

export const readAppEnvironment = (
  environment: EnvironmentInput,
): AppEnvironment => {
  const apiBaseUrl = environment.VITE_API_BASE_URL;

  if (typeof apiBaseUrl !== 'string' || apiBaseUrl.trim().length === 0) {
    throw new Error(
      'VITE_API_BASE_URL is required. Copy .env.example to .env.',
    );
  }

  return Object.freeze({
    apiBaseUrl: normalizeApiBaseUrl(apiBaseUrl.trim()),
  });
};
