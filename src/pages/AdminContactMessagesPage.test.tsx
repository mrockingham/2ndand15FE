import { screen, waitFor } from '@testing-library/react';

import { currentUserFixture, jsonResponse } from '@/test/authFixtures';
import { contactMessageFixture } from '@/test/contactFixtures';
import { renderApp } from '@/test/renderApp';

describe('admin contact messages list', () => {
  it('lists messages for an EDITOR using the nested nextCursor response shape', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        data: { messages: [contactMessageFixture], nextCursor: null },
      }),
    );
    renderApp('/admin/contact-messages', {
      currentUser: { ...currentUserFixture, role: 'EDITOR' },
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    expect(
      await screen.findByText(contactMessageFixture.name),
    ).toBeInTheDocument();
    expect(
      screen.getByText(contactMessageFixture.subject ?? ''),
    ).toBeInTheDocument();
  });

  it('denies USER role access to the admin contact list', async () => {
    const fetchImplementation = vi.fn<typeof fetch>();
    const { router } = renderApp('/admin/contact-messages', {
      currentUser: { ...currentUserFixture, role: 'USER' },
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
    });
    expect(screen.queryByText('Contact messages')).not.toBeInTheDocument();
  });
});
