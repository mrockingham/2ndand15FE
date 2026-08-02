import {
  readIntendedDestination,
  sanitizeInternalDestination,
} from '@/features/auth/safeRedirect';

describe('safe authentication redirects', () => {
  it('allows internal application paths with query and hash', () => {
    expect(sanitizeInternalDestination('/account?tab=profile#details')).toBe(
      '/account?tab=profile#details',
    );
    expect(readIntendedDestination({ from: '/account' })).toBe('/account');
  });

  it.each([
    'https://evil.example/steal',
    '//evil.example/steal',
    '/\\evil.example/steal',
    '/choose-team',
    '/login',
    'account',
    null,
  ])('rejects unsafe destination %s', (destination) => {
    expect(sanitizeInternalDestination(destination)).toBe('/account');
  });
});
