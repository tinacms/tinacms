/**
 * HTML attribute escape for double-quoted attributes. `&` is escaped first
 * so the subsequent replacements don't double-encode existing entities.
 * Adequate for the shapes we emit server-side — `data-tina-form` payloads
 * and `data-tina-island` marker paths — neither of which is parsed as
 * HTML downstream.
 */
export function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
