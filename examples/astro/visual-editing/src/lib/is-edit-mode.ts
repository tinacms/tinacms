/**
 * Server-side check: is this request being rendered inside the TinaCMS
 * admin iframe?
 *
 * The admin loads the site iframe with `?tina-edit=1`. Pages that want to
 * conditionally inject the @tinacms/bridge script check this helper in
 * their frontmatter and skip the script for normal visitors.
 */
export function isEditMode(request: Request): boolean {
  const url = new URL(request.url);
  return url.searchParams.get('tina-edit') === '1';
}
