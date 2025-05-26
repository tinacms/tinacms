import { MemoryLevel } from 'memory-level';
import { beforeEach, describe, expect, it } from 'vitest';
import { OP } from './datalayer';
import { Database } from './index';
import { CONTENT_ROOT_PREFIX, Level, SUBLEVEL_OPTIONS } from './level';

const schema = {
  collections: [
    {
      label: 'Content',
      name: 'posts',
      path: 'content/posts',
      format: 'mdx',
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
          isTitle: true,
          required: true,
          namespace: ['post', 'title'],
          searchable: true,
          uid: false,
        },
      ],
    },
  ],
};

const initSchema = async (level: Level, schema: Record<string, unknown>) => {
  return level
    .sublevel('_content', SUBLEVEL_OPTIONS)
    .sublevel<string, Record<string, any>>(
      CONTENT_ROOT_PREFIX,
      SUBLEVEL_OPTIONS
    )
    .put('tina/__generated__/_schema.json', schema);
};

describe('Database', () => {
  let level: Level;

  beforeEach(() => {
    level = new MemoryLevel();
  });

  it('should be able to create a new database instance', () => {
    const db = new Database({
      level,
    });
    expect(db).toBeInstanceOf(Database);
  });

  it('should be able to set, get and delete a value', async () => {
    const db = new Database({
      level,
    });

    await initSchema(level, schema);

    await db.put('content/posts/foo.mdx', { title: 'mytitle' }, 'posts');
    const value = await db.get('content/posts/foo.mdx');
    expect(value).toStrictEqual({
      title: 'mytitle',
      _collection: 'posts',
      _template: 'posts',
      _relativePath: 'foo.mdx',
      _id: 'content/posts/foo.mdx',
      _keepTemplateKey: false,
    });
    await db.delete('content/posts/foo.mdx');
    let deletedValue;
    try {
      deletedValue = await db.get('content/posts/foo.mdx');
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
    expect(deletedValue).toBeUndefined();
  });

  describe('query', () => {
    it('orders results using default sort key', async () => {
      const db = new Database({
        level,
      });

      await initSchema(level, schema);

      await db.put('content/posts/foo.mdx', { title: 'mytitle' }, 'posts');
      await db.put('content/posts/bar.mdx', { title: 'mytitle' }, 'posts');
      await db.put('content/posts/baz.mdx', { title: 'mytitle' }, 'posts');

      const results = await db.query(
        {
          collection: 'posts',
        },
        (item) => item
      );
      expect(results?.edges).toHaveLength(3);
      expect(results?.edges[0].node).toStrictEqual('content/posts/bar.mdx');
      expect(results?.edges[1].node).toStrictEqual('content/posts/baz.mdx');
      expect(results?.edges[2].node).toStrictEqual('content/posts/foo.mdx');
    });

    it('orders results using title', async () => {
      const db = new Database({
        level,
      });

      await initSchema(level, schema);

      await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
      await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
      await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

      const results = await db.query(
        {
          collection: 'posts',
          sort: 'title',
        },
        (item) => item
      );
      expect(results?.edges).toHaveLength(3);
      expect(results?.edges[0].node).toStrictEqual('content/posts/foo.mdx');
      expect(results?.edges[1].node).toStrictEqual('content/posts/bar.mdx');
      expect(results?.edges[2].node).toStrictEqual('content/posts/baz.mdx');
    });

    describe('folder', () => {
      it('orders results using title with root folder', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
        await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');
        await db.put(
          'content/posts/child/foo.mdx',
          { title: 'apple' },
          'posts'
        );

        const results = await db.query(
          {
            collection: 'posts',
            folder: '~',
          },
          (item) => item
        );

        expect(results?.edges).toHaveLength(3);
        expect(results?.edges[0].node).toStrictEqual(
          'content/posts/aa21f92fff87ef89428ac54f40b68dc39cf08aaa.mdx'
        );
        expect(results?.edges[1].node).toStrictEqual('content/posts/bar.mdx');
        expect(results?.edges[2].node).toStrictEqual('content/posts/baz.mdx');
      });

      it('orders results using title with subfolder', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put(
          'content/posts/parent/foo.mdx',
          { title: 'apple' },
          'posts'
        );
        await db.put(
          'content/posts/parent/child/bar.mdx',
          { title: 'berry' },
          'posts'
        );
        await db.put(
          'content/posts/parent/child/grandchild/baz.mdx',
          { title: 'clam' },
          'posts'
        );

        const results = await db.query(
          {
            collection: 'posts',
            folder: '~/parent/child',
          },
          (item) => item
        );
        console.log(results?.edges);
        expect(results?.edges).toHaveLength(2);
        expect(results?.edges[0].node).toStrictEqual(
          'content/posts/e3ff5a1eaf5c7b3c2aa59c602ae98ae5988f33c8.mdx'
        );
        expect(results?.edges[1].node).toStrictEqual(
          'content/posts/parent/child/bar.mdx'
        );
      });
    });

    it('limits results using first', async () => {
      const db = new Database({
        level,
      });

      await initSchema(level, schema);

      await db.put('content/posts/foo.mdx', { title: 'mytitle' }, 'posts');
      await db.put('content/posts/bar.mdx', { title: 'mytitle' }, 'posts');
      await db.put('content/posts/baz.mdx', { title: 'mytitle' }, 'posts');

      let results = await db.query(
        {
          collection: 'posts',
          first: 2,
        },
        (item) => item
      );
      expect(results?.edges).toHaveLength(2);
      expect(results?.edges[0].node).toStrictEqual('content/posts/bar.mdx');
      expect(results?.edges[1].node).toStrictEqual('content/posts/baz.mdx');

      const {
        pageInfo: { startCursor, endCursor, hasPreviousPage, hasNextPage },
      } = results;
      expect(hasPreviousPage).toBe(false);
      expect(hasNextPage).toBe(true);
      expect(startCursor).toBeDefined();
      expect(endCursor).toBeDefined();

      results = await db.query(
        {
          collection: 'posts',
          first: 2,
          after: endCursor,
        },
        (item) => item
      );

      expect(results?.edges).toHaveLength(1);
      expect(results?.edges[0].node).toStrictEqual('content/posts/foo.mdx');
      const {
        pageInfo: {
          startCursor: newStartCursor,
          endCursor: newEndCursor,
          hasPreviousPage: newHasPreviousPage,
          hasNextPage: newHasNextPage,
        },
      } = results;
      expect(newHasPreviousPage).toBe(false);
      expect(newHasNextPage).toBe(false);
      expect(newStartCursor).toBeDefined();
      expect(newEndCursor).toBeDefined();
    });

    it('orders results using title first 2', async () => {
      const db = new Database({
        level,
      });

      await initSchema(level, schema);

      await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
      await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
      await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

      let results = await db.query(
        {
          collection: 'posts',
          sort: 'title',
          first: 2,
        },
        (item) => item
      );
      expect(results?.edges).toHaveLength(2);
      expect(results?.edges[0].node).toStrictEqual('content/posts/foo.mdx');
      expect(results?.edges[1].node).toStrictEqual('content/posts/bar.mdx');

      const {
        pageInfo: { startCursor, endCursor, hasPreviousPage, hasNextPage },
      } = results;
      expect(hasPreviousPage).toBe(false);
      expect(hasNextPage).toBe(true);
      expect(startCursor).toBeDefined();
      expect(endCursor).toBeDefined();
      results = await db.query(
        {
          collection: 'posts',
          sort: 'title',
          first: 2,
          after: endCursor,
        },
        (item) => item
      );
      expect(results?.edges).toHaveLength(1);
      expect(results?.edges[0].node).toStrictEqual('content/posts/baz.mdx');
      const {
        pageInfo: {
          startCursor: newStartCursor,
          endCursor: newEndCursor,
          hasPreviousPage: newHasPreviousPage,
          hasNextPage: newHasNextPage,
        },
      } = results;
      expect(newHasPreviousPage).toBe(false);
      expect(newHasNextPage).toBe(false);
      expect(newStartCursor).toBeDefined();
      expect(newEndCursor).toBeDefined();
    });

    it('limits results using last', async () => {
      const db = new Database({
        level,
      });

      await initSchema(level, schema);

      await db.put('content/posts/foo.mdx', { title: 'mytitle' }, 'posts');
      await db.put('content/posts/bar.mdx', { title: 'mytitle' }, 'posts');
      await db.put('content/posts/baz.mdx', { title: 'mytitle' }, 'posts');

      let results = await db.query(
        {
          collection: 'posts',
          last: 2,
        },
        (item) => item
      );
      expect(results?.edges).toHaveLength(2);
      expect(results?.edges[0].node).toStrictEqual('content/posts/foo.mdx');
      expect(results?.edges[1].node).toStrictEqual('content/posts/baz.mdx');

      const {
        pageInfo: { startCursor, endCursor, hasPreviousPage, hasNextPage },
      } = results;
      expect(hasPreviousPage).toBe(true);
      expect(hasNextPage).toBe(false);
      expect(startCursor).toBeDefined();
      expect(endCursor).toBeDefined();
      results = await db.query(
        {
          collection: 'posts',
          last: 2,
          before: endCursor,
        },
        (item) => item
      );
      expect(results?.edges).toHaveLength(1);
      expect(results?.edges[0].node).toStrictEqual('content/posts/bar.mdx');
      const {
        pageInfo: {
          startCursor: newStartCursor,
          endCursor: newEndCursor,
          hasPreviousPage: newHasPreviousPage,
          hasNextPage: newHasNextPage,
        },
      } = results;
      expect(newHasPreviousPage).toBe(false);
      expect(newHasNextPage).toBe(false);
      expect(newStartCursor).toBeDefined();
      expect(newEndCursor).toBeDefined();
    });

    it('orders results using title last 2', async () => {
      const db = new Database({
        level,
      });

      await initSchema(level, schema);

      await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
      await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
      await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

      let results = await db.query(
        {
          collection: 'posts',
          sort: 'title',
          last: 2,
        },
        (item) => item
      );
      expect(results?.edges).toHaveLength(2);
      expect(results?.edges[0].node).toStrictEqual('content/posts/baz.mdx');
      expect(results?.edges[1].node).toStrictEqual('content/posts/bar.mdx');

      const {
        pageInfo: { startCursor, endCursor, hasPreviousPage, hasNextPage },
      } = results;
      expect(hasPreviousPage).toBe(true);
      expect(hasNextPage).toBe(false);
      expect(startCursor).toBeDefined();
      expect(endCursor).toBeDefined();
      results = await db.query(
        {
          collection: 'posts',
          sort: 'title',
          last: 2,
          before: endCursor,
        },
        (item) => item
      );
      expect(results?.edges).toHaveLength(1);
      expect(results?.edges[0].node).toStrictEqual('content/posts/foo.mdx');
      const {
        pageInfo: {
          startCursor: newStartCursor,
          endCursor: newEndCursor,
          hasPreviousPage: newHasPreviousPage,
          hasNextPage: newHasNextPage,
        },
      } = results;
      expect(newHasPreviousPage).toBe(false);
      expect(newHasNextPage).toBe(false);
      expect(newStartCursor).toBeDefined();
      expect(newEndCursor).toBeDefined();
    });

    describe('binary filter', async () => {
      it('title equals', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
        await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
        await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

        const results = await db.query(
          {
            collection: 'posts',
            sort: 'title',
            filterChain: [
              {
                pathExpression: 'title',
                operator: OP.EQ,
                rightOperand: 'apple',
                type: 'string',
                list: false,
              },
            ],
          },
          (item) => item
        );
        expect(results?.edges).toHaveLength(1);
        expect(results?.edges[0].node).toStrictEqual('content/posts/foo.mdx');
      });

      it('title equals default sort', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
        await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
        await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

        const results = await db.query(
          {
            collection: 'posts',
            filterChain: [
              {
                pathExpression: 'title',
                operator: OP.EQ,
                rightOperand: 'apple',
                type: 'string',
                list: false,
              },
            ],
          },
          (item) => item
        );
        expect(results?.edges).toHaveLength(1);
        expect(results?.edges[0].node).toStrictEqual('content/posts/foo.mdx');
      });
      it('title equals', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
        await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
        await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

        const results = await db.query(
          {
            collection: 'posts',
            filterChain: [
              {
                pathExpression: 'title',
                operator: OP.EQ,
                rightOperand: 'apple',
                type: 'string',
                list: false,
              },
            ],
          },
          (item) => item
        );
        expect(results?.edges).toHaveLength(1);
        expect(results?.edges[0].node).toStrictEqual('content/posts/foo.mdx');
      });

      it('title in', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
        await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
        await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

        const results = await db.query(
          {
            collection: 'posts',
            filterChain: [
              {
                pathExpression: 'title',
                operator: OP.IN,
                rightOperand: ['berry', 'clam'],
                type: 'string',
                list: false,
              },
            ],
          },
          (item) => item
        );
        expect(results?.edges).toHaveLength(2);
        expect(results?.edges[0].node).toStrictEqual('content/posts/bar.mdx');
        expect(results?.edges[1].node).toStrictEqual('content/posts/baz.mdx');
      });

      it('title startsWith', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
        await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
        await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

        const results = await db.query(
          {
            collection: 'posts',
            sort: 'title',
            filterChain: [
              {
                pathExpression: 'title',
                operator: OP.STARTS_WITH,
                rightOperand: 'ber',
                type: 'string',
                list: false,
              },
            ],
          },
          (item) => item
        );
        expect(results?.edges).toHaveLength(1);
        expect(results?.edges[0].node).toStrictEqual('content/posts/bar.mdx');
      });

      it('title gt', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
        await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
        await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

        const results = await db.query(
          {
            collection: 'posts',
            sort: 'title',
            filterChain: [
              {
                pathExpression: 'title',
                operator: OP.GT,
                rightOperand: 'apple',
                type: 'string',
                list: false,
              },
            ],
          },
          (item) => item
        );
        expect(results?.edges).toHaveLength(2);
        expect(results?.edges[0].node).toStrictEqual('content/posts/bar.mdx');
        expect(results?.edges[1].node).toStrictEqual('content/posts/baz.mdx');
      });

      it('title gte', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
        await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
        await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

        const results = await db.query(
          {
            collection: 'posts',
            sort: 'title',
            filterChain: [
              {
                pathExpression: 'title',
                operator: OP.GTE,
                rightOperand: 'apple',
                type: 'string',
                list: false,
              },
            ],
          },
          (item) => item
        );
        expect(results?.edges).toHaveLength(3);
        expect(results?.edges[0].node).toStrictEqual('content/posts/foo.mdx');
        expect(results?.edges[1].node).toStrictEqual('content/posts/bar.mdx');
        expect(results?.edges[2].node).toStrictEqual('content/posts/baz.mdx');
      });

      it('title lt', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
        await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
        await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

        const results = await db.query(
          {
            collection: 'posts',
            sort: 'title',
            filterChain: [
              {
                pathExpression: 'title',
                operator: OP.LT,
                rightOperand: 'berry',
                type: 'string',
                list: false,
              },
            ],
          },
          (item) => item
        );
        expect(results?.edges).toHaveLength(1);
        expect(results?.edges[0].node).toStrictEqual('content/posts/foo.mdx');
      });

      it('title lte', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
        await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
        await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

        const results = await db.query(
          {
            collection: 'posts',
            sort: 'title',
            filterChain: [
              {
                pathExpression: 'title',
                operator: OP.LTE,
                rightOperand: 'berry',
                type: 'string',
                list: false,
              },
            ],
          },
          (item) => item
        );
        expect(results?.edges).toHaveLength(2);
        expect(results?.edges[0].node).toStrictEqual('content/posts/foo.mdx');
        expect(results?.edges[1].node).toStrictEqual('content/posts/bar.mdx');
      });

      it('title gt gt', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
        await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
        await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

        const results = await db.query(
          {
            collection: 'posts',
            filterChain: [
              {
                pathExpression: 'title',
                operator: OP.GT,
                rightOperand: 'apple',
                type: 'string',
                list: false,
              },
              {
                pathExpression: 'title',
                operator: OP.LT,
                rightOperand: 'clam',
                type: 'string',
                list: false,
              },
            ],
          },
          (item) => item
        );
        expect(results?.edges).toHaveLength(1);
        expect(results?.edges[0].node).toStrictEqual('content/posts/bar.mdx');
      });
    });

    describe('ternary filter', () => {
      it('title gt lt', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
        await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
        await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

        const results = await db.query(
          {
            collection: 'posts',
            sort: 'title',
            filterChain: [
              {
                pathExpression: 'title',
                leftOperator: OP.GT,
                rightOperator: OP.LT,
                rightOperand: 'clam',
                leftOperand: 'apple',
                type: 'string',
                list: false,
              },
            ],
          },
          (item) => item
        );
        expect(results?.edges).toHaveLength(1);
        expect(results?.edges[0].node).toStrictEqual('content/posts/bar.mdx');
      });

      it('title gt lte', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
        await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
        await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

        const results = await db.query(
          {
            collection: 'posts',
            sort: 'title',
            filterChain: [
              {
                pathExpression: 'title',
                leftOperator: OP.GT,
                rightOperator: OP.LTE,
                rightOperand: 'clam',
                leftOperand: 'apple',
                type: 'string',
                list: false,
              },
            ],
          },
          (item) => item
        );
        expect(results?.edges).toHaveLength(2);
        expect(results?.edges[0].node).toStrictEqual('content/posts/bar.mdx');
        expect(results?.edges[1].node).toStrictEqual('content/posts/baz.mdx');
      });

      it('title gte lt', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
        await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
        await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

        const results = await db.query(
          {
            collection: 'posts',
            sort: 'title',
            filterChain: [
              {
                pathExpression: 'title',
                leftOperator: OP.GTE,
                rightOperator: OP.LT,
                rightOperand: 'clam',
                leftOperand: 'apple',
                type: 'string',
                list: false,
              },
            ],
          },
          (item) => item
        );
        expect(results?.edges).toHaveLength(2);
        expect(results?.edges[0].node).toStrictEqual('content/posts/foo.mdx');
        expect(results?.edges[1].node).toStrictEqual('content/posts/bar.mdx');
      });

      it('title gte lte', async () => {
        const db = new Database({
          level,
        });

        await initSchema(level, schema);

        await db.put('content/posts/foo.mdx', { title: 'apple' }, 'posts');
        await db.put('content/posts/bar.mdx', { title: 'berry' }, 'posts');
        await db.put('content/posts/baz.mdx', { title: 'clam' }, 'posts');

        const results = await db.query(
          {
            collection: 'posts',
            sort: 'title',
            filterChain: [
              {
                pathExpression: 'title',
                leftOperator: OP.GTE,
                rightOperator: OP.LTE,
                rightOperand: 'clam',
                leftOperand: 'apple',
                type: 'string',
                list: false,
              },
            ],
          },
          (item) => item
        );
        expect(results?.edges).toHaveLength(3);
        expect(results?.edges[0].node).toStrictEqual('content/posts/foo.mdx');
        expect(results?.edges[1].node).toStrictEqual('content/posts/bar.mdx');
        expect(results?.edges[2].node).toStrictEqual('content/posts/baz.mdx');
      });
    });
  });
});
