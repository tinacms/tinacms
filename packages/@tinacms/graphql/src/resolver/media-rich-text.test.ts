/**
 * End-to-end round-trip through `parseMDX` + `serializeMDX` for a rich-text
 * field that contains a JSX template with an `image`-typed src prop. Exercises
 * the same pipeline the GraphQL `rich-text` resolver uses, with the actual
 * resolver callbacks plugged in.
 *
 * Guards against regressing the absolute-URL guard in `media-utils.ts`: an
 * `image`-typed src that is already an external URL must survive both the
 * relative→cloud (read) and cloud→relative (save) transforms unchanged, while
 * a media-library path must still pick up the staging branch prefix on read
 * and round-trip back to its original form on save.
 */

import { parseMDX, serializeMDX } from '@tinacms/mdx';
import type { RichTextType, Schema } from '@tinacms/schema-tools';
import { describe, expect, it } from 'vitest';
import type { GraphQLConfig } from '../types';
import {
  resolveMediaCloudToRelative,
  resolveMediaRelativeToCloud,
} from './media-utils';

const bodyField: RichTextType = {
  type: 'rich-text',
  name: 'body',
  templates: [
    {
      name: 'imageEmbed',
      label: 'Image',
      fields: [
        { name: 'alt', label: 'Alt', type: 'string' },
        { name: 'src', label: 'Src', type: 'image', required: true },
      ],
    },
  ],
};

const schema: Schema<true> = {
  config: {
    branch: '',
    clientId: '',
    token: '',
    build: { outputFolder: '', publicFolder: '' },
    schema: { collections: [] },
    media: {
      tina: {
        publicFolder: 'public',
        mediaRoot: 'uploads',
      },
    },
  },
  collections: [],
};

// Feature branch with media rooted at `main`: staging prefix is active.
const config: GraphQLConfig = {
  useRelativeMedia: false,
  assetsHost: 'assets.tinajs.dev',
  clientId: 'a03ff3e2-1c3a-41af-8afd-ba0d58853191',
  branch: 'feat/example',
  mediaBranch: 'main',
};

const readCallback = (url: string) =>
  resolveMediaRelativeToCloud(url, config, schema) as string;
const writeCallback = (url: string) =>
  resolveMediaCloudToRelative(url, config, schema) as string;

type ImageEmbed = { src: unknown; alt: unknown };

const findImageEmbeds = (tree: ReturnType<typeof parseMDX>): ImageEmbed[] => {
  const embeds: ImageEmbed[] = [];
  for (const child of tree.children ?? []) {
    if (
      child &&
      typeof child === 'object' &&
      'name' in child &&
      child.name === 'imageEmbed' &&
      'props' in child
    ) {
      const props = (child as { props: Record<string, unknown> }).props;
      embeds.push({ src: props.src, alt: props.alt });
    }
  }
  return embeds;
};

describe('media-resolver round-trip through rich-text JSX templates', () => {
  it('round-trips an absolute external URL identically while still staging local media', () => {
    const relativeSrc = '/uploads/library/local.png';
    const externalSrc = 'https://cdn.example.com/external/image.png';

    const inputMdx = [
      `<imageEmbed alt="Local" src="${relativeSrc}" />`,
      '',
      `<imageEmbed alt="External" src="${externalSrc}" />`,
    ].join('\n');

    // READ: server resolves stored MDX into the editor tree.
    const editorTree = parseMDX(inputMdx, bodyField, readCallback);
    const [local, external] = findImageEmbeds(editorTree);

    // Local media gets the cloud-assets + staging-branch prefix, with the
    // media-root segment stripped (S3 key is rooted at the file path).
    expect(local.src).toBe(
      `https://${config.assetsHost}/${config.clientId}/__staging/${config.branch}/__file/library/local.png`
    );

    // Absolute external URL passes through untouched in the read direction.
    expect(external.src).toBe(externalSrc);

    // WRITE: editor sends the tree back, server serializes to MDX.
    const serialized = serializeMDX(editorTree, bodyField, writeCallback);
    if (typeof serialized !== 'string') {
      throw new Error('Expected serializeMDX to return a string');
    }

    // Round-trip identity: the serialized output equals the input.
    expect(serialized.trim()).toBe(inputMdx.trim());

    // Re-parsing the serialized output yields the same editor-side values.
    const reparsed = parseMDX(serialized, bodyField, readCallback);
    const [localAgain, externalAgain] = findImageEmbeds(reparsed);
    expect(localAgain.src).toBe(local.src);
    expect(externalAgain.src).toBe(externalSrc);
  });

  it('round-trips protocol-relative and http URLs identically', () => {
    const protocolRelativeSrc = '//cdn.example.com/img.png';
    const httpSrc = 'http://example.com/img.jpg';

    const inputMdx = [
      `<imageEmbed alt="Protocol-relative" src="${protocolRelativeSrc}" />`,
      '',
      `<imageEmbed alt="HTTP" src="${httpSrc}" />`,
    ].join('\n');

    const editorTree = parseMDX(inputMdx, bodyField, readCallback);
    const [protoRel, http] = findImageEmbeds(editorTree);

    expect(protoRel.src).toBe(protocolRelativeSrc);
    expect(http.src).toBe(httpSrc);

    const serialized = serializeMDX(editorTree, bodyField, writeCallback);
    if (typeof serialized !== 'string') {
      throw new Error('Expected serializeMDX to return a string');
    }
    expect(serialized.trim()).toBe(inputMdx.trim());
  });

  it('self-heals a corrupted src on read and writes it back cleanly on save', () => {
    // Shape of a previously-corrupted value: the configured media root
    // (`/uploads`) was concatenated directly in front of an absolute URL by
    // an earlier broken round-trip. After this round-trip the disk value
    // should be back to the clean external URL.
    const corruptedSrc =
      '/uploadshttps://github.com/owner/repo/assets/123/abc.png';
    const healedSrc = 'https://github.com/owner/repo/assets/123/abc.png';

    const inputMdx = `<imageEmbed alt="Was corrupted" src="${corruptedSrc}" />`;

    const editorTree = parseMDX(inputMdx, bodyField, readCallback);
    const [embed] = findImageEmbeds(editorTree);
    expect(embed.src).toBe(healedSrc);

    const serialized = serializeMDX(editorTree, bodyField, writeCallback);
    if (typeof serialized !== 'string') {
      throw new Error('Expected serializeMDX to return a string');
    }
    expect(serialized.trim()).toBe(
      `<imageEmbed alt="Was corrupted" src="${healedSrc}" />`
    );
  });
});
