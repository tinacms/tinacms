import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildSchema } from 'graphql';
import { generateTypes } from './index';

// Mirrors the shape @tinacms/graphql emits: rich-text fields get their own
// RichText scalar, while `_values` still rides on the generic JSON scalar.
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

const NO_DOCUMENTS = ['/__tina_no_documents__/*.gql'];

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
    // graphql-codegen defaults unmapped scalars to `unknown`, which does not
    // assign to `any` and would break every `_values` consumer.
    expect(types).toContain('JSON: { input: any; output: any; }');
    expect(types).not.toMatch(/JSON: \{ input: unknown/);
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

describe('generateTypes with a space in the project path', () => {
  it('loads queries from a folder whose path contains a space', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'a directory with '));
    try {
      fs.mkdirSync(path.join(dir, 'queries/nested'), { recursive: true });
      fs.writeFileSync(
        path.join(dir, 'queries/nested/post.graphql'),
        'query SpacedPost { post(relativePath: "a.md") { title } }'
      );
      const types = await generateTypes(
        schema,
        ['graphql', 'gql'].map((ext) => path.join(dir, `queries/**/*.${ext}`)),
        NO_DOCUMENTS,
        'http://localhost:4001/graphql'
      );
      expect(types).toContain('SpacedPostQuery');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
