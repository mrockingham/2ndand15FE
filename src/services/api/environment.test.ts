import { readAppEnvironment } from '@/services/api/environment';

describe('API environment validation', () => {
  it('requires an API base URL', () => {
    expect(() => readAppEnvironment({})).toThrow(
      'VITE_API_BASE_URL is required',
    );
  });

  it('requires an absolute HTTP URL', () => {
    expect(() => readAppEnvironment({ VITE_API_BASE_URL: '/api/v1' })).toThrow(
      'must be an absolute URL',
    );
    expect(() =>
      readAppEnvironment({ VITE_API_BASE_URL: 'file:///api/v1' }),
    ).toThrow('must use HTTP or HTTPS');
  });

  it('normalizes a valid URL without exposing credentials', () => {
    expect(
      readAppEnvironment({
        VITE_API_BASE_URL: 'http://localhost:3000/api/v1/',
      }),
    ).toEqual({
      apiBaseUrl: 'http://localhost:3000/api/v1',
      passwordRecoveryEnabled: true,
    });

    expect(() =>
      readAppEnvironment({
        VITE_API_BASE_URL: 'https://user:secret@example.com/api/v1',
      }),
    ).toThrow('must not include credentials');
  });

  it('enables password recovery unless explicitly disabled', () => {
    expect(
      readAppEnvironment({ VITE_API_BASE_URL: 'http://localhost:3000/api/v1' })
        .passwordRecoveryEnabled,
    ).toBe(true);

    expect(
      readAppEnvironment({
        VITE_API_BASE_URL: 'http://localhost:3000/api/v1',
        VITE_PASSWORD_RECOVERY_ENABLED: 'false',
      }).passwordRecoveryEnabled,
    ).toBe(false);
  });
});
