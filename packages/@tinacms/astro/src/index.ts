/**
 * Runtime entry for the package's `.` subpath. Astro consumers resolve
 * through the `astro` export condition straight to `src/TinaMarkdown.astro`
 * — they get the real component as the default export plus the named
 * helpers re-exported from the .astro frontmatter.
 *
 * This file is the fallback for any tool that *doesn't* understand the
 * `astro` condition (TypeScript types, plain Node ESM resolution). It
 * exposes the named runtime helpers and a placeholder default that
 * throws with a clear redirect if someone reaches it.
 */
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { CustomComponentsMap, TinaRichTextContent } from './types';

export { requestWithMetadata, type QueryResult } from './data';
export { tinaField } from './tina-field';
export type {
  AstroComponent,
  CustomComponentsMap,
  MdxElement,
  TextElement,
  TinaRichTextContent,
  TinaRichTextNode,
  TinaRichTextRoot,
} from './types';

/**
 * Typed shape of `<TinaMarkdown content={...} components={...} />` for tools
 * that resolve through the `types` / `default` export condition rather than
 * the `astro` condition. The actual component is `src/TinaMarkdown.astro`;
 * this placeholder throws if invoked because the only legitimate caller is
 * Astro's component pipeline, which reaches the .astro file directly.
 *
 * The intersection of `AstroComponentFactory` (Astro's component-validity
 * check) and a typed prop signature (TinaMarkdown's actual API) gives the
 * Astro language server enough shape to both recognise this as a renderable
 * component AND offer prop completions / type errors at the call site.
 */
type TinaMarkdownComponent = AstroComponentFactory & {
  (props: {
    content: TinaRichTextContent;
    components?: CustomComponentsMap;
  }): unknown;
};

const TinaMarkdownPlaceholder = (() => {
  throw new Error(
    "[@tinacms/astro] TinaMarkdown must be loaded through Astro's pipeline. " +
      'Add `tina()` from `@tinacms/astro/integration` to your astro.config integrations, ' +
      'or import directly from `@tinacms/astro/TinaMarkdown.astro`.'
  );
}) as unknown as TinaMarkdownComponent;

export default TinaMarkdownPlaceholder;
