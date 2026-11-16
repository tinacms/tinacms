import { type QueryResult, subscribeToTinaData } from './data';

/**
 * Live Tina data for a page or layout. Returns the server-loaded data, replaced by the
 * editor's unsaved data while the page is open in the Tina admin iframe.
 *
 * Pass a getter (`() => data.postQuery`), not the value: the getter keeps it reactive
 * across SvelteKit navigations, which reuse the component with new `data`.
 *
 * Must be called during component initialisation, because it creates an `$effect`.
 */
export function useTina<TData extends object>(
  getQuery: () => QueryResult<TData>
): { readonly data: TData } {
  let preview = $state.raw<{ id: string; data: TData }>();

  $effect(() => {
    const query = getQuery();
    return subscribeToTinaData(query, (data) => {
      preview = { id: query.id, data };
    });
  });

  return {
    get data() {
      const query = getQuery();
      return preview?.id === query.id ? preview.data : query.data;
    },
  };
}
