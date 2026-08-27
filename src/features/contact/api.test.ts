import {
  getContactMessage,
  listContactMessages,
  submitContactMessage,
  updateContactMessageStatus,
} from '@/features/contact/api';
import { createApiClient } from '@/services/api/apiClient';
import { jsonResponse } from '@/test/authFixtures';
import { contactMessageFixture } from '@/test/contactFixtures';

describe('contact HTTP boundary', () => {
  it('submits public messages unauthenticated', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse({ data: { message: 'Thanks for reaching out.' } }),
      );
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
    });

    const result = await submitContactMessage(client, {
      name: 'Fourth Down Fan',
      email: 'fan@example.com',
      message: 'The play-by-play feed seems to be missing plays.',
    });

    expect(result).toEqual({ message: 'Thanks for reaching out.' });
    const request = fetchImplementation.mock.calls[0]?.[1];
    expect(new Headers(request?.headers).get('Authorization')).toBeNull();
    expect(String(fetchImplementation.mock.calls[0]?.[0])).toContain(
      '/contact',
    );
  });

  it('unwraps the nested nextCursor shape from the admin list endpoint', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        data: {
          messages: [contactMessageFixture],
          nextCursor: 'next-page-cursor',
        },
      }),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
      getAccessToken: () => 'token',
    });

    const page = await listContactMessages(client, { limit: 25 });

    expect(page).toEqual({
      messages: [contactMessageFixture],
      nextCursor: 'next-page-cursor',
    });
  });

  it('fetches a single message and updates its status', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockImplementation(() =>
        Promise.resolve(jsonResponse({ data: contactMessageFixture })),
      );
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
      getAccessToken: () => 'token',
    });

    await getContactMessage(client, contactMessageFixture.id);
    await updateContactMessageStatus(client, contactMessageFixture.id, 'READ');

    expect(String(fetchImplementation.mock.calls[0]?.[0])).toContain(
      `/admin/contact-messages/${contactMessageFixture.id}`,
    );
    const patchRequest = fetchImplementation.mock.calls[1]?.[1];
    expect(patchRequest?.method).toBe('PATCH');
    expect(JSON.parse(String(patchRequest?.body))).toEqual({ status: 'READ' });
  });
});
