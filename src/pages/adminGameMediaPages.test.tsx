import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { currentUserFixture } from '@/test/authFixtures';
import { globalVideoFixture } from '@/test/gameMediaFixtures';
import { renderApp } from '@/test/renderApp';

const adminUserFixture = { ...currentUserFixture, role: 'ADMIN' as const };
const editorUserFixture = { ...currentUserFixture, role: 'EDITOR' as const };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const emptyGamesList = () => json({ data: [] });

describe('Admin Game Media — global video panel', () => {
  it('ADMIN sees the empty state with an Add Global Video button', async () => {
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/global-video'))
        return Promise.resolve(json({ data: null }));
      if (url.pathname.endsWith('/games'))
        return Promise.resolve(emptyGamesList());
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });
    renderApp('/admin/game-media', {
      restorationStatus: 'authenticated',
      currentUser: adminUserFixture,
      fetchImplementation,
    });

    expect(
      await screen.findByText('No global video configured.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add Global Video' }),
    ).toBeInTheDocument();
  });

  it('EDITOR sees the empty state without an Add Global Video button', async () => {
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/global-video'))
        return Promise.resolve(json({ data: null }));
      if (url.pathname.endsWith('/games'))
        return Promise.resolve(emptyGamesList());
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });
    renderApp('/admin/game-media', {
      restorationStatus: 'authenticated',
      currentUser: editorUserFixture,
      fetchImplementation,
    });

    expect(
      await screen.findByText('No global video configured.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add Global Video' }),
    ).not.toBeInTheDocument();
  });

  it('renders the active global video with Edit/Remove for ADMIN', async () => {
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/global-video'))
        return Promise.resolve(json({ data: globalVideoFixture }));
      if (url.pathname.endsWith('/games'))
        return Promise.resolve(emptyGamesList());
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });
    renderApp('/admin/game-media', {
      restorationStatus: 'authenticated',
      currentUser: adminUserFixture,
      fetchImplementation,
    });

    expect(
      await screen.findByText(globalVideoFixture.title),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Edit Global Video' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('renders the active global video without Edit/Remove for EDITOR', async () => {
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/global-video'))
        return Promise.resolve(json({ data: globalVideoFixture }));
      if (url.pathname.endsWith('/games'))
        return Promise.resolve(emptyGamesList());
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });
    renderApp('/admin/game-media', {
      restorationStatus: 'authenticated',
      currentUser: editorUserFixture,
      fetchImplementation,
    });

    expect(
      await screen.findByText(globalVideoFixture.title),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit Global Video' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remove' }),
    ).not.toBeInTheDocument();
  });

  it('adding a global video calls PUT and shows it once saved', async () => {
    const user = userEvent.setup();
    let saved: unknown = null;
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/global-video')) {
        if (init?.method === 'PUT') {
          saved = { ...globalVideoFixture };
          return Promise.resolve(json({ data: saved }));
        }
        return Promise.resolve(json({ data: saved }));
      }
      if (url.pathname.endsWith('/games'))
        return Promise.resolve(emptyGamesList());
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });
    renderApp('/admin/game-media', {
      restorationStatus: 'authenticated',
      currentUser: adminUserFixture,
      fetchImplementation,
    });

    await screen.findByText('No global video configured.');
    await user.click(screen.getByRole('button', { name: 'Add Global Video' }));
    await screen.findByRole('heading', { name: 'Add global video' });
    await user.type(
      await screen.findByRole('textbox', { name: 'Title' }),
      globalVideoFixture.title,
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Embed URL' }),
      globalVideoFixture.embedUrl,
    );
    await user.click(screen.getByRole('button', { name: 'Add global video' }));

    await waitFor(() =>
      expect(fetchImplementation).toHaveBeenCalledWith(
        expect.stringContaining('/admin/game-media/global-video'),
        expect.objectContaining({ method: 'PUT' }),
      ),
    );
    expect(
      await screen.findByText(globalVideoFixture.title),
    ).toBeInTheDocument();
  });

  it('removing the global video calls DELETE and returns to the empty state', async () => {
    const user = userEvent.setup();
    let current: unknown = globalVideoFixture;
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/global-video')) {
        if (init?.method === 'DELETE') {
          const deleted = current;
          current = null;
          return Promise.resolve(json({ data: deleted }));
        }
        return Promise.resolve(json({ data: current }));
      }
      if (url.pathname.endsWith('/games'))
        return Promise.resolve(emptyGamesList());
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });
    renderApp('/admin/game-media', {
      restorationStatus: 'authenticated',
      currentUser: adminUserFixture,
      fetchImplementation,
    });

    await screen.findByText(globalVideoFixture.title);
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await user.click(
      screen.getByRole('button', { name: 'Remove global video' }),
    );

    await waitFor(() =>
      expect(fetchImplementation).toHaveBeenCalledWith(
        expect.stringContaining('/admin/game-media/global-video'),
        expect.objectContaining({ method: 'DELETE' }),
      ),
    );
    expect(
      await screen.findByText('No global video configured.'),
    ).toBeInTheDocument();
  });
});
