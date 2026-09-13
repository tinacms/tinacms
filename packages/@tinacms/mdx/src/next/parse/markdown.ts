import type { RichTextField, Template } from '@tinacms/schema-tools';
import * as acorn from 'acorn';
import { fromMarkdown as mdastFromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';
import { mdxJsx } from '../shortcodes';
import type { Options } from '../shortcodes';
import { mdxJsxFromMarkdown } from '../shortcodes/mdast';
import { getFieldPatterns } from '../util';

export const fromMarkdown = (value: string, field: RichTextField) => {
  const patterns = getFieldPatterns(field);
  const acornDefault = acorn as unknown as Options['acorn'];
  const skipHTML = false;
  const tree = mdastFromMarkdown(value, {
    extensions: [
      gfm(),
      mdxJsx({ acorn: acornDefault, patterns, addResult: true, skipHTML }),
    ],
    mdastExtensions: [gfmFromMarkdown(), mdxJsxFromMarkdown({ patterns })],
  });

  return tree;
};
