import { buildSchema } from 'graphql';
import { generateTypes } from './index';

// Mirrors the shape @tinacms/graphql emits: rich-text fields are typed with the
// generic JSON scalar, the same one `_values` uses.
const schema = buildSchema(`
  scalar JSON
  scalar Reference
  scalar RichText

  type Post {
    title: String!
    _body: RichText
    _values: JSON!
  }

  type Query {
    post(relativePath: String!): Post!
  }
`);

const NO_DOCUMENTS = '/__tina_no_documents__/*.gql';

describe('generateTypes', () => {
  let types: string;

  beforeAll(async () => {
    types = await generateTypes(
      schema,
      NO_DOCUMENTS,
      NO_DOCUMENTS,
      'http://localhost:4001/graphql'
    );
  });

  it('types rich-text as TinaMarkdownContent, not an opaque blob', () => {
    expect(types).toContain(
      'RichText: { input: TinaMarkdownContent; output: TinaMarkdownContent; }'
    );
    expect(types).toContain(
      "import type { TinaMarkdownContent } from 'tinacms/dist/rich-text';"
    );
  });

  it('leaves the JSON scalar as `any` — `_values` consumers still index it freely', () => {
    expect(types).toContain('JSON: { input: any; output: any; }');
  });

  it('leaves the Reference scalar as `any`', () => {
    expect(types).toContain('Reference: { input: any; output: any; }');
  });

  it('exports the helper types the generated module has always exported', () => {
    expect(types).toMatch(/export type \{ Exact \}|export type Exact</);
    expect(types).toContain('export type Maybe<');
    expect(types).toContain('export type InputMaybe<');
  });

  it('emits the schema types', () => {
    expect(types).toContain('export type Post = {');
  });
});
