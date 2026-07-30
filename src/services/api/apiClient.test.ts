import { createApiClient } from '@/services/api/apiClient';

describe('API client foundation', () => {
  it('includes browser credentials and handles an empty 204 response', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
    });

    await expect(client.request('/health')).resolves.toBeUndefined();
    expect(fetchImplementation).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/health',
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('serializes JSON and can inject a bearer token without owning it', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const client = createApiClient({
      baseUrl: 'https://api.example.test/api/v1/',
      fetchImplementation,
      getAccessToken: () => 'in-memory-token',
    });

    await expect(
      client.request<{ ok: boolean }>('/example', {
        method: 'POST',
        body: { name: 'test' },
      }),
    ).resolves.toEqual({ ok: true });

    const request = fetchImplementation.mock.calls[0]?.[1];
    const headers = new Headers(request?.headers);
    expect(headers.get('Authorization')).toBe('Bearer in-memory-token');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(request?.body).toBe(JSON.stringify({ name: 'test' }));
  });
});
