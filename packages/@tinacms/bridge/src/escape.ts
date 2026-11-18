/**
 * HTML attribute escape for double-quoted attributes. `&` is escaped first
 * so the subsequent replacements don't double-encode existing entities.
 */
export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
