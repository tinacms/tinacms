import { describe, it, expect } from 'vitest';

// The upload-type check is duplicated byte-for-byte across @tinacms/cli and the
// four media adapters, because the packages share no runtime module. These
// vectors guard against the copies drifting apart, which would silently weaken
// the server-side check in whichever copy fell behind.
import { isDisallowedUploadType as cli } from '../packages/@tinacms/cli/src/utils/upload-type';
import { isDisallowedUploadType as s3 } from '../packages/next-tinacms-s3/src/upload-type';
import { isDisallowedUploadType as dos } from '../packages/next-tinacms-dos/src/upload-type';
import { isDisallowedUploadType as cloudinary } from '../packages/next-tinacms-cloudinary/src/upload-type';
import { isDisallowedUploadType as azure } from '../packages/next-tinacms-azure/src/upload-type';

const copies = [
  ['@tinacms/cli', cli],
  ['next-tinacms-s3', s3],
  ['next-tinacms-dos', dos],
  ['next-tinacms-cloudinary', cloudinary],
  ['next-tinacms-azure', azure],
] as const;

// [name, disallowed] — one table every copy must agree on.
const vectors: [string, boolean][] = [
  ['photo.png', false],
  ['clip.mp4', false],
  ['doc.pdf', false],
  ['logo.svg', false],
  ['logo.svgz', false],
  ['model.riv', false],
  ['a.html', true],
  ['a.HTM', true],
  ['a.xhtml', true],
  ['a.shtml', true],
  ['a.mhtml', true],
  ['a.js', true],
  ['a.mjs', true],
  ['a.cjs', true],
  ['a.xml', true],
  ['a.xsd', true],
  ['a.rdf', true],
  ['a.rss', true],
  ['a.atom', true],
  ['a.wsdl', true],
  ['a.xul', true],
  ['a.png.html', true],
  ['a.html.png', false],
  ['.html', true],
  ['.gitignore', false],
  ['a.html.', true],
  ['a.html ', true],
  ['a.png:b.html', true],
  ['a.html::$DATA', true],
  ['my:photo.png', false],
  ['dir/a.html', true],
  ['C:\\proj\\public\\uploads\\a.html::$DATA', true],
  ['C:\\proj\\public\\uploads\\photo.png', false],
];

describe.each(copies)('%s isDisallowedUploadType', (_name, isDisallowed) => {
  it.each(vectors)('%s -> %s', (name, expected) => {
    expect(isDisallowed(name)).toBe(expected);
  });
});

describe('the five copies behave identically (anti-drift)', () => {
  it.each(vectors.map(([name]) => name))('same outcome for %j', (name) => {
    const outcomes = copies.map(([, fn]) => fn(name));
    expect(new Set(outcomes).size).toBe(1);
  });
});
