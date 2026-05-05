/**
 * Public type re-exports + a typed default placeholder.
 *
 * The runtime entry for `import TinaMarkdown from '@tinacms/astro'` resolves
 * via the `astro` / `default` export conditions to `src/TinaMarkdown.astro`,
 * which the consumer's Astro pipeline compiles. The `declare const` below
 * exists so `dist/index.d.ts` (the `types` condition) carries a default
 * export that matches the runtime shape — without it, TS reports the import
 * as "not a valid component".
 */
import type { AstroComponent } from './types';

export type {
  AstroComponent,
  CustomComponentsMap,
  MdxElement,
  TextElement,
  TinaRichTextContent,
  TinaRichTextNode,
  TinaRichTextRoot,
} from './types';

declare const TinaMarkdown: AstroComponent;
export default TinaMarkdown;
