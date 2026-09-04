import { Dialog } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { CuratedVideoForm } from '@/features/gameMedia/components/CuratedVideoForm';

// Renders inside a real Dialog + router, matching how this form is always
// actually mounted in the app (AdminGameMediaDetailPage / GlobalVideoPanel
// both open it inside a MUI Dialog, and it needs a data router for
// UnsavedChangesDialog's useBlocker).
const renderInDialog = (ui: React.ReactElement) => {
  const router = createMemoryRouter(
    [{ path: '/', element: <Dialog open>{ui}</Dialog> }],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
};

describe('CuratedVideoForm — YouTube checker integration', () => {
  it('"Use this video" fills the real Embed URL and Title fields via RHF setValue', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          title: 'Real Title From oEmbed',
          thumbnail_url: 'https://i.ytimg.com/vi/r3kR5f2lToI/hqdefault.jpg',
        }),
        { status: 200 },
      ),
    );
    const user = userEvent.setup();
    renderInDialog(
      <CuratedVideoForm
        isSubmitting={false}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );

    await user.type(
      screen.getByRole('textbox', { name: 'YouTube link' }),
      'https://www.youtube.com/watch?v=r3kR5f2lToI',
    );
    await user.click(
      screen.getByRole('button', { name: 'Check embeddability' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Use this video' }),
    );

    expect(screen.getByRole('textbox', { name: 'Embed URL' })).toHaveValue(
      'https://www.youtube.com/embed/r3kR5f2lToI',
    );
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue(
      'Real Title From oEmbed',
    );
    expect(screen.getByRole('textbox', { name: 'Canonical URL' })).toHaveValue(
      'https://www.youtube.com/watch?v=r3kR5f2lToI',
    );
    expect(screen.getByRole('textbox', { name: 'Thumbnail URL' })).toHaveValue(
      'https://i.ytimg.com/vi/r3kR5f2lToI/hqdefault.jpg',
    );
    fetchSpy.mockRestore();
  });

  it('does not overwrite a title the admin already typed', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ title: 'oEmbed title' }), {
        status: 200,
      }),
    );
    const user = userEvent.setup();
    renderInDialog(
      <CuratedVideoForm
        isSubmitting={false}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );

    await user.type(
      screen.getByRole('textbox', { name: 'Title' }),
      'My own title',
    );
    await user.type(
      screen.getByRole('textbox', { name: 'YouTube link' }),
      'https://www.youtube.com/watch?v=r3kR5f2lToI',
    );
    await user.click(
      screen.getByRole('button', { name: 'Check embeddability' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Use this video' }),
    );

    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue(
      'My own title',
    );
    fetchSpy.mockRestore();
  });

  it('rejects an oEmbed check URL typed directly into Embed URL, with a clear explanation', async () => {
    const user = userEvent.setup();
    renderInDialog(
      <CuratedVideoForm
        isSubmitting={false}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );

    await user.type(
      screen.getByRole('textbox', { name: 'Title' }),
      'Test video',
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Embed URL' }),
      'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=xWr-cyWMdJ4',
    );
    await user.click(screen.getByRole('button', { name: 'Add video' }));

    expect(
      await screen.findByText(/oEmbed check URL, not the embed URL/),
    ).toBeInTheDocument();
  });
});
