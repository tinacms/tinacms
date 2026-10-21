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
  expect(written).toContain('heroImage:');
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

it('leaves an empty optional image inside an object out of the frontmatter', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({
    query: `
      mutation {
        createDocument(
          collection: "post"
          relativePath: "nested.md"
          params: {
            post: { title: "Nested", heroImage: "/uploads/hero.png", hero: { image: "" } }
          }
        ) {
          __typename
        }
      }
    `,
    variables: {},
  });

  expect(result.errors).toBeUndefined();
  expect(bridge.getWrite('posts/nested.md')).not.toContain('image: ');
});

it('leaves an empty optional image inside a block out of the frontmatter', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({
    query: `
      mutation {
        createDocument(
          collection: "post"
          relativePath: "block.md"
          params: {
            post: {
              title: "Block"
              heroImage: "/uploads/hero.png"
              blocks: [{ feature: { title: "Feature", image: "" } }]
            }
          }
        ) {
          __typename
        }
      }
    `,
    variables: {},
  });

  expect(result.errors).toBeUndefined();
  const written = bridge.getWrite('posts/block.md');
  expect(written).toContain('title: Feature');
  expect(written).not.toContain('image: ');
});
