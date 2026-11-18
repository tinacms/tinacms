import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RefObject } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentForm } from '../admin/document-form';
import { LevelHead } from '../test/level-head';
import { asResolvedConfig } from '../config';
import { toFieldAddress } from '../core/field/address';
import type { CollectionSchema } from '../core/schema/types';
import { toFormId, useFormStore } from '../form/form-store';
import { t } from '../index';
import arrayFieldPlugin from '../plugins/fields/array/array-field.plugin';
import objectFieldPlugin from '../plugins/fields/object/object-field.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import { activateMessage, readyMessage } from '../preview/protocol';
import { FormProvider, TinaProvider } from './index';
import { usePreviewConnection } from './preview-connection';

const blocksField = (name: string) =>
  t.array({
    name,
    label: 'Blocks',
    templates: [
      {
        name: 'hero',
        label: 'Hero',
        fields: [t.string({ name: 'headline', label: 'Headline' })],
      },
      {
        name: 'quote',
        label: 'Quote',
        fields: [t.string({ name: 'text', label: 'Text' })],
      },
    ],
  });

const page: CollectionSchema = {
  name: 'page',
  path: 'content/pages',
  format: 'mdx',
  fields: [
    blocksField('blocks'),
    blocksField('solo'),
    t.object({
      name: 'wrap',
      label: 'Wrap',
      fields: [
        t.object({
          name: 'inner',
          label: 'Inner',
          fields: [blocksField('blocks')],
        }),
      ],
    }),
    t.array({
      name: 'rows',
      label: 'Rows',
      fields: [
        t.string({ name: 'title', label: 'Title' }),
        t.array({
          name: 'inner',
          label: 'Inner',
          fields: [t.string({ name: 'note', label: 'Note' })],
        }),
      ],
    }),
  ],
};

const HOME = 'content/pages/home.mdx';
const OTHER = 'content/pages/other.mdx';
const URL_HOME = 'http://site.test/home';

const homeDocument = {
  blocks: [
    { _template: 'hero', headline: 'Welcome' },
    { _template: 'quote', text: 'Hi' },
  ],
  solo: [{ _template: 'hero', headline: 'Only' }],
  wrap: {
    inner: {
      blocks: [
        { _template: 'hero', headline: 'Deep' },
        { _template: 'quote', text: 'Deeper' },
      ],
    },
  },
  rows: [{ title: 'One', inner: [{ note: 'a' }] }],
};

function Connection({
  iframeRef,
}: {
  iframeRef: RefObject<HTMLIFrameElement | null>;
}) {
  usePreviewConnection(iframeRef, { open: { collection: 'page', path: HOME } });
  return null;
}

async function setup({ withOther = false } = {}) {
  const contentWindow = { postMessage: vi.fn() };
  const iframeRef = {
    current: { contentWindow } as unknown as HTMLIFrameElement,
  } as RefObject<HTMLIFrameElement | null>;
  const user = userEvent.setup();
  const view = render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [objectFieldPlugin, arrayFieldPlugin, stringFieldPlugin],
        schema: { collections: [page] },
      })}
    >
      <Connection iframeRef={iframeRef} />
      <button type='button'>outside the form</button>
      <FormProvider collection={page} path={HOME} document={homeDocument}>
        <LevelHead />
        <DocumentForm />
      </FormProvider>
      {withOther ? (
        <FormProvider
          collection={page}
          path={OTHER}
          document={{ blocks: homeDocument.blocks }}
        >
          <DocumentForm />
        </FormProvider>
      ) : null}
    </TinaProvider>
  );
  await screen.findAllByRole('button', { name: 'Actions for Item 1' });

  const fromPage = (data: unknown) => {
    const event = new MessageEvent('message', { data });
    Object.defineProperty(event, 'origin', { value: window.origin });
    Object.defineProperty(event, 'source', { value: contentWindow });
    act(() => {
      window.dispatchEvent(event);
    });
  };
  fromPage(readyMessage([{ path: HOME }], URL_HOME));

  const lastOutline = () =>
    contentWindow.postMessage.mock.calls
      .map(([message]) => message)
      .filter((message) => message.type === 'tina:outline')
      .at(-1);
  const activate = (address: string) =>
    act(() => {
      useFormStore
        .getState()
        .setActive(toFormId(HOME), toFieldAddress(address));
    });
  const card = (address: string) => {
    const found = view.container.querySelector<HTMLElement>(
      `[data-item-address="${address}"]`
    );
    if (!found) throw new Error(`no card at ${address}`);
    return found;
  };
  const grip = (address: string) => {
    const found = card(address).querySelector<HTMLElement>('[data-grip]');
    if (!found) throw new Error(`no grip on ${address}`);
    return found;
  };
  const actions = (address: string) =>
    within(card(address)).getAllByRole('button', { name: /^Actions for/ })[0];
  return {
    ...view,
    user,
    lastOutline,
    activate,
    card,
    grip,
    actions,
    fromPage,
  };
}

beforeEach(() => {
  act(() => {
    useFormStore.setState({ forms: {}, active: null, hovered: null });
  });
});

describe('the card the page outlines', () => {
  it('outlines the hovered card, not its list', async () => {
    const { user, card, lastOutline, activate } = await setup();
    activate('blocks');
    await user.hover(card('blocks.1'));
    await waitFor(() =>
      expect(lastOutline().hovered).toMatchObject({ address: 'blocks.1' })
    );
  });

  it("outlines a card whose grip has focus with the card's title, and opens no level", async () => {
    const { grip, lastOutline, activate } = await setup();
    activate('blocks');
    act(() => grip('blocks.0').focus());
    await waitFor(() =>
      expect(lastOutline().active).toMatchObject({
        address: 'blocks.0',
        name: 'Hero',
      })
    );
    expect(useFormStore.getState().active?.address).toBe('blocks');
    expect(
      screen.queryByRole('heading', { level: 2, name: 'Hero' })
    ).toBeNull();
  });

  it('keeps the card outlined while its portalled Actions menu is open', async () => {
    const { user, grip, actions, lastOutline, activate } = await setup();
    activate('blocks');
    act(() => grip('blocks.0').focus());
    await waitFor(() => expect(lastOutline().active.address).toBe('blocks.0'));
    await user.click(actions('blocks.0'));
    await screen.findByRole('menuitem', { name: /^Move down/ });
    await waitFor(() =>
      expect(document.activeElement?.closest('[data-array-item]')).toBeNull()
    );
    expect(lastOutline().active).toMatchObject({ address: 'blocks.0' });
  });

  it('lets go of the card when focus leaves the form, and keeps it while the Actions menu is open', async () => {
    const { user, grip, actions, lastOutline, activate } = await setup();
    activate('blocks');
    act(() => grip('blocks.0').focus());
    await waitFor(() => expect(lastOutline().active.address).toBe('blocks.0'));

    act(() => (document.activeElement as HTMLElement).blur());
    await waitFor(() => expect(lastOutline().active.address).toBe('blocks'));

    act(() => grip('blocks.0').focus());
    await waitFor(() => expect(lastOutline().active.address).toBe('blocks.0'));
    act(() => screen.getByRole('button', { name: 'outside the form' }).focus());
    await waitFor(() => expect(lastOutline().active.address).toBe('blocks'));

    act(() => grip('blocks.0').focus());
    await user.click(actions('blocks.0'));
    await screen.findByRole('menuitem', { name: /^Move down/ });
    await waitFor(() => expect(lastOutline().active.address).toBe('blocks.0'));
  });

  it("outlines the card's new index after Move down", async () => {
    const { user, grip, actions, lastOutline, activate } = await setup();
    activate('blocks');
    act(() => grip('blocks.0').focus());
    await user.click(actions('blocks.0'));
    await user.click(
      await screen.findByRole('menuitem', { name: /^Move down/ })
    );
    await waitFor(() =>
      expect(lastOutline().active).toMatchObject({
        address: 'blocks.1',
        name: 'Hero',
      })
    );
  });

  it('outlines the inner card for an inner grip, then the outer card when focus goes back to its Actions button', async () => {
    const { user, card, grip, actions, lastOutline, activate } = await setup();
    activate('rows');
    await user.click(
      within(card('rows.0')).getAllByRole('button', { expanded: false })[0]
    );
    await screen.findByLabelText('Title');

    activate('rows.0.inner');
    act(() => grip('rows.0.inner.0').focus());
    await waitFor(() =>
      expect(lastOutline().active.address).toBe('rows.0.inner.0')
    );

    activate('rows');
    act(() => actions('rows.0').focus());
    await waitFor(() => expect(lastOutline().active.address).toBe('rows.0'));
  });

  it("never outlines another form's card as this form's", async () => {
    const { container, lastOutline, activate } = await setup({
      withOther: true,
    });
    const otherGrip = container.querySelectorAll<HTMLElement>(
      `[data-form-id="${toFormId(OTHER)}"] [data-grip]`
    )[0];
    act(() => otherGrip.focus());
    activate('blocks');
    await waitFor(() =>
      expect(lastOutline().active).toMatchObject({
        address: 'blocks',
        document: HOME,
      })
    );
  });

  it('outlines the card Remove focuses', async () => {
    const { user, actions, lastOutline, activate } = await setup();
    activate('blocks');
    await user.click(actions('blocks.0'));
    await user.click(await screen.findByRole('menuitem', { name: /^Remove/ }));
    await waitFor(() =>
      expect(lastOutline().active).toMatchObject({
        address: 'blocks.0',
        name: 'Quote',
      })
    );
  });

  it("outlines the list's own address when its only card is removed", async () => {
    const { user, grip, actions, lastOutline, activate } = await setup();
    activate('solo');
    act(() => grip('solo.0').focus());
    await waitFor(() => expect(lastOutline().active.address).toBe('solo.0'));
    await user.click(actions('solo.0'));
    await user.click(await screen.findByRole('menuitem', { name: /^Remove/ }));
    await waitFor(() => expect(lastOutline().active.address).toBe('solo'));
  });

  it('outlines the list, not the card, after the page activates the list', async () => {
    const { grip, lastOutline, activate, fromPage } = await setup();
    activate('blocks');
    act(() => grip('blocks.0').focus());
    await waitFor(() => expect(lastOutline().active.address).toBe('blocks.0'));
    fromPage(activateMessage('blocks', HOME));
    await waitFor(() => expect(lastOutline().active.address).toBe('blocks'));
  });

  describe.each([
    { list: 'blocks', open: 'blocks.0', root: 'blocks' },
    {
      list: 'wrap.inner.blocks',
      open: 'wrap.inner.blocks.0',
      root: 'wrap.inner.blocks',
    },
  ])('after stepping back to $list', ({ open, root }) => {
    async function steppedBack() {
      const harness = await setup();
      harness.activate(open);
      await screen.findByRole('heading', { level: 2, name: 'Hero' });
      const trail = within(
        screen.getByRole('navigation', { name: 'Location' })
      );
      await harness.user.click(
        trail.getAllByRole('button').at(-1) as HTMLElement
      );
      await screen.findAllByRole('button', { name: 'Actions for Item 1' });
      return harness;
    }
    const ringed = (container: HTMLElement) =>
      container.querySelectorAll('[data-slot="list-card-item"][data-active]');

    it('outlines the returned card, follows it on Move down, and keeps it when focus goes to <body>', async () => {
      const { user, container, actions, lastOutline } = await steppedBack();
      await waitFor(() =>
        expect(lastOutline().active).toMatchObject({
          address: `${root}.0`,
          name: 'Hero',
        })
      );
      act(() => (document.activeElement as HTMLElement).blur());
      await act(async () => {});
      expect(ringed(container)).toHaveLength(1);
      await waitFor(() =>
        expect(lastOutline().active.address).toBe(`${root}.0`)
      );
      await user.click(actions(`${root}.0`));
      await user.click(
        await screen.findByRole('menuitem', { name: /^Move down/ })
      );
      await waitFor(() =>
        expect(lastOutline().active.address).toBe(`${root}.1`)
      );
    });

    it('shows the list in the form and on the page after the page activates it', async () => {
      const { container, lastOutline, fromPage } = await steppedBack();
      await waitFor(() =>
        expect(lastOutline().active.address).toBe(`${root}.0`)
      );
      expect(ringed(container)).toHaveLength(1);
      fromPage(activateMessage(root, HOME));
      await waitFor(() => expect(lastOutline().active.address).toBe(root));
      expect(ringed(container)).toHaveLength(0);
    });
  });
});
