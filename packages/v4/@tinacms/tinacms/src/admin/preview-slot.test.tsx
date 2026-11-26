import { QueryClient } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import { TinaProvider } from '../editor';
import { NoPreview, PreviewSlot } from './preview-slot';

interface HappyDomWindow {
  happyDOM: { settings: { disableIframePageLoading: boolean } };
}

const renderSlot = (src = 'http://localhost:3000/') =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [],
        schema: { collections: [] },
      })}
      queryClient={new QueryClient()}
    >
      <PreviewSlot
        src={src}
        connection={{}}
        expanded={false}
        moveFocus={false}
        onExpandedChange={vi.fn()}
      />
    </TinaProvider>
  );

const frame = async () =>
  (await screen.findByTitle('Preview')) as HTMLIFrameElement;
const address = () => screen.findByRole('textbox', { name: 'Page address' });

const goTo = async (typed: string) => {
  const input = await address();
  await userEvent.clear(input);
  await userEvent.type(input, `${typed}{Enter}`);
};

beforeEach(() => {
  // The test drives the frame's events itself; no page is fetched.
  (
    window as typeof window & HappyDomWindow
  ).happyDOM.settings.disableIframePageLoading = true;
  localStorage.clear();
  vi.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {}));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('the preview slot', () => {
  it('holds the preview frame in a slot the media picker can anchor to', async () => {
    const { container } = renderSlot();
    await waitFor(() =>
      expect(container.querySelector('[data-preview-slot]')).not.toBeNull()
    );
    const slot = container.querySelector('[data-preview-slot]');
    expect(slot).toHaveClass('relative');
    expect(slot?.querySelector('iframe')).toHaveAttribute(
      'src',
      expect.stringContaining('localhost:3000')
    );
  });

  it('shows the page address without its scheme', async () => {
    renderSlot('http://localhost:3000/about');
    expect(await address()).toHaveValue('localhost:3000/about');
  });

  it('moves the frame to a typed address on the same site', async () => {
    renderSlot();
    await goTo('/blog');
    expect((await frame()).src).toBe('http://localhost:3000/blog');
    expect(await address()).toHaveValue('localhost:3000/blog');
  });

  it('turns an address on another site away in words, and clears the words when typing again', async () => {
    renderSlot();
    await goTo('https://example.com/');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Type an address on localhost:3000'
    );
    expect((await frame()).src).toBe('http://localhost:3000/');
    await userEvent.type(await address(), 'x');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('moves the frame to a fragment of the page it shows', async () => {
    renderSlot();
    const shown = await frame();
    fireEvent.load(shown);
    await goTo('/#team');
    expect(shown.src).toBe('http://localhost:3000/#team');
  });

  it('marks the chosen device size', async () => {
    renderSlot();
    const group = await screen.findByRole('group', { name: 'Device size' });
    const [, second] = within(group).getAllByRole('button');
    await userEvent.click(second as HTMLElement);
    expect(second).toHaveAttribute('aria-pressed', 'true');
  });

  it('opens the page in a new tab from the actions menu', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderSlot();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Preview actions' })
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Open in new tab' })
    );
    expect(open).toHaveBeenCalledWith(
      'http://localhost:3000/',
      '_blank',
      'noopener'
    );
  });

  it('loads the page again from Reload in the actions menu', async () => {
    renderSlot();
    const shown = await frame();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Preview actions' })
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Reload' })
    );
    expect(shown.src).toBe('http://localhost:3000/');
  });

  it('shows the page once the site answers and the frame has loaded', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response(''));
    renderSlot();
    expect(
      (await screen.findAllByText('Loading the page')).length
    ).toBeGreaterThan(0);
    fireEvent.load(await frame());
    await waitFor(() =>
      expect(screen.queryAllByText('Loading the page')).toHaveLength(0)
    );
  });

  it('says the page did not load when the site refuses, and loads again from Reload', async () => {
    const fetching = vi
      .spyOn(window, 'fetch')
      .mockRejectedValue(new TypeError('refused'));
    renderSlot();
    fireEvent.load(await frame());
    expect(await screen.findByText(/The page didn’t load/)).toBeVisible();
    fetching.mockResolvedValue(new Response(''));
    await userEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(
      (await screen.findAllByText('Loading the page')).length
    ).toBeGreaterThan(0);
    fireEvent.load(await frame());
    await waitFor(() =>
      expect(screen.queryByText(/The page didn’t load/)).toBeNull()
    );
  });

  it('moves the address box to a page the preview followed to', async () => {
    renderSlot();
    await frame();
    await goTo('/docs');
    fireEvent.load(await frame());
    expect(await address()).toHaveValue('localhost:3000/docs');
  });

  it('says there is no preview, with a link to how to set one up', () => {
    render(<NoPreview />);
    expect(screen.getByRole('button', { name: /set up/i })).toBeVisible();
  });
});
