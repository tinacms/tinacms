import { TinaCMS } from '@toolkit/tina-cms';

export interface ReferenceLinkProps {
  cms: TinaCMS;
  input: any;
}

export type Document = {
  _sys: {
    collection: {
      name: string;
    };
    breadcrumbs: string[];
    filename: string;
    relativePath: string;
  };
};

export interface Response {
  node: Document;
}
