import { buildSchema } from 'graphql';
import { generateTypes } from './index';

// Mirrors the shape @tinacms/graphql emits: rich-text fields are typed with the
// generic JSON scalar, the same one `_values` uses.
const schema = buildSchema(`
  scalar JSON
  scalar Reference

  type Post {
    title: String!
    _body: JSON
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

  it('types the JSON scalar as `any`', () => {
    // Rich-text bodies ride on JSON and get passed straight to <TinaMarkdown/>,
    // which takes TinaMarkdownContent. `unknown` — graphql-codegen's default for
    // unmapped scalars — does not assign to that, so every consumer would break.
    expect(types).toContain('JSON: { input: any; output: any; }');
    expect(types).not.toMatch(/JSON: \{ input: unknown/);
  });

  it('types the Reference scalar as `any`', () => {
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
