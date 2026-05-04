/**
 * Use the auto-generated query strings verbatim. The admin's form-builder
 * inspects the query for `... on Document { _sys, id }` selections to
 * decide which sub-trees should become editable forms — without that
 * exact shape, `_tina_metadata` is never attached to the resolver
 * output and click-to-focus can't resolve the matched form field
 * ("No metadata found for: post.excerpt").
 *
 * Vite's `?raw` suffix gives us the file contents as a string at build
 * time; the generated GQL files are kept in step with the schema by
 * Tina's CLI, so this stays in sync automatically.
 */
import queriesGql from '../../tina/__generated__/queries.gql?raw';
import fragsGql from '../../tina/__generated__/frags.gql?raw';

/**
 * Pull a single named query out of the generated queries file. The
 * returned string includes every fragment in frags.gql so the query is
 * self-contained — Tina's request layer needs the fragments inlined or
 * referenced; safer to ship them all than to introspect dependencies.
 */
function extractQuery(name: string): string {
  const re = new RegExp(`^query ${name}\\([^)]*\\) {[\\s\\S]+?\\n}\\n`, 'm');
  const match = queriesGql.match(re);
  if (!match) throw new Error(`query "${name}" not found in queries.gql`);
  return `${match[0]}\n${fragsGql}`;
}

export const GLOBAL_QUERY = extractQuery('global');
export const PAGE_QUERY = extractQuery('page');
export const POST_QUERY = extractQuery('post');
export const BLOG_QUERY = extractQuery('blog');
export const AUTHOR_QUERY = extractQuery('author');
