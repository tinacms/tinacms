import fragsGql from '../../tina/__generated__/frags.gql?raw';
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

/**
 * Pull a single named query out of the generated queries file plus
 * exactly the fragments it transitively references. GraphQL servers
 * reject documents that contain unused fragments, so naively
 * concatenating every fragment in frags.gql breaks queries that only
 * touch one collection.
 */
function extractQuery(name: string): string {
  const queryRe = new RegExp(
    `^query ${name}\\([^)]*\\) {[\\s\\S]+?\\n}\\n`,
    'm'
  );
  const queryMatch = queriesGql.match(queryRe);
  if (!queryMatch) throw new Error(`query "${name}" not found in queries.gql`);
  const query = queryMatch[0];

  const fragments = collectFragments(query);
  return [query, ...fragments].join('\n');
}

/**
 * Walk fragment dependencies starting from the names referenced by
 * `source` (a query or another fragment body). Returns each fragment
 * definition exactly once, in dependency order.
 */
function collectFragments(source: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  const visit = (input: string) => {
    const refs = input.matchAll(/\.\.\.([A-Z]\w+)\b/g);
    for (const ref of refs) {
      const name = ref[1];
      if (seen.has(name)) continue;
      const fragRe = new RegExp(
        `^fragment ${name} on \\w+ \\{[\\s\\S]+?\\n\\}\\n`,
        'm'
      );
      const fragMatch = fragsGql.match(fragRe);
      if (!fragMatch) continue;
      seen.add(name);
      visit(fragMatch[0]);
      result.push(fragMatch[0]);
    }
  };

  visit(source);
  return result;
}

export const GLOBAL_QUERY = extractQuery('global');
export const PAGE_QUERY = extractQuery('page');
export const POST_QUERY = extractQuery('post');
export const BLOG_QUERY = extractQuery('blog');
export const AUTHOR_QUERY = extractQuery('author');
