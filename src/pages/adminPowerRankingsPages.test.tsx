import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { currentUserFixture, jsonResponse } from '@/test/authFixtures';
import {
  adminPowerRankingEditionDetailFixture,
  adminPowerRankingEditionFixture,
  adminPowerRankingEntryFixtures,
  powerRankingImportPreviewFixture,
  powerRankingImportPreviewWithErrorsFixture,
  powerRankingImportUpsertFixture,
  validPowerRankingsImportJson,
} from '@/test/powerRankingsFixtures';
import { renderApp } from '@/test/renderApp';

const editor = { ...currentUserFixture, role: 'EDITOR' as const };
const user_ = { ...currentUserFixture, role: 'USER' as const };

describe('Admin Power Rankings — role gating', () => {
  it('redirects a non-EDITOR/ADMIN user away from the admin section', async () => {
    const fetchImplementation = vi.fn<typeof fetch>();
    const { router } = renderApp('/admin/power-rankings', {
      currentUser: user_,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
    });
    expect(
      screen.queryByRole('heading', { name: 'Power Rankings' }),
    ).not.toBeInTheDocument();
  });
});

describe('Admin Power Rankings — edition list', () => {
  it('lists editions and creates a new one', async () => {
    const user = userEvent.setup();
    let editions = [adminPowerRankingEditionFixture];
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/admin/power-rankings') && init?.method === 'POST') {
        const created = {
          ...adminPowerRankingEditionFixture,
          id: 'new-edition-id',
          title: 'Week 1 Power Rankings',
        };
        editions = [...editions, created];
        return Promise.resolve(
          jsonResponse(
            {
              data: {
                edition: created,
                entries: [],
              },
            },
            201,
          ),
        );
      }
      if (
        url.endsWith('/admin/power-rankings') &&
        (!init || init.method === undefined || init.method === 'GET')
      )
        return Promise.resolve(jsonResponse({ data: editions }));
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });

    renderApp('/admin/power-rankings', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    expect(
      await screen.findByRole('heading', { name: 'Power Rankings' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(adminPowerRankingEditionFixture.title),
    ).toBeInTheDocument();
    expect(screen.getByText('DRAFT')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Create edition' }));
    expect(
      await screen.findByRole('heading', {
        name: 'Create Power Rankings edition',
      }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText('Title *'), 'Week 1 Power Rankings');
    await user.type(screen.getByLabelText('Subtitle *'), 'Week 1');
    await user.clear(screen.getByLabelText('Season *'));
    await user.type(screen.getByLabelText('Season *'), '2026');
    await user.type(screen.getByLabelText('Edition *'), 'week-1');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).endsWith('/admin/power-rankings') &&
            reqInit?.method === 'POST',
        ),
      ).toBe(true),
    );
  });

  it('publishes and unpublishes an edition with confirmation', async () => {
    const user = userEvent.setup();
    let status: 'DRAFT' | 'PUBLISHED' = 'DRAFT';
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/publish') && init?.method === 'POST') {
        status = 'PUBLISHED';
        return Promise.resolve(
          jsonResponse({
            data: { ...adminPowerRankingEditionFixture, status },
          }),
        );
      }
      if (url.endsWith('/admin/power-rankings'))
        return Promise.resolve(
          jsonResponse({
            data: [{ ...adminPowerRankingEditionFixture, status }],
          }),
        );
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });

    renderApp('/admin/power-rankings', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    await screen.findByText(adminPowerRankingEditionFixture.title);
    await user.click(screen.getByRole('button', { name: 'Publish' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Publish' }));

    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).endsWith('/publish') && reqInit?.method === 'POST',
        ),
      ).toBe(true),
    );

    // A successful publish invalidates the edition list, so it re-fetches.
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.filter(
          ([reqInput, reqInit]) =>
            String(reqInput).endsWith('/admin/power-rankings') &&
            (!reqInit ||
              reqInit.method === undefined ||
              reqInit.method === 'GET'),
        ).length,
      ).toBeGreaterThan(1),
    );
    expect(await screen.findByText('PUBLISHED')).toBeInTheDocument();
  });
});

describe('Admin Power Rankings — editor page', () => {
  const buildEditorRouter = () => {
    let detail = adminPowerRankingEditionDetailFixture;
    return vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.includes('/entries/reorder') && init?.method === 'POST') {
        const { entryIds } = JSON.parse(String(init.body)) as {
          entryIds: string[];
        };
        const byId = new Map(detail.entries.map((entry) => [entry.id, entry]));
        detail = {
          ...detail,
          entries: entryIds.map((id, index) => ({
            ...byId.get(id)!,
            rank: index + 1,
          })),
        };
        return Promise.resolve(jsonResponse({ data: detail }));
      }
      if (url.includes('/entries/') && init?.method === 'PATCH') {
        const entryId = url.split('/').pop()!;
        const body = JSON.parse(String(init.body)) as Record<string, unknown>;
        detail = {
          ...detail,
          entries: detail.entries.map((entry) =>
            entry.id === entryId ? { ...entry, ...body } : entry,
          ),
        };
        return Promise.resolve(jsonResponse({ data: detail }));
      }
      if (
        url.endsWith(
          `/admin/power-rankings/${adminPowerRankingEditionFixture.id}`,
        ) &&
        init?.method === 'PATCH'
      ) {
        const body = JSON.parse(String(init.body)) as Record<string, unknown>;
        detail = {
          ...detail,
          edition: { ...detail.edition, ...body },
        };
        return Promise.resolve(jsonResponse({ data: detail }));
      }
      if (
        url.endsWith(
          `/admin/power-rankings/${adminPowerRankingEditionFixture.id}`,
        )
      )
        return Promise.resolve(jsonResponse({ data: detail }));
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });
  };

  it('edits edition metadata', async () => {
    const user = userEvent.setup();
    const fetchImplementation = buildEditorRouter();
    renderApp(`/admin/power-rankings/${adminPowerRankingEditionFixture.id}`, {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    const titleField = await screen.findByLabelText('Title');
    await user.clear(titleField);
    await user.type(titleField, 'Updated Title');
    await user.click(screen.getByRole('button', { name: 'Save details' }));

    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).endsWith(
              `/admin/power-rankings/${adminPowerRankingEditionFixture.id}`,
            ) && reqInit?.method === 'PATCH',
        ),
      ).toBe(true),
    );
  });

  it('edits a single entry', async () => {
    const user = userEvent.setup();
    const fetchImplementation = buildEditorRouter();
    renderApp(`/admin/power-rankings/${adminPowerRankingEditionFixture.id}`, {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    const firstEntry = adminPowerRankingEntryFixtures[0]!;
    await user.click(
      await screen.findByRole('button', {
        name: `Edit ${firstEntry.team.name}`,
      }),
    );
    const headlineField = await screen.findByLabelText('Headline');
    await user.clear(headlineField);
    await user.type(headlineField, 'Updated headline');
    await user.click(screen.getByRole('button', { name: 'Save entry' }));

    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).includes(`/entries/${firstEntry.id}`) &&
            reqInit?.method === 'PATCH',
        ),
      ).toBe(true),
    );
  });

  it('reorders entries with up/down controls', async () => {
    const user = userEvent.setup();
    const fetchImplementation = buildEditorRouter();
    renderApp(`/admin/power-rankings/${adminPowerRankingEditionFixture.id}`, {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    const secondEntry = adminPowerRankingEntryFixtures[1]!;
    const moveUp = await screen.findByRole('button', {
      name: `Move ${secondEntry.team.name} up`,
    });
    await user.click(moveUp);

    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).endsWith('/entries/reorder') &&
            reqInit?.method === 'POST',
        ),
      ).toBe(true),
    );
  });

  it('publishes from the editor page', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/publish') && init?.method === 'POST')
        return Promise.resolve(
          jsonResponse({
            data: { ...adminPowerRankingEditionFixture, status: 'PUBLISHED' },
          }),
        );
      if (
        url.endsWith(
          `/admin/power-rankings/${adminPowerRankingEditionFixture.id}`,
        )
      )
        return Promise.resolve(
          jsonResponse({ data: adminPowerRankingEditionDetailFixture }),
        );
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });

    renderApp(`/admin/power-rankings/${adminPowerRankingEditionFixture.id}`, {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    await user.click(await screen.findByRole('button', { name: 'Publish' }));
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([reqInput, reqInit]) =>
            String(reqInput).endsWith('/publish') && reqInit?.method === 'POST',
        ),
      ).toBe(true),
    );
  });
});

describe('Admin Power Rankings — JSON import', () => {
  it('previews a pasted JSON import and applies it without auto-publishing', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (
        url.endsWith('/admin/power-rankings/import') &&
        init?.method === 'POST'
      ) {
        const body = JSON.parse(String(init.body)) as { mode: string };
        return Promise.resolve(
          jsonResponse({
            data:
              body.mode === 'PREVIEW'
                ? powerRankingImportPreviewFixture
                : powerRankingImportUpsertFixture,
          }),
        );
      }
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });

    renderApp('/admin/power-rankings/import', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    const textarea = await screen.findByLabelText('Power Rankings JSON');
    fireEvent.change(textarea, {
      target: { value: validPowerRankingsImportJson },
    });
    await user.click(screen.getByRole('button', { name: 'Preview import' }));

    expect(
      await screen.findByRole('heading', { name: 'Preview result' }),
    ).toBeInTheDocument();
    const applyButton = screen.getByRole('button', {
      name: 'Apply validated import',
    });
    expect(applyButton).toBeEnabled();
    await user.click(applyButton);
    const dialog = await screen.findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Confirm import' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Final import result' }),
    ).toBeInTheDocument();
    expect(
      fetchImplementation.mock.calls.some(
        ([, reqInit]) =>
          reqInit?.method === 'POST' &&
          JSON.parse(String(reqInit.body)).mode === 'UPSERT',
      ),
    ).toBe(true);
    // No auto-publish: the import flow never calls the publish endpoint.
    expect(
      fetchImplementation.mock.calls.some(([reqInput]) =>
        String(reqInput).endsWith('/publish'),
      ),
    ).toBe(false);
  });

  it('accepts a JSON file upload for preview', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (
        url.endsWith('/admin/power-rankings/import') &&
        init?.method === 'POST'
      )
        return Promise.resolve(
          jsonResponse({ data: powerRankingImportPreviewFixture }),
        );
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });

    renderApp('/admin/power-rankings/import', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    const file = new File([validPowerRankingsImportJson], 'rankings.json', {
      type: 'application/json',
    });
    const input = screen.getByLabelText('Select JSON file');
    await user.upload(input, file);

    await waitFor(() =>
      expect(
        (screen.getByLabelText('Power Rankings JSON') as HTMLTextAreaElement)
          .value,
      ).toBe(validPowerRankingsImportJson),
    );
    await user.click(screen.getByRole('button', { name: 'Preview import' }));
    expect(
      await screen.findByRole('heading', { name: 'Preview result' }),
    ).toBeInTheDocument();
  });

  it('shows a parse error for invalid JSON without calling the backend', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.reject(new TypeError('Should not be called')),
    );
    renderApp('/admin/power-rankings/import', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    const textarea = await screen.findByLabelText('Power Rankings JSON');
    fireEvent.change(textarea, { target: { value: '{not valid json' } });
    await user.click(screen.getByRole('button', { name: 'Preview import' }));

    expect(
      await screen.findByText('The import content is not valid JSON.'),
    ).toBeInTheDocument();
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('displays backend validation errors and keeps apply disabled', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (
        url.endsWith('/admin/power-rankings/import') &&
        init?.method === 'POST'
      )
        return Promise.resolve(
          jsonResponse({ data: powerRankingImportPreviewWithErrorsFixture }),
        );
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });

    renderApp('/admin/power-rankings/import', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    const textarea = await screen.findByLabelText('Power Rankings JSON');
    fireEvent.change(textarea, {
      target: { value: validPowerRankingsImportJson },
    });
    await user.click(screen.getByRole('button', { name: 'Preview import' }));

    expect(
      await screen.findByText('Unknown team abbreviation "XXX".'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Apply validated import' }),
    ).toBeDisabled();
  });

  it('invalidates validation when the content changes after a preview', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (
        url.endsWith('/admin/power-rankings/import') &&
        init?.method === 'POST'
      )
        return Promise.resolve(
          jsonResponse({ data: powerRankingImportPreviewFixture }),
        );
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });

    renderApp('/admin/power-rankings/import', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });

    const textarea = await screen.findByLabelText('Power Rankings JSON');
    fireEvent.change(textarea, {
      target: { value: validPowerRankingsImportJson },
    });
    await user.click(screen.getByRole('button', { name: 'Preview import' }));
    await screen.findByRole('heading', { name: 'Preview result' });
    expect(
      screen.getByRole('button', { name: 'Apply validated import' }),
    ).toBeEnabled();

    fireEvent.change(textarea, {
      target: { value: `${validPowerRankingsImportJson} ` },
    });
    expect(
      screen.queryByRole('heading', { name: 'Preview result' }),
    ).not.toBeInTheDocument();
  });
});
