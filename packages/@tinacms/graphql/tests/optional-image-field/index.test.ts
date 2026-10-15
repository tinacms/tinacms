import { expect, it } from 'vitest';
import { setupMutation } from '../util';
import config from './tina/config';

const createMutation = `
  mutation {
    createDocument(
      collection: "post"
      relativePath: "new.md"
      params: { post: { title: "New", coverImage: "", heroImage: "" } }
    ) {
      __typename
    }
  }
`;

const updateMutation = (coverImage: string) => `
  mutation {
    updateDocument(
      collection: "post"
      relativePath: "with-image.md"
      params: {
        post: {
          title: "With Image"
          coverImage: "${coverImage}"
          heroImage: "/uploads/hero.png"
        }
      }
    ) {
      __typename
    }
  }
`;

it('leaves an empty optional image out of the frontmatter on create', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({ query: createMutation, variables: {} });

  expect(result.errors).toBeUndefined();
  const written = bridge.getWrite('posts/new.md');
  expect(written).not.toContain('coverImage');
  expect(written).toContain("heroImage: ''");
});

it('removes an optional image from the frontmatter when it is cleared on update', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({ query: updateMutation(''), variables: {} });

  expect(result.errors).toBeUndefined();
  const written = bridge.getWrite('posts/with-image.md');
  expect(written).not.toContain('coverImage');
  expect(written).toContain('heroImage: /uploads/hero.png');
});

it('keeps an optional image that has a value on update', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({
    query: updateMutation('/uploads/new-cover.png'),
    variables: {},
  });

  expect(result.errors).toBeUndefined();
  expect(bridge.getWrite('posts/with-image.md')).toContain(
    'coverImage: /uploads/new-cover.png'
  );
});
