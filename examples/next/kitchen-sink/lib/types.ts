/** Props passed from server page → client page for Tina visual editing. */
export interface TinaPageProps {
  query: string;
  variables: Record<string, any>;
  data: any;
}
