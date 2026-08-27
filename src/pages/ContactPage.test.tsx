import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { apiErrorResponse, jsonResponse } from '@/test/authFixtures';
import { renderApp } from '@/test/renderApp';

const fillContactForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(await screen.findByLabelText('Name'), 'Fourth Down Fan');
  await user.type(screen.getByLabelText('Email'), 'fan@example.com');
  await user.type(
    screen.getByLabelText('Message'),
    'The play-by-play feed seems to be missing plays.',
  );
};

const isContactSubmit = (input: unknown, init?: RequestInit) =>
  String(input).includes('/contact') && init?.method === 'POST';

const backgroundResponse = () => jsonResponse({ data: [] });

describe('contact page', () => {
  it('shows frontend validation before sending an invalid submission', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockImplementation(() => Promise.resolve(backgroundResponse()));
    renderApp('/contact', { fetchImplementation });

    await user.click(
      await screen.findByRole('button', { name: /send message/i }),
    );

    expect(await screen.findByText('Enter your name.')).toBeInTheDocument();
    expect(
      fetchImplementation.mock.calls.some(([input, init]) =>
        isContactSubmit(input, init),
      ),
    ).toBe(false);
  });

  it('submits a valid message with an empty honeypot field and shows success', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockImplementation((input, init) =>
        Promise.resolve(
          isContactSubmit(input, init)
            ? jsonResponse({
                data: {
                  message:
                    "Thanks -- we've received your message and will follow up soon.",
                },
              })
            : backgroundResponse(),
        ),
      );
    renderApp('/contact', { fetchImplementation });
    await fillContactForm(user);

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('Message sent')).toBeInTheDocument();
    const submitCall = fetchImplementation.mock.calls.find(([input, init]) =>
      isContactSubmit(input, init),
    );
    const body = JSON.parse(String(submitCall?.[1]?.body)) as Record<
      string,
      unknown
    >;
    expect(body).toMatchObject({
      name: 'Fourth Down Fan',
      email: 'fan@example.com',
      website: '',
    });
  });

  it('shows a friendly message when the contact endpoint is rate limited', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockImplementation((input, init) =>
        Promise.resolve(
          isContactSubmit(input, init)
            ? apiErrorResponse('RATE_LIMIT_EXCEEDED', 'Too many messages.', 429)
            : backgroundResponse(),
        ),
      );
    renderApp('/contact', { fetchImplementation });
    await fillContactForm(user);

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(
      await screen.findByText(/sent several messages recently/i),
    ).toBeInTheDocument();
  });

  it('shows a generic error message on a server failure', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockImplementation((input, init) =>
        Promise.resolve(
          isContactSubmit(input, init)
            ? apiErrorResponse('INTERNAL_ERROR', 'Something broke.', 500)
            : backgroundResponse(),
        ),
      );
    renderApp('/contact', { fetchImplementation });
    await fillContactForm(user);

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(
      await screen.findByText(/couldn.t send your message/i),
    ).toBeInTheDocument();
  });
});
