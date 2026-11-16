import { QueryClient } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, use, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentScope } from '../../../admin/document-scope';
import { asResolvedConfig } from '../../../config';
import type { BranchInfo } from '../../../core/branch/contract';
import { branchSliceOf } from '../../../core/branch/contract';
import { toFieldAddress } from '../../../core/field/address';
import {
  MediaError,
  type MediaFeatures,
  type MediaProvider,
  type MediaUploadOptions,
} from '../../../core/media/contract';
import { definePlugin } from '../../../core/plugin';
import type {
  CollectionSchema,
  TinaDocument,
} from '../../../core/schema/types';
import {
  FormProvider,
  TinaProvider,
  useDiscardEdits,
  useFormId,
  useFormSave,
  useFormStatus,
  useStaleDraft,
} from '../../../editor';
import { contentKeys, useCurrentBranch } from '../../../editor/content-queries';
import { FormScopeContext } from '../../../editor/context';
import type { UploadList } from '../../../editor/uploads/upload-list';
import { useUploadList } from '../../../editor/uploads/use-uploads';
import { isEdited, toFormId, useFormStore } from '../../../form/form-store';
import { t } from '../../../index';
import { required } from '../../../plugins/fields';
import coreValidatorsPlugin from '../../../plugins/validators/core-validators.plugin';
import { LabelledFields } from '../../../test/labelled-fields';
import { MediaBrowser } from '../../media-manager/media-browser';
import { simulateReload } from '../../../test/simulate-reload';
import arrayFieldPlugin from '../array/array-field.plugin';
import objectFieldPlugin from '../object/object-field.plugin';
import stringFieldPlugin from '../string/string-field.plugin';
import imageFieldPlugin from './image-field.plugin';

const DOCUMENT_PATH = 'content/posts/hello.mdx';
const OTHER_PATH = 'content/posts/other.mdx';
const HERO = 'posts/hero.jpg';
const CONNECTION = "Couldn't upload. Check your connection, then retry.";

// The whole text of a field error about a file: the file's name, then the reason.
const fileError = (name: string, reason: string) => {
  const words = `${name}: ${reason}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${words}$`);
};

const BRANCHES: BranchInfo[] = [
  { name: 'main', protected: true },
  { name: 'feature/news' },
];

interface SentUpload {
  file: File;
  folder: string | undefined;
  signal: AbortSignal | undefined;
  progress: (fraction: number) => void;
  land: (path?: string) => Promise<void>;
  fail: (cause: unknown) => Promise<void>;
}

interface World {
  sent: SentUpload[];
  /** What Media holds. */
  files: string[];
  deleted: string[];
  features: MediaFeatures | undefined;
  switchBranch: (name: string) => void;
  list: UploadList | undefined;
  /** The documents on disk by path, read and written through the content slice. */
  stored: Record<string, TinaDocument>;
  /** A save waits for this before it writes. */
  saveGate: Promise<void> | undefined;
}

let world: World;

const mediaPlugin = () =>
  definePlugin({
    name: 'test:media',
    provides: ['media'],
    client: async () => ({
      default: {
        slice: () =>
          ({
            upload: (
              file: File,
              folder?: string,
              options?: MediaUploadOptions
            ) =>
              new Promise<string>((resolve, reject) => {
                world.sent.push({
                  file,
                  folder,
                  signal: options?.signal,
                  progress: (fraction) =>
                    act(() => options?.onProgress?.(fraction)),
                  land: (path = file.name) =>
                    act(async () => {
                      world.files.push(path);
                      resolve(path);
                    }),
                  fail: (cause) => act(async () => reject(cause)),
                });
              }),
            list: async () => ({
              items: world.files.map((path) => ({
                path,
                kind: 'file' as const,
              })),
            }),
            delete: async (path: string) => {
              world.deleted.push(path);
            },
            resolveUrl: (path: string) => `/uploads/${path}`,
            features: world.features,
          }) satisfies MediaProvider,
      },
    }),
  });

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: (_set, get) => {
        world.switchBranch = (name) => branchSliceOf(get())?.switchTo(name);
        return {
          branches: {
            list: async () => BRANCHES,
            defaultBranch: async () => 'main',
          },
          list: async () => [],
          get: async (_collection: string, path: string) =>
            path in world.stored
              ? { path, document: world.stored[path] }
              : null,
          update: async (
            _collection: string,
            path: string,
            value: TinaDocument
          ) => {
            await world.saveGate;
            world.stored[path] = value;
            return { path, document: value };
          },
        };
      },
    },
  }),
});

const flat: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title' }),
    t.image({ name: 'hero', label: 'Hero' }),
    t.image({ name: 'cover', label: 'Cover' }),
  ],
};

function Probes() {
  world.list = useUploadList();
  const status = useFormStatus(useFormId());
  const discard = useDiscardEdits();
  const stale = useStaleDraft();
  return (
    <>
      <span data-testid='status'>{status}</span>
      <button type='button' onClick={discard}>
        discard
      </button>
      {stale ? (
        <button type='button' onClick={stale.resume}>
          resume
        </button>
      ) : null}
    </>
  );
}

// The admin replaces the document's form when the branch changes. `keepForm` leaves it mounted.
function Document({
  schema,
  document,
  keepForm,
}: {
  schema: CollectionSchema;
  document: TinaDocument | undefined;
  keepForm: boolean;
}) {
  const [open, setOpen] = useState(true);
  const branch = useCurrentBranch() ?? '';
  return (
    <>
      <button type='button' onClick={() => setOpen((was) => !was)}>
        {open ? 'close document' : 'open document'}
      </button>
      {open ? (
        <FormProvider
          key={keepForm ? 'kept' : branch}
          collection={schema}
          path={DOCUMENT_PATH}
          document={document}
        >
          <LabelledFields />
          <Probes />
        </FormProvider>
      ) : null}
    </>
  );
}

const host = (
  schema: CollectionSchema,
  document?: TinaDocument,
  beside?: ReactNode,
  keepForm = false
): ReactNode => (
  <TinaProvider
    config={asResolvedConfig({
      plugins: [
        imageFieldPlugin,
        arrayFieldPlugin,
        objectFieldPlugin,
        stringFieldPlugin,
        contentPlugin,
        mediaPlugin(),
        coreValidatorsPlugin,
      ],
      schema: { collections: [schema] },
    })}
    queryClient={
      new QueryClient({ defaultOptions: { queries: { retry: false } } })
    }
  >
    <Document schema={schema} document={document} keepForm={keepForm} />
    {beside}
  </TinaProvider>
);

const renderField = (
  document?: TinaDocument,
  schema: CollectionSchema = flat
) => render(host(schema, document));

const fieldGroup = (name: string) =>
  screen.findByRole('group', { name: new RegExp(`^${name}\\b`) });

const imageFile = (name = 'new.png') =>
  new File(['image'], name, { type: 'image/png' });

const drop = (group: HTMLElement, file: File = imageFile()) =>
  fireEvent.drop(group, {
    dataTransfer: { files: [file], types: ['Files'] },
  });

const dragOver = (group: HTMLElement) =>
  fireEvent.dragOver(group, { dataTransfer: { files: [], types: ['Files'] } });

// The field's messages sit beside its group, inside the field's row.
const rowOf = (group: HTMLElement) => {
  const row = group.closest<HTMLElement>('[data-slot="field-wrapper"]');
  if (!row) throw new Error('The group is not inside a field row');
  return within(row);
};

const valueOf = (name: string) =>
  useFormStore.getState().forms[toFormId(DOCUMENT_PATH)]?.values[
    toFieldAddress(name)
  ];

const status = () => screen.getByTestId('status').textContent;

const sent = (index: number): SentUpload => {
  const upload = world.sent[index];
  if (!upload) throw new Error(`No upload number ${index + 1} was sent`);
  return upload;
};

const entries = () => world.list?.store.getState().entries ?? [];

const startOnFeatureBranch = () =>
  localStorage.setItem(
    'tina-store',
    JSON.stringify({
      state: { branch: { current: 'feature/news' } },
      version: 0,
    })
  );

// The dialog takes its first focus after it opens, on a later frame. A loaded
// runner needs more than `vi.waitFor`'s default second, as `findBy*` gets in setup.
const DIALOG_FOCUS_WAIT = { timeout: 5000 };

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  startOnFeatureBranch();
  world = {
    sent: [],
    files: [HERO],
    deleted: [],
    features: undefined,
    switchBranch: () => {},
    list: undefined,
    stored: {},
    saveGate: undefined,
  };
  consoleError = vi.spyOn(console, 'error');
});

afterEach(() => {
  const logged = consoleError.mock.calls.slice();
  consoleError.mockRestore();
  expect(logged).toEqual([]);
});

describe('a file dropped on an empty image field', () => {
  it('shows "Uploading N%" on the picture, lists the upload, and fills the field when the file lands', async () => {
    renderField();
    const group = await fieldGroup('Hero');
    const file = imageFile();
    drop(group, file);

    expect(within(group).getByText('Uploading')).toBeVisible();
    expect(sent(0).file).toBe(file);
    expect(sent(0).folder).toBe('');
    expect(entries().map((entry) => entry.name)).toEqual(['new.png']);
    expect(document.querySelector('[data-upload-status]')).toHaveTextContent(
      'Uploading new.png to Media.'
    );

    sent(0).progress(0.4);
    expect(within(group).getByText('Uploading 40%')).toBeVisible();
    sent(0).progress(1);
    expect(within(group).getByText('Uploading 99%')).toBeVisible();
    expect(valueOf('hero')).toBeNull();

    await sent(0).land('new.png');
    expect(
      await within(group).findByRole('button', { name: 'Replace new.png' })
    ).toBeVisible();
    expect(valueOf('hero')).toBe('new.png');
    expect(within(group).getByAltText('new.png')).toHaveAttribute(
      'src',
      '/uploads/new.png'
    );
    expect(within(group).queryByText(/^Uploading/)).toBeNull();
    expect(
      document.querySelector('[data-upload-status]')
    ).not.toHaveTextContent('%');
  });

  it('judges a known extension by its own type: a PDF that reports an image type is refused, and an SVG with no type is taken', async () => {
    renderField();
    const group = await fieldGroup('Hero');
    drop(group, new File(['%PDF'], 'notes.pdf', { type: 'image/png' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      fileError('notes.pdf', 'Only images can go in this field.')
    );
    expect(world.sent).toEqual([]);

    drop(group, new File(['<svg/>'], 'logo.svg'));
    await vi.waitFor(() => expect(world.sent).toHaveLength(1));
    expect(sent(0).file.name).toBe('logo.svg');
    await sent(0).land('logo.svg');
    expect(valueOf('hero')).toBe('logo.svg');
  });

  it('refuses a file that is not an image with an error, no Retry and no request', async () => {
    renderField();
    const group = await fieldGroup('Hero');
    drop(group, new File(['%PDF'], 'notes.pdf', { type: 'application/pdf' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      fileError('notes.pdf', 'Only images can go in this field.')
    );
    expect(within(group).queryByRole('button', { name: /^Retry/ })).toBeNull();
    expect(world.sent).toEqual([]);
    expect(valueOf('hero')).toBeNull();
    expect(
      within(group).getByRole('button', { name: 'Choose from Media' })
    ).toBeVisible();
  });

  it('refuses a file over the size limit with the limit in words and no Retry', async () => {
    world.features = { maxSize: 1024 * 1024 };
    renderField();
    const group = await fieldGroup('Hero');
    const large = imageFile('large.png');
    Object.defineProperty(large, 'size', { value: 2 * 1024 * 1024 });
    drop(group, large);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      fileError('large.png', 'Too large. The limit is 1 MB.')
    );
    expect(within(group).queryByRole('button', { name: /^Retry/ })).toBeNull();
    expect(world.sent).toEqual([]);
    expect(valueOf('hero')).toBeNull();
  });

  it('ignores a second file while one uploads, and uses only the first file of a drop', async () => {
    renderField();
    const group = await fieldGroup('Hero');
    fireEvent.drop(group, {
      dataTransfer: {
        files: [imageFile('one.png'), imageFile('extra.png')],
        types: ['Files'],
      },
    });
    drop(group, imageFile('two.png'));
    expect(world.sent.map((upload) => upload.file.name)).toEqual(['one.png']);
    await sent(0).land('one.png');
    expect(valueOf('hero')).toBe('one.png');
  });

  it('keeps the progress and the failure of two fields apart', async () => {
    renderField();
    const hero = await fieldGroup('Hero');
    const cover = await fieldGroup('Cover');
    drop(hero, imageFile('hero-new.png'));
    drop(cover, imageFile('cover-new.png'));
    sent(0).progress(0.2);
    sent(1).progress(0.7);
    expect(within(hero).getByText('Uploading 20%')).toBeVisible();
    expect(within(cover).getByText('Uploading 70%')).toBeVisible();

    await sent(1).fail(new Error('offline'));
    expect(within(hero).getByText('Uploading 20%')).toBeVisible();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent(CONNECTION);
    expect(
      within(cover).getByRole('button', {
        name: 'Retry uploading cover-new.png',
      })
    ).toBeVisible();
    expect(within(hero).queryByRole('button', { name: /^Retry/ })).toBeNull();

    await sent(0).land('hero-new.png');
    expect(valueOf('hero')).toBe('hero-new.png');
    expect(valueOf('cover')).toBeNull();
  });

  it('starts before the files that wait for their turn', async () => {
    render(
      host(
        flat,
        undefined,
        <MediaBrowser mode='pick' accept='image' onSelect={() => {}} />
      )
    );
    const group = await fieldGroup('Hero');
    const picked = ['a.png', 'b.png', 'c.png', 'd.png', 'e.png'].map((name) =>
      imageFile(name)
    );
    fireEvent.change(await screen.findByLabelText('Choose files to upload'), {
      target: { files: picked },
    });
    expect(world.sent.map((upload) => upload.file.name)).toEqual([
      'a.png',
      'b.png',
      'c.png',
    ]);

    drop(group, imageFile('hero-new.png'));
    expect(world.sent).toHaveLength(3);
    expect(within(group).getByText('Uploading')).toBeVisible();

    await sent(0).land('a.png');
    expect(world.sent.map((upload) => upload.file.name)).toEqual([
      'a.png',
      'b.png',
      'c.png',
      'hero-new.png',
    ]);
    await sent(3).land('hero-new.png');
    expect(valueOf('hero')).toBe('hero-new.png');
    expect(sent(4).file.name).toBe('d.png');
  });

  it('draws one polite status for two image fields with no TinaAdmin above them', async () => {
    renderField();
    await fieldGroup('Hero');
    await fieldGroup('Cover');
    expect(document.querySelectorAll('[data-upload-status]')).toHaveLength(1);
  });
});

describe('a file that lands after the editor moved on', () => {
  const levelled: CollectionSchema = {
    name: 'post',
    label: 'Posts',
    format: 'mdx',
    fields: [
      t.string({ name: 'title', label: 'Title' }),
      t.object({
        name: 'seo',
        label: 'SEO',
        display: 'drillIn',
        fields: [t.image({ name: 'image', label: 'Share image' })],
      }),
    ],
  };

  const openSeo = async () => {
    await userEvent.click(await screen.findByRole('button', { name: /SEO/ }));
    return fieldGroup('Share image');
  };

  it('fills the field while focus is in another field, and the document reads as edited', async () => {
    renderField({ title: 'Hello' });
    const group = await fieldGroup('Hero');
    drop(group);
    await userEvent.click(screen.getByRole('textbox', { name: /^Title/ }));
    expect(status()).toBe('pristine');
    await sent(0).land('new.png');
    expect(valueOf('hero')).toBe('new.png');
    expect(status()).toBe('dirty');
    expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveFocus();
  });

  it('fills a field whose form level was closed, and shows it when the level opens again', async () => {
    renderField({ title: 'Hello', seo: {} }, levelled);
    drop(await openSeo());
    sent(0).progress(0.4);
    await userEvent.click(
      screen.getByRole('button', { name: 'Back to fields' })
    );
    expect(screen.queryByRole('group', { name: /^Share image/ })).toBeNull();

    const reopened = await openSeo();
    expect(within(reopened).getByText('Uploading 40%')).toBeVisible();
    await userEvent.click(
      screen.getByRole('button', { name: 'Back to fields' })
    );

    await sent(0).land('new.png');
    expect(valueOf('seo')).toEqual({ image: 'new.png' });
    expect(status()).toBe('dirty');
    expect(
      within(await openSeo()).getByRole('button', { name: 'Replace new.png' })
    ).toBeVisible();
  });

  it('keeps the taken-name note when the form level closes and opens again', async () => {
    world.files.push('new.png');
    renderField({ title: 'Hello', seo: {} }, levelled);
    drop(await openSeo());
    await sent(0).fail(new MediaError('name-taken'));
    expect(sent(1).file.name).toBe('new-1.png');
    await sent(1).land('new-1.png');
    const note = 'new.png was taken, saved as new-1.png';
    expect(
      within(await fieldGroup('Share image')).getByText(note)
    ).toBeVisible();
    expect(valueOf('seo')).toEqual({ image: 'new-1.png' });

    await userEvent.click(
      screen.getByRole('button', { name: 'Back to fields' })
    );
    expect(within(await openSeo()).getByText(note)).toBeVisible();
  });

  it('writes nothing when the document closed before the file landed', async () => {
    renderField({ title: 'Hello' });
    drop(await fieldGroup('Hero'));
    await userEvent.click(
      screen.getByRole('button', { name: 'close document' })
    );
    await sent(0).land('new.png');
    expect(world.files).toContain('new.png');
    expect(entries().map((entry) => entry.status)).toEqual(['done']);

    await userEvent.click(
      screen.getByRole('button', { name: 'open document' })
    );
    const group = await fieldGroup('Hero');
    expect(
      within(group).getByRole('button', { name: 'Choose from Media' })
    ).toBeVisible();
    expect(valueOf('hero')).toBeNull();
    expect(status()).toBe('pristine');
  });

  it('writes nothing when the editor discarded before the file landed', async () => {
    renderField({ title: 'Hello' });
    const group = await fieldGroup('Hero');
    await userEvent.type(screen.getByRole('textbox', { name: /^Title/ }), '!');
    expect(status()).toBe('dirty');
    drop(group);
    await userEvent.click(screen.getByRole('button', { name: 'discard' }));
    expect(status()).not.toBe('dirty');

    await sent(0).land('new.png');
    expect(world.files).toContain('new.png');
    expect(valueOf('hero')).toBeNull();
    expect(status()).not.toBe('dirty');
    expect(
      within(await fieldGroup('Hero')).getByRole('button', {
        name: 'Choose from Media',
      })
    ).toBeVisible();
  });

  it('writes nothing when the editor resumed stored edits before the file landed', async () => {
    const first = renderField({ title: 'Hello' });
    await userEvent.type(
      await screen.findByRole('textbox', { name: /^Title/ }),
      '!'
    );
    first.unmount();
    act(simulateReload);

    renderField({ title: 'Hello' });
    drop(await fieldGroup('Hero'));
    await userEvent.click(
      await screen.findByRole('button', { name: 'resume' })
    );
    expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveValue(
      'Hello!'
    );

    await sent(0).land('new.png');
    expect(world.files).toContain('new.png');
    expect(valueOf('hero')).toBeNull();
    expect(valueOf('title')).toBe('Hello!');
    expect(
      within(await fieldGroup('Hero')).getByRole('button', {
        name: 'Choose from Media',
      })
    ).toBeVisible();
  });
});

describe('a Save while a file uploads to an image field', () => {
  function SaveProbe() {
    const save = useFormSave();
    const [saves, setSaves] = useState(0);
    return (
      <>
        <button
          type='button'
          onClick={() => void save().then(() => setSaves((n) => n + 1))}
        >
          save
        </button>
        <span data-testid='saves'>{saves}</span>
      </>
    );
  }

  function ScopedEditor() {
    if (!use(FormScopeContext)) return null;
    return (
      <>
        <LabelledFields />
        <Probes />
        <SaveProbe />
      </>
    );
  }

  // The admin keeps one unkeyed DocumentScope and changes its path.
  function OpenDocument() {
    const [path, setPath] = useState(DOCUMENT_PATH);
    return (
      <>
        <button type='button' onClick={() => setPath(DOCUMENT_PATH)}>
          open hello
        </button>
        <button type='button' onClick={() => setPath(OTHER_PATH)}>
          open other
        </button>
        <DocumentScope collection={flat} path={path}>
          <ScopedEditor />
        </DocumentScope>
      </>
    );
  }

  const renderSaved = (queryClient = makeQueryClient()) => {
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [
            imageFieldPlugin,
            stringFieldPlugin,
            contentPlugin,
            mediaPlugin(),
            coreValidatorsPlugin,
          ],
          schema: { collections: [flat] },
        })}
        queryClient={queryClient}
      >
        <OpenDocument />
      </TinaProvider>
    );
    return queryClient;
  };

  const makeQueryClient = () =>
    new QueryClient({ defaultOptions: { queries: { retry: false } } });

  const saveNow = async () => {
    const before = Number(screen.getByTestId('saves').textContent);
    await userEvent.click(screen.getByRole('button', { name: 'save' }));
    await vi.waitFor(() =>
      expect(Number(screen.getByTestId('saves').textContent)).toBe(before + 1)
    );
  };

  const editedFields = () => {
    const scope = useFormStore.getState().forms[toFormId(DOCUMENT_PATH)];
    if (!isEdited(scope)) return [];
    return Object.entries(scope.values)
      .filter(([name, value]) => value !== scope.baseline[name])
      .map(([name]) => name);
  };

  // A Save that writes a change brings the saved document back into the form.
  const editTitle = async () =>
    userEvent.type(await screen.findByRole('textbox', { name: /^Title/ }), '!');

  beforeEach(() => {
    world.stored = {
      [DOCUMENT_PATH]: { title: 'Hello' },
      [OTHER_PATH]: { title: 'Other', hero: HERO },
    };
  });

  it('fills the field when the file lands after the Save, and the next Save writes the path', async () => {
    renderSaved();
    await editTitle();
    drop(await fieldGroup('Hero'));
    await saveNow();
    expect(world.stored[DOCUMENT_PATH]).toMatchObject({ title: 'Hello!' });
    expect(world.stored[DOCUMENT_PATH]).not.toHaveProperty('hero', 'new.png');
    expect(status()).not.toBe('dirty');

    await sent(0).land('new.png');
    expect(valueOf('hero')).toBe('new.png');
    expect(status()).toBe('dirty');
    expect(editedFields()).toEqual(['hero']);
    expect(
      await within(await fieldGroup('Hero')).findByRole('button', {
        name: 'Replace new.png',
      })
    ).toBeVisible();

    await saveNow();
    expect(world.stored[DOCUMENT_PATH]).toMatchObject({
      title: 'Hello!',
      hero: 'new.png',
    });
    expect(status()).not.toBe('dirty');
  });

  it('keeps the path when the file lands while the Save is in flight', async () => {
    let release = () => {};
    world.saveGate = new Promise<void>((resolve) => {
      release = resolve;
    });
    renderSaved();
    await editTitle();
    drop(await fieldGroup('Hero'));
    await userEvent.click(screen.getByRole('button', { name: 'save' }));
    await sent(0).land('new.png');
    await act(async () => release());
    await vi.waitFor(() =>
      expect(screen.getByTestId('saves')).toHaveTextContent('1')
    );

    expect(valueOf('hero')).toBe('new.png');
    expect(status()).toBe('dirty');
    expect(editedFields()).toEqual(['hero']);
  });

  it('keeps the taken-name note when the file lands under another name after the Save', async () => {
    world.files.push('new.png');
    renderSaved();
    await editTitle();
    drop(await fieldGroup('Hero'));
    await saveNow();
    await sent(0).fail(new MediaError('name-taken'));
    await sent(1).land('new-1.png');
    expect(valueOf('hero')).toBe('new-1.png');
    expect(
      within(await fieldGroup('Hero')).getByText(
        'new.png was taken, saved as new-1.png'
      )
    ).toBeVisible();
  });

  it('shows the failure with Retry when the upload fails after the Save, and Retry fills the field', async () => {
    renderSaved();
    await editTitle();
    drop(await fieldGroup('Hero'));
    await saveNow();
    await sent(0).fail(new Error('offline'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      fileError('new.png', CONNECTION)
    );
    await userEvent.click(
      within(await fieldGroup('Hero')).getByRole('button', {
        name: 'Retry uploading new.png',
      })
    );
    await sent(1).land('new.png');
    expect(valueOf('hero')).toBe('new.png');
    expect(status()).toBe('dirty');
  });

  it('writes nothing when another writer changed the document before the file landed', async () => {
    const queryClient = renderSaved();
    drop(await fieldGroup('Hero'));
    world.stored[DOCUMENT_PATH] = { title: 'Changed on disk' };
    await act(() =>
      queryClient.invalidateQueries({ queryKey: contentKeys.all() })
    );
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveValue(
        'Changed on disk'
      )
    );

    await sent(0).land('new.png');
    expect(world.files).toContain('new.png');
    expect(valueOf('hero')).toBeNull();
    expect(status()).not.toBe('dirty');
  });

  it('writes nothing when another writer changed the document after the Save and before the file landed', async () => {
    const queryClient = renderSaved();
    await editTitle();
    drop(await fieldGroup('Hero'));
    await saveNow();
    world.stored[DOCUMENT_PATH] = { title: 'Changed on disk' };
    await act(() =>
      queryClient.invalidateQueries({ queryKey: contentKeys.all() })
    );
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveValue(
        'Changed on disk'
      )
    );

    await sent(0).land('new.png');
    expect(world.files).toContain('new.png');
    expect(valueOf('hero')).toBeNull();
    expect(status()).not.toBe('dirty');
  });

  it('writes nothing into another saved document opened before the file landed', async () => {
    renderSaved();
    await userEvent.click(
      await screen.findByRole('button', { name: 'open other' })
    );
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveValue(
        'Other'
      )
    );
    await editTitle();
    await saveNow();
    await userEvent.click(screen.getByRole('button', { name: 'open hello' }));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveValue(
        'Hello'
      )
    );
    drop(await fieldGroup('Hero'));
    await userEvent.click(screen.getByRole('button', { name: 'open other' }));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveValue(
        'Other!'
      )
    );

    await sent(0).land('new.png');
    expect(world.files).toContain('new.png');
    expect(
      useFormStore.getState().forms[toFormId(OTHER_PATH)]?.values[
        toFieldAddress('hero')
      ]
    ).toBe(HERO);
    expect(status()).not.toBe('dirty');
  });
});

describe('a failed upload on an image field', () => {
  const pick = async (group: HTMLElement, button: string) => {
    await userEvent.click(within(group).getByRole('button', { name: button }));
    const dialog = await screen.findByRole('dialog', {
      name: 'Choose an image',
    });
    await userEvent.click(
      await within(dialog).findByRole('button', { name: 'hero.jpg' })
    );
    await userEvent.click(
      await within(dialog).findByRole('button', { name: 'Insert' })
    );
  };

  const failOnce = async () => {
    renderField();
    const group = await fieldGroup('Hero');
    drop(group);
    await sent(0).fail(new Error('offline'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      fileError('new.png', CONNECTION)
    );
    return group;
  };

  it('leaves the field empty with the reason and Retry beside Choose from Media, and Retry fills it', async () => {
    const group = await failOnce();
    expect(valueOf('hero')).toBeNull();
    expect(
      within(group).getByRole('button', { name: 'Choose from Media' })
    ).toBeVisible();
    await userEvent.click(
      within(group).getByRole('button', { name: 'Retry uploading new.png' })
    );
    expect(screen.queryByRole('alert')).toBeNull();
    expect(within(group).getByText('Uploading')).toBeVisible();
    expect(sent(1).file).toBe(sent(0).file);

    await sent(1).land('new.png');
    expect(valueOf('hero')).toBe('new.png');
    expect(
      await within(group).findByRole('button', { name: 'Replace new.png' })
    ).toHaveFocus();
  });

  it('starts one upload on a double click on Retry, and fills the field', async () => {
    const group = await failOnce();
    await userEvent.dblClick(
      within(group).getByRole('button', { name: 'Retry uploading new.png' })
    );
    expect(world.sent).toHaveLength(2);
    expect(sent(1).signal?.aborted).toBe(false);
    expect(within(group).getByText('Uploading')).toBeVisible();
    await sent(1).land('new.png');
    expect(valueOf('hero')).toBe('new.png');
    expect(world.sent).toHaveLength(2);
  });

  it('shows the reason and Retry again when Retry fails', async () => {
    const group = await failOnce();
    await userEvent.click(
      within(group).getByRole('button', { name: 'Retry uploading new.png' })
    );
    await sent(1).fail(new MediaError('backend-failure'));
    expect(await screen.findByRole('alert')).toBeVisible();
    expect(
      within(group).getByRole('button', { name: 'Retry uploading new.png' })
    ).toBeVisible();
    expect(valueOf('hero')).toBeNull();
  });

  it('offers no Retry for a failure that cannot work again', async () => {
    renderField();
    const group = await fieldGroup('Hero');
    drop(group);
    await sent(0).fail(new MediaError('too-large'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      fileError('new.png', 'That file is too large to upload.')
    );
    expect(within(group).queryByRole('button', { name: /^Retry/ })).toBeNull();
  });

  it('names the file of an unconfirmed upload, with no Retry', async () => {
    renderField();
    const group = await fieldGroup('Hero');
    drop(group);
    sent(0).progress(1);
    await sent(0).fail(new Error('no answer'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      fileError(
        'new.png',
        "Couldn't confirm the upload. Check Media before you upload it again."
      )
    );
    expect(within(group).queryByRole('button', { name: /^Retry/ })).toBeNull();
    expect(valueOf('hero')).toBeNull();
    expect(
      within(group).getByRole('button', { name: 'Choose from Media' })
    ).toBeVisible();
  });

  it('clears the failure when the editor chooses from Media', async () => {
    const group = await failOnce();
    await pick(group, 'Choose from Media');
    expect(valueOf('hero')).toBe(HERO);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(within(group).queryByRole('button', { name: /^Retry/ })).toBeNull();
    expect(entries()).toEqual([]);
  });

  it('clears the failure when the editor drops another file', async () => {
    const group = await failOnce();
    drop(group, imageFile('other.png'));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(entries().map((entry) => entry.name)).toEqual(['other.png']);
    await sent(1).land('other.png');
    expect(valueOf('hero')).toBe('other.png');
  });

  const fillWithTakenName = async () => {
    world.files.push('new.png');
    renderField();
    const group = await fieldGroup('Hero');
    drop(group);
    await sent(0).fail(new MediaError('name-taken'));
    await sent(1).land('new-1.png');
    const note = 'new.png was taken, saved as new-1.png';
    expect(within(group).getByText(note)).toBeVisible();
    return { group, note };
  };

  const confirmReplace = async () =>
    userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Replace',
      })
    );

  it('drops the taken-name note when Replace is confirmed, names the file that failed, and Retry replaces the image', async () => {
    const { group, note } = await fillWithTakenName();

    drop(group, imageFile('second.png'));
    await screen.findByRole('alertdialog');
    expect(within(group).getByText(note)).toBeVisible();
    await confirmReplace();
    expect(within(group).queryByText(note)).toBeNull();
    expect(within(group).getByText('Uploading')).toBeVisible();

    await sent(2).fail(new Error('offline'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      fileError('second.png', CONNECTION)
    );
    expect(valueOf('hero')).toBe('new-1.png');
    expect(within(group).getByAltText('new-1.png')).toBeInTheDocument();
    expect(within(group).queryByText(note)).toBeNull();

    await userEvent.click(
      within(group).getByRole('button', { name: 'Retry uploading second.png' })
    );
    await sent(3).land('second.png');
    expect(valueOf('hero')).toBe('second.png');
    expect(within(group).queryByText(note)).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('keeps the taken-name note when the replace confirm is cancelled', async () => {
    const { group, note } = await fillWithTakenName();
    drop(group, imageFile('second.png'));
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Cancel',
      })
    );
    expect(within(group).getByText(note)).toBeVisible();
    expect(world.sent).toHaveLength(2);
  });

  it('does not bring the taken-name note back when the replacement is cancelled or refused', async () => {
    const { group, note } = await fillWithTakenName();
    drop(group, imageFile('second.png'));
    await confirmReplace();
    expect(within(group).queryByText(note)).toBeNull();
    const [running] = entries().filter((entry) => entry.name === 'second.png');
    act(() => world.list?.cancel(running?.id ?? ''));
    await sent(2).fail(new DOMException('Aborted', 'AbortError'));
    expect(entries().map((entry) => entry.status)).toContain('cancelled');
    expect(valueOf('hero')).toBe('new-1.png');
    expect(within(group).queryByText(note)).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('drops the taken-name note when a file that is not an image is confirmed, and names that file', async () => {
    const { group, note } = await fillWithTakenName();
    drop(group, new File(['%PDF'], 'notes.pdf', { type: 'application/pdf' }));
    await confirmReplace();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      fileError('notes.pdf', 'Only images can go in this field.')
    );
    expect(within(group).queryByText(note)).toBeNull();
    expect(valueOf('hero')).toBe('new-1.png');
    expect(world.sent).toHaveLength(2);
  });

  it('drops the taken-name note once the field takes another image or is cleared', async () => {
    world.files.push('new.png');
    renderField();
    const group = await fieldGroup('Hero');
    drop(group);
    await sent(0).fail(new MediaError('name-taken'));
    await sent(1).land('new-1.png');
    const note = 'new.png was taken, saved as new-1.png';
    expect(within(group).getByText(note)).toBeVisible();

    await pick(group, 'Replace new-1.png');
    expect(valueOf('hero')).toBe(HERO);
    expect(within(group).queryByText(note)).toBeNull();

    drop(group, imageFile('second.png'));
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Replace',
      })
    );
    await sent(2).fail(new MediaError('name-taken'));
    await sent(3).land('second-1.png');
    const second = 'second.png was taken, saved as second-1.png';
    expect(within(group).getByText(second)).toBeVisible();
    await userEvent.click(
      within(group).getByRole('button', { name: 'Remove second-1.png' })
    );
    expect(valueOf('hero')).toBeNull();
    expect(within(group).queryByText(second)).toBeNull();
    expect(world.list?.store.getState().notes).toEqual([]);
  });
});

describe('a file dropped on a field that has an image', () => {
  const dropOnHero = async () => {
    renderField({ hero: HERO });
    const group = await fieldGroup('Hero');
    dragOver(group);
    expect(within(group).getByText('Drop to replace')).toBeVisible();
    drop(group);
    expect(within(group).queryByText('Drop to replace')).toBeNull();
    const confirm = await screen.findByRole('alertdialog', {
      name: 'Replace hero.jpg?',
    });
    return { group, confirm };
  };

  it('asks first, and Cancel keeps the image, sends nothing and returns focus to the field', async () => {
    const { group, confirm } = await dropOnHero();
    expect(world.sent).toEqual([]);
    await userEvent.click(
      within(confirm).getByRole('button', { name: 'Cancel' })
    );
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(valueOf('hero')).toBe(HERO);
    expect(world.sent).toEqual([]);
    expect(
      await within(group).findByRole('button', { name: 'Replace hero.jpg' })
    ).toHaveFocus();
  });

  it('keeps the old image under the veil, then takes the new path, and never deletes the old file', async () => {
    const { group, confirm } = await dropOnHero();
    await userEvent.click(
      within(confirm).getByRole('button', { name: 'Replace' })
    );
    sent(0).progress(0.5);
    expect(within(group).getByText('Uploading 50%')).toBeVisible();
    expect(within(group).getByAltText('hero.jpg')).toBeInTheDocument();
    expect(valueOf('hero')).toBe(HERO);

    await sent(0).land('new.png');
    expect(valueOf('hero')).toBe('new.png');
    expect(
      await within(group).findByRole('button', { name: 'Replace new.png' })
    ).toHaveFocus();
    expect(world.files).toEqual([HERO, 'new.png']);
    expect(world.deleted).toEqual([]);
  });

  it('keeps the old image when the upload fails, and Retry then replaces it', async () => {
    const { group, confirm } = await dropOnHero();
    await userEvent.click(
      within(confirm).getByRole('button', { name: 'Replace' })
    );
    await sent(0).fail(new Error('offline'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      fileError('new.png', CONNECTION)
    );
    expect(valueOf('hero')).toBe(HERO);
    expect(within(group).getByAltText('hero.jpg')).toBeInTheDocument();

    await userEvent.click(
      within(group).getByRole('button', { name: 'Retry uploading new.png' })
    );
    await sent(1).land('new.png');
    expect(valueOf('hero')).toBe('new.png');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(world.deleted).toEqual([]);
  });

  it('clears a failed replacement when the image is removed', async () => {
    const { group, confirm } = await dropOnHero();
    await userEvent.click(
      within(confirm).getByRole('button', { name: 'Replace' })
    );
    await sent(0).fail(new Error('offline'));
    await screen.findByRole('alert');
    await userEvent.click(
      within(group).getByRole('button', { name: 'Remove hero.jpg' })
    );
    expect(screen.queryByRole('alert')).toBeNull();
    expect(within(group).queryByRole('button', { name: /^Retry/ })).toBeNull();
  });
});

describe('focus while a dialog of the image field is open', () => {
  const focusInside = (dialog: HTMLElement) =>
    vi.waitFor(
      () => expect(dialog.contains(document.activeElement)).toBe(true),
      DIALOG_FOCUS_WAIT
    );

  // A tooltip opens after a delay; the wait gives a stolen focus the time to show one.
  const expectFocusStays = async (dialog: HTMLElement) => {
    await focusInside(dialog);
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(screen.queryByRole('tooltip')).toBeNull();
  };

  it('keeps focus in the replace confirm after an earlier drop landed, and Replace starts the upload', async () => {
    renderField();
    const group = await fieldGroup('Hero');
    drop(group, imageFile('first.png'));
    await sent(0).land('first.png');
    const tileReplace = await within(group).findByRole('button', {
      name: 'Replace first.png',
    });

    drop(group, imageFile('second.png'));
    const confirm = await screen.findByRole('alertdialog', {
      name: 'Replace first.png?',
    });
    await expectFocusStays(confirm);
    expect(tileReplace).not.toHaveFocus();

    within(confirm).getByRole('button', { name: 'Replace' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(sent(1).file.name).toBe('second.png');
    await sent(1).land('second.png');
    expect(valueOf('hero')).toBe('second.png');
  });

  it('keeps focus in the replace confirm when the drop comes while another field has focus', async () => {
    renderField({ title: 'Hello', hero: HERO });
    const group = await fieldGroup('Hero');
    await userEvent.click(screen.getByRole('textbox', { name: /^Title/ }));
    drop(group);
    const confirm = await screen.findByRole('alertdialog', {
      name: 'Replace hero.jpg?',
    });
    await expectFocusStays(confirm);

    await userEvent.click(
      within(confirm).getByRole('button', { name: 'Cancel' })
    );
    expect(
      await within(group).findByRole('button', { name: 'Replace hero.jpg' })
    ).toHaveFocus();
  });

  it('keeps focus in the second replace confirm after a Retry landed', async () => {
    renderField({ hero: HERO });
    const group = await fieldGroup('Hero');
    drop(group, imageFile('first.png'));
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Replace',
      })
    );
    await sent(0).fail(new Error('offline'));
    await userEvent.click(
      await within(group).findByRole('button', {
        name: 'Retry uploading first.png',
      })
    );
    await sent(1).land('first.png');
    await within(group).findByRole('button', { name: 'Replace first.png' });

    drop(group, imageFile('second.png'));
    await expectFocusStays(
      await screen.findByRole('alertdialog', { name: 'Replace first.png?' })
    );
  });

  it('keeps focus in the picker when the button that opened it took no focus', async () => {
    renderField({ hero: HERO });
    const group = await fieldGroup('Hero');
    fireEvent.click(
      within(group).getByRole('button', { name: 'Replace hero.jpg' })
    );
    await expectFocusStays(
      await screen.findByRole('dialog', { name: 'Choose an image' })
    );
  });

  it('keeps focus in the replace confirm of an image field inside a list item', async () => {
    renderField(
      { authors: [{ name: 'Ivan', avatar: HERO }] },
      {
        ...flat,
        fields: [
          t.array({
            name: 'authors',
            label: 'Authors',
            fields: [
              t.string({ name: 'name', label: 'Name' }),
              t.image({ name: 'avatar', label: 'Avatar' }),
            ],
          }),
        ],
      }
    );
    await userEvent.click(
      await screen.findByRole('button', { name: /^Item 1:/ })
    );
    await userEvent.click(screen.getByRole('textbox', { name: /^Name/ }));
    drop(await screen.findByRole('group', { name: 'Avatar' }));
    await expectFocusStays(
      await screen.findByRole('alertdialog', { name: 'Replace hero.jpg?' })
    );
  });
});

describe('a drop the image field turns away', () => {
  it('says a save runs and sends nothing', async () => {
    renderField();
    const group = await fieldGroup('Hero');
    act(() =>
      useFormStore
        .getState()
        .setSavePhase(toFormId(DOCUMENT_PATH), { phase: 'saving' })
    );
    drop(group);
    expect(within(group).getByRole('status')).toHaveTextContent(
      'Saving. You can upload once it finishes.'
    );
    expect(world.sent).toEqual([]);
    expect(entries()).toEqual([]);
  });

  it('says the storage is read-only and sends nothing', async () => {
    world.features = { readOnly: true };
    renderField({ hero: HERO });
    const hero = await fieldGroup('Hero');
    const cover = await fieldGroup('Cover');
    expect(within(cover).queryByRole('status')).toBeNull();
    drop(cover);
    expect(within(cover).getByRole('status')).toHaveTextContent(
      "This storage is read-only. Files can't be uploaded here."
    );
    dragOver(hero);
    expect(within(hero).queryByText('Drop to replace')).toBeNull();
    drop(hero);
    expect(within(hero).getByRole('status')).toHaveTextContent(
      'This storage is read-only.'
    );
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(world.sent).toEqual([]);
  });

  it('says the editor has no permission after a refused upload, and sends nothing more', async () => {
    renderField();
    const hero = await fieldGroup('Hero');
    const cover = await fieldGroup('Cover');
    drop(hero);
    await sent(0).fail(new MediaError('unauthorized'));
    expect(await rowOf(hero).findByRole('alert')).toHaveTextContent(
      "You don't have permission to upload."
    );
    expect(within(hero).queryByRole('button', { name: /^Retry/ })).toBeNull();

    drop(cover);
    expect(within(cover).getByRole('status')).toHaveTextContent(
      "You don't have permission to upload."
    );
    expect(world.sent).toHaveLength(1);
  });

  it('takes no drop on a read-only field, and still shows its value', async () => {
    const locked: CollectionSchema = {
      ...flat,
      fields: [
        t.image({ name: 'hero', label: 'Hero', readOnly: true }),
        t.image({ name: 'cover', label: 'Cover', disabled: true }),
      ],
    };
    renderField({ hero: HERO, cover: HERO }, locked);
    for (const name of ['Hero', 'Cover']) {
      const group = await fieldGroup(name);
      dragOver(group);
      expect(within(group).queryByText('Drop to replace')).toBeNull();
      drop(group);
      expect(within(group).getByAltText('hero.jpg')).toBeInTheDocument();
      expect(within(group).queryByRole('button')).toBeNull();
    }
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(world.sent).toEqual([]);
  });

  it('keeps a required field invalid while a file is dragged over it', async () => {
    const needed: CollectionSchema = {
      ...flat,
      fields: [
        t.image({ name: 'hero', label: 'Hero', validators: [required()] }),
      ],
    };
    renderField({ hero: HERO }, needed);
    const group = await fieldGroup('Hero');
    drop(group, new File(['%PDF'], 'notes.pdf', { type: 'application/pdf' }));
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Replace',
      })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Only images can go in this field.'
    );
    dragOver(group);
    expect(within(group).getByText('Drop to replace')).toBeVisible();
    expect(screen.getByRole('alert')).toBeVisible();
  });
});

describe('an image field inside other fields', () => {
  const NESTED: {
    name: string;
    schema: CollectionSchema;
    document: TinaDocument;
    open: string[];
    root: string;
    filled: unknown;
  }[] = [
    {
      name: 'an object',
      schema: {
        ...flat,
        fields: [
          t.object({
            name: 'seo',
            label: 'SEO',
            fields: [t.image({ name: 'image', label: 'Picture' })],
          }),
        ],
      },
      document: { seo: {} },
      open: [],
      root: 'seo',
      filled: { image: 'new.png' },
    },
    {
      name: 'an object inside an object',
      schema: {
        ...flat,
        fields: [
          t.object({
            name: 'seo',
            label: 'SEO',
            fields: [
              t.object({
                name: 'social',
                label: 'Social',
                fields: [t.image({ name: 'image', label: 'Picture' })],
              }),
            ],
          }),
        ],
      },
      document: { seo: { social: {} } },
      open: [],
      root: 'seo',
      filled: { social: { image: 'new.png' } },
    },
  ];

  it.each(NESTED)(
    'uploads, fails, retries and fills inside $name',
    async ({ schema, document, root, filled }) => {
      renderField(document, schema);
      const group = await fieldGroup('Picture');
      drop(group);
      sent(0).progress(0.4);
      expect(within(group).getByText('Uploading 40%')).toBeVisible();
      await sent(0).fail(new Error('offline'));
      expect(await screen.findByRole('alert')).toHaveTextContent(CONNECTION);
      await userEvent.click(
        within(group).getByRole('button', { name: 'Retry uploading new.png' })
      );
      await sent(1).land('new.png');
      expect(valueOf(root)).toEqual(filled);
      expect(
        await within(group).findByRole('button', { name: 'Replace new.png' })
      ).toBeVisible();
      expect(status()).toBe('dirty');

      dragOver(group);
      expect(within(group).getByText('Drop to replace')).toBeVisible();
      drop(group, imageFile('next.png'));
      await userEvent.click(
        within(
          await screen.findByRole('alertdialog', { name: 'Replace new.png?' })
        ).getByRole('button', { name: 'Replace' })
      );
      await sent(2).fail(new MediaError('name-taken'));
      await sent(3).land('next-1.png');
      expect(
        within(group).getByText('next.png was taken, saved as next-1.png')
      ).toBeVisible();
    }
  );

  const authors: CollectionSchema = {
    name: 'post',
    label: 'Posts',
    format: 'mdx',
    fields: [
      t.array({
        name: 'authors',
        label: 'Authors',
        fields: [
          t.string({ name: 'name', label: 'Name' }),
          t.image({ name: 'avatar', label: 'Avatar' }),
        ],
      }),
    ],
  };

  const renderAuthors = async () => {
    renderField(
      { authors: [{ name: 'Ivan' }, { name: 'Josh' }, { name: 'Brook' }] },
      authors
    );
    for (const head of await screen.findAllByRole('button', {
      name: /^Item \d:/,
    })) {
      await userEvent.click(head);
    }
    return screen.findAllByRole('group', { name: 'Avatar' });
  };

  const chooseAction = async (item: number, action: string) => {
    await userEvent.click(
      screen.getByRole('button', { name: `Actions for Item ${item}` })
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: new RegExp(`^${action}`) })
    );
  };

  const avatars = () => {
    const list = valueOf('authors');
    if (!Array.isArray(list)) throw new Error('authors is not a list');
    return list.map((author: { name?: string; avatar?: string }) => [
      author.name,
      author.avatar ?? null,
    ]);
  };

  it('fills the item the file was dropped on, and shows an error on that item only', async () => {
    const [first, second, third] = await renderAuthors();
    drop(second, imageFile('josh.png'));
    drop(third, imageFile('brook.png'));
    sent(0).progress(0.3);
    expect(within(second).getByText('Uploading 30%')).toBeVisible();
    expect(within(first).queryByText(/^Uploading/)).toBeNull();

    await sent(1).fail(new Error('offline'));
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(rowOf(third).getByRole('alert')).toHaveTextContent(CONNECTION);

    await sent(0).land('josh.png');
    expect(avatars()).toEqual([
      ['Ivan', null],
      ['Josh', 'josh.png'],
      ['Brook', null],
    ]);
    expect(
      await within(second).findByRole('button', { name: 'Replace josh.png' })
    ).toBeVisible();
  });

  it('fills the item at its new place after an item is inserted above it', async () => {
    const [, second] = await renderAuthors();
    drop(second, imageFile('josh.png'));
    await chooseAction(1, 'Insert above');
    await sent(0).land('josh.png');
    expect(avatars().filter(([, avatar]) => avatar !== null)).toEqual([
      ['Josh', 'josh.png'],
    ]);
    expect(avatars()).toHaveLength(4);
    expect(avatars()[2]).toEqual(['Josh', 'josh.png']);
  });

  it('fills the item at its new place after it moves', async () => {
    const [, second] = await renderAuthors();
    drop(second, imageFile('josh.png'));
    await chooseAction(2, 'Move up');
    await sent(0).land('josh.png');
    expect(avatars()).toEqual([
      ['Josh', 'josh.png'],
      ['Ivan', null],
      ['Brook', null],
    ]);
  });

  it('fills nothing when the item was removed, and the file is in Media', async () => {
    const [, second] = await renderAuthors();
    drop(second, imageFile('josh.png'));
    await chooseAction(2, 'Remove');
    await sent(0).land('josh.png');
    expect(avatars()).toEqual([
      ['Ivan', null],
      ['Brook', null],
    ]);
    expect(world.files).toContain('josh.png');
    expect(entries().map((entry) => [entry.status, entry.field])).toEqual([
      ['done', null],
    ]);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows a failure on the item it belongs to after an item above it is removed', async () => {
    const [, , third] = await renderAuthors();
    drop(third, imageFile('brook.png'));
    await sent(0).fail(new Error('offline'));
    await chooseAction(1, 'Remove');
    const groups = await screen.findAllByRole('group', { name: 'Avatar' });
    expect(groups).toHaveLength(2);
    expect(rowOf(groups[0]).queryByRole('alert')).toBeNull();
    expect(rowOf(groups[1]).getByRole('alert')).toHaveTextContent(CONNECTION);
  });
});

describe('a file dropped on an image field on a protected branch', () => {
  it('says the branch is protected and sends nothing', async () => {
    renderField({ title: 'Hello' });
    await fieldGroup('Hero');
    await screen.findByText('pristine');
    act(() => world.switchBranch('main'));
    const group = await fieldGroup('Hero');
    await vi.waitFor(() => {
      drop(group);
      expect(within(group).getByRole('status')).toHaveTextContent(
        'main is protected. Switch to another branch to upload, delete or move files.'
      );
    });
    expect(world.sent).toEqual([]);
    expect(entries()).toEqual([]);
  });
});

describe('a field upload that is sending when the branch changes', () => {
  it('lands in Media on its own branch, writes no field, and the field stops showing it at the change', async () => {
    render(host(flat, { title: 'Hello' }, undefined, true));
    const group = await fieldGroup('Hero');
    await screen.findByText('pristine');
    const title = screen.getByRole('textbox', { name: /^Title/ });
    drop(group);
    sent(0).progress(0.4);
    expect(within(group).getByText('Uploading 40%')).toBeVisible();

    act(() => world.switchBranch('main'));
    expect(screen.getByRole('textbox', { name: /^Title/ })).toBe(title);
    expect(within(group).queryByText(/^Uploading/)).toBeNull();
    expect(
      within(group).getByRole('button', { name: 'Choose from Media' })
    ).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(entries().map((entry) => [entry.status, entry.field])).toEqual([
      ['uploading', null],
    ]);

    sent(0).progress(0.8);
    expect(within(group).queryByText(/^Uploading/)).toBeNull();
    await sent(0).land('new.png');
    expect(world.files).toContain('new.png');
    expect(
      entries().map((entry) => [entry.status, entry.branch, entry.path])
    ).toEqual([['done', 'feature/news', 'new.png']]);
    expect(valueOf('hero') ?? null).toBeNull();
    expect(
      within(group).queryByRole('button', { name: 'Replace new.png' })
    ).toBeNull();
    expect(status()).toBe('pristine');
    expect(screen.getByRole('textbox', { name: /^Title/ })).toBe(title);
    expect(
      within(group).getByRole('button', { name: 'Choose from Media' })
    ).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
