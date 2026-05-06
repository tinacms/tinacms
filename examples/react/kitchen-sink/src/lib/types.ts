/** Props passed from server page → client page for Tina visual editing. */
export interface TinaPageProps<TData = Record<string, unknown>> {
  query: string;
  variables: Record<string, string>;
  data: TData;
}
