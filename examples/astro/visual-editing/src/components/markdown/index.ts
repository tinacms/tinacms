/**
 * Map of MDX component name → Astro component, plus default-tag overrides.
 * Mirrors the `customComponents` export in
 * examples/astro/kitchen-sink/src/components/markdown-components.tsx.
 *
 * Standard tag keys (`p`, `h1`, etc.) are picked up by the rich-text
 * Node renderer's overrides path. Capitalised keys match `mdxJsxFlowElement`
 * / `mdxJsxTextElement` names from the rich-text editor.
 */
import type { CustomComponentsMap } from '@tinacms/astro/types';

import Anchor from './Anchor.astro';
import BlockQuote from './BlockQuote.astro';
import BlockquoteTag from './BlockquoteTag.astro';
import CodeBlock from './CodeBlock.astro';
import DateTime from './DateTime.astro';
import Heading1 from './Heading1.astro';
import Heading2 from './Heading2.astro';
import Heading3 from './Heading3.astro';
import Hr from './Hr.astro';
import Img from './Img.astro';
import ListItem from './ListItem.astro';
import NewsletterSignup from './NewsletterSignup.astro';
import OrderedList from './OrderedList.astro';
import Paragraph from './Paragraph.astro';
import UnorderedList from './UnorderedList.astro';

export const customComponents: CustomComponentsMap = {
  // Custom MDX components (referenced by name from the rich-text editor)
  BlockQuote,
  DateTime,
  NewsletterSignup,

  // Default-tag overrides (styling)
  code_block: CodeBlock,
  p: Paragraph,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  blockquote: BlockquoteTag,
  hr: Hr,
  a: Anchor,
  img: Img,
};
