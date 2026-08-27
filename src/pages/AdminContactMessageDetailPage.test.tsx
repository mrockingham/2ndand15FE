import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { currentUserFixture, jsonResponse } from '@/test/authFixtures';
import { contactMessageFixture } from '@/test/contactFixtures';
import { renderApp } from '@/test/renderApp';

describe('admin contact message detail', () => {
  it('lets an ADMIN change the status', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ data: contactMessageFixture }))
      .mockResolvedValueOnce(
        jsonResponse({ data: { ...contactMessageFixture, status: 'READ' } }),
      );
    renderApp(`/admin/contact-messages/${contactMessageFixture.id}`, {
      currentUser: { ...currentUserFixture, role: 'ADMIN' },
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    expect(
      await screen.findByText(contactMessageFixture.message),
    ).toBeInTheDocument();
    await user.click(screen.getByLabelText('Status'));
    await user.click(await screen.findByRole('option', { name: 'READ' }));

    const patchRequest = fetchImplementation.mock.calls[1]?.[1];
    expect(patchRequest?.method).toBe('PATCH');
    expect(JSON.parse(String(patchRequest?.body))).toEqual({ status: 'READ' });
  });

  it('shows a read-only status chip for an EDITOR', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ data: contactMessageFixture }));
    renderApp(`/admin/contact-messages/${contactMessageFixture.id}`, {
      currentUser: { ...currentUserFixture, role: 'EDITOR' },
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    expect(
      await screen.findByText(contactMessageFixture.message),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
  });
});
