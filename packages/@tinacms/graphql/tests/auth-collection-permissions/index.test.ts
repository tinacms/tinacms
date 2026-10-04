import path from 'path';
import { describe, expect, it } from 'vitest';
import { buildSchema } from '../../src';
import { checkPasswordHash } from '../../src/auth/utils';
import { setupMutation } from '../util';
import referencesConfig from './references/tina/config';
import templatesConfig from './templates/tina/config';
import { buildConfig } from './tina/config';

const USERS_PATH = 'content/users/index.json';

const usersParams = `{
  users: [
    { username: "editor-user", name: "Editor User", email: "editor@example.com", password: { value: "new-password", passwordChangeRequired: false } }
  ]
}`;

const setup = async ({
  isDetached,
  admins = ['admin-user'],
  allowUnauthenticatedWrites = false,
}: {
  isDetached: boolean;
  admins?: string[];
  allowUnauthenticatedWrites?: boolean;
}) => {
  const context = await setupMutation(__dirname, buildConfig({ isDetached }), {
    authCollection: { admins, allowUnauthenticatedWrites },
  });
  const readUsers = async () =>
    JSON.parse(JSON.stringify(await context.database.get(USERS_PATH)));
  const storedUsersBefore = await readUsers();
  const expectNoChanges = async () => {
    expect(context.bridge.getWrites().size).toBe(0);
    expect(context.bridge.getDeletes()).toHaveLength(0);
    expect(await readUsers()).toEqual(storedUsersBefore);
  };
  return { ...context, readUsers, storedUsersBefore, expectNoChanges };
};

const expectNotAuthorized = (result: { errors?: readonly any[] }) => {
  expect(result.errors?.[0]?.message).toBe('Not authorized');
};

describe.each([{ isDetached: true }, { isDetached: false }])(
  'auth collection permissions (isDetached: $isDetached)',
  ({ isDetached }) => {
    const editor = { sub: 'editor-user' };
    const admin = { sub: 'admin-user' };

    it('rejects update<Collection> on the auth collection from a non-admin', async () => {
      const { query, expectNoChanges } = await setup({ isDetached });
      const result = await query({
        query: `mutation { updateUser(relativePath: "index.json", params: ${usersParams}) { __typename } }`,
        variables: {},
        ctxUser: editor,
      });
      expectNotAuthorized(result);
      await expectNoChanges();
    });

    it('rejects create<Collection> on the auth collection from a non-admin', async () => {
      const { query, expectNoChanges } = await setup({ isDetached });
      const result = await query({
        query: `mutation { createUser(relativePath: "other.json", params: ${usersParams}) { __typename } }`,
        variables: {},
        ctxUser: editor,
      });
      expectNotAuthorized(result);
      await expectNoChanges();
    });

    it('rejects updateDocument on the auth collection from a non-admin', async () => {
      const { query, expectNoChanges } = await setup({ isDetached });
      const result = await query({
        query: `mutation { updateDocument(collection: "user", relativePath: "index.json", params: { user: ${usersParams} }) { __typename } }`,
        variables: {},
        ctxUser: editor,
      });
      expectNotAuthorized(result);
      await expectNoChanges();
    });

    it.each([{ ctxUser: editor }, { ctxUser: admin }])(
      'rejects updateDocument rename of the auth document ($ctxUser.sub)',
      async ({ ctxUser }) => {
        const { query, expectNoChanges } = await setup({ isDetached });
        const result = await query({
          query: `mutation { updateDocument(collection: "user", relativePath: "index.json", params: { relativePath: "renamed.json" }) { __typename } }`,
          variables: {},
          ctxUser,
        });
        expectNotAuthorized(result);
        await expectNoChanges();
      }
    );

    it.each([{ ctxUser: editor }, { ctxUser: admin }])(
      'rejects createDocument on the auth collection ($ctxUser.sub)',
      async ({ ctxUser }) => {
        const { query, expectNoChanges } = await setup({ isDetached });
        const result = await query({
          query: `mutation { createDocument(collection: "user", relativePath: "other.json", params: { user: ${usersParams} }) { __typename } }`,
          variables: {},
          ctxUser,
        });
        expectNotAuthorized(result);
        await expectNoChanges();
      }
    );

    it.each([{ ctxUser: editor }, { ctxUser: admin }])(
      'rejects deleteDocument on the auth collection ($ctxUser.sub)',
      async ({ ctxUser }) => {
        const { query, expectNoChanges } = await setup({ isDetached });
        const result = await query({
          query: `mutation { deleteDocument(collection: "user", relativePath: "index.json") { __typename } }`,
          variables: {},
          ctxUser,
        });
        expectNotAuthorized(result);
        await expectNoChanges();
      }
    );

    it.each([{ ctxUser: editor }, { ctxUser: admin }])(
      'rejects addPendingDocument on the auth collection ($ctxUser.sub)',
      async ({ ctxUser }) => {
        const { query, expectNoChanges } = await setup({ isDetached });
        const result = await query({
          query: `mutation { addPendingDocument(collection: "user", relativePath: "other.json") { __typename } }`,
          variables: {},
          ctxUser,
        });
        expectNotAuthorized(result);
        await expectNoChanges();
      }
    );

    it.each([{ ctxUser: editor }, { ctxUser: admin }])(
      'rejects createFolder on the auth collection ($ctxUser.sub)',
      async ({ ctxUser }) => {
        const { query, expectNoChanges } = await setup({ isDetached });
        const result = await query({
          query: `mutation { createFolder(collection: "user", relativePath: "nested") { __typename } }`,
          variables: {},
          ctxUser,
        });
        expectNotAuthorized(result);
        await expectNoChanges();
      }
    );

    it.each([
      `mutation { updateDocument(collection: "data", relativePath: "users/index.json", params: { data: { title: "Changed" } }) { __typename } }`,
      `mutation { createDocument(collection: "data", relativePath: "users/other.json", params: { data: { title: "New" } }) { __typename } }`,
      `mutation { deleteDocument(collection: "data", relativePath: "users/index.json") { __typename } }`,
      `mutation { updateData(relativePath: "users/index.json", params: { title: "Changed" }) { __typename } }`,
    ])(
      'applies the user collection rules to every document stored in it (%#)',
      async (mutation) => {
        const { query, expectNoChanges } = await setup({ isDetached });
        const result = await query({
          query: mutation,
          variables: {},
          ctxUser: editor,
        });
        expectNotAuthorized(result);
        await expectNoChanges();
      }
    );

    it('rejects auth collection writes with no user when unauthenticated writes are off', async () => {
      const { query, expectNoChanges } = await setup({ isDetached });
      const result = await query({
        query: `mutation { updateUser(relativePath: "index.json", params: ${usersParams}) { __typename } }`,
        variables: {},
      });
      expectNotAuthorized(result);
      await expectNoChanges();
    });

    it('allows an admin to update users in index.json', async () => {
      const { query, readUsers, storedUsersBefore } = await setup({
        isDetached,
      });
      const result = await query({
        query: `mutation { updateUser(relativePath: "index.json", params: {
          users: [
            { username: "admin-user", name: "Admin User", email: "admin@example.com", password: { passwordChangeRequired: false } },
            { username: "editor-user", name: "Editor User", email: "editor@example.com", password: { value: "new-password", passwordChangeRequired: true } }
          ]
        }) { __typename } }`,
        variables: {},
        ctxUser: admin,
      });
      expect(result.errors).toBeUndefined();

      const stored = await readUsers();
      expect(stored.users[0].password.value).toBe(
        storedUsersBefore.users[0].password.value
      );
      expect(stored.users[1].password.passwordChangeRequired).toBe(true);
      expect(
        await checkPasswordHash({
          saltedHash: stored.users[1].password.value,
          password: 'new-password',
        })
      ).toBe(true);
    });

    describe('admin edits with the payload the Users screen sends', () => {
      const untouched = (username: string, name: string, email: string) => ({
        username,
        name,
        email,
        password: { passwordChangeRequired: false },
      });
      const updateUsers = `mutation UpdateUsers($params: UserMutation!) { updateUser(relativePath: "index.json", params: $params) { __typename } }`;

      it('adds a user with a password', async () => {
        const { query, readUsers, storedUsersBefore } = await setup({
          isDetached,
        });
        const result = await query({
          query: updateUsers,
          variables: {
            params: {
              users: [
                untouched('admin-user', 'Admin User', 'admin@example.com'),
                untouched('editor-user', 'Editor User', 'editor@example.com'),
                {
                  username: 'new-user',
                  name: 'New User',
                  email: 'new@example.com',
                  password: {
                    value: 'new-user-password',
                    passwordChangeRequired: true,
                  },
                },
              ],
            },
          },
          ctxUser: admin,
        });
        expect(result.errors).toBeUndefined();

        const stored = await readUsers();
        expect(stored.users).toHaveLength(3);
        expect(stored.users[0].password.value).toBe(
          storedUsersBefore.users[0].password.value
        );
        expect(stored.users[1].password.value).toBe(
          storedUsersBefore.users[1].password.value
        );
        expect(
          await checkPasswordHash({
            saltedHash: stored.users[2].password.value,
            password: 'new-user-password',
          })
        ).toBe(true);
      });

      it('edits a name', async () => {
        const { query, readUsers, storedUsersBefore } = await setup({
          isDetached,
        });
        const result = await query({
          query: updateUsers,
          variables: {
            params: {
              users: [
                untouched('admin-user', 'Admin User', 'admin@example.com'),
                untouched(
                  'editor-user',
                  'Renamed Editor',
                  'editor@example.com'
                ),
              ],
            },
          },
          ctxUser: admin,
        });
        expect(result.errors).toBeUndefined();

        const stored = await readUsers();
        expect(stored.users[1].name).toBe('Renamed Editor');
        expect(stored.users.map((u: any) => u.password.value)).toEqual(
          storedUsersBefore.users.map((u: any) => u.password.value)
        );
      });

      it('removes a user', async () => {
        const { query, readUsers, storedUsersBefore } = await setup({
          isDetached,
        });
        const result = await query({
          query: updateUsers,
          variables: {
            params: {
              users: [
                untouched('admin-user', 'Admin User', 'admin@example.com'),
              ],
            },
          },
          ctxUser: admin,
        });
        expect(result.errors).toBeUndefined();

        const stored = await readUsers();
        expect(stored.users).toHaveLength(1);
        expect(stored.users[0].password.value).toBe(
          storedUsersBefore.users[0].password.value
        );
      });

      it('reorders users', async () => {
        const { query, readUsers, storedUsersBefore } = await setup({
          isDetached,
        });
        const result = await query({
          query: updateUsers,
          variables: {
            params: {
              users: [
                untouched('editor-user', 'Editor User', 'editor@example.com'),
                untouched('admin-user', 'Admin User', 'admin@example.com'),
              ],
            },
          },
          ctxUser: admin,
        });
        expect(result.errors).toBeUndefined();

        const stored = await readUsers();
        expect(stored.users.map((u: any) => u.username)).toEqual([
          'editor-user',
          'admin-user',
        ]);
        expect(stored.users[0].password.value).toBe(
          storedUsersBefore.users[1].password.value
        );
        expect(stored.users[1].password.value).toBe(
          storedUsersBefore.users[0].password.value
        );
      });

      it('refuses a username rename without a new password, which would lock the user out', async () => {
        const { query, expectNoChanges } = await setup({ isDetached });
        const result = await query({
          query: updateUsers,
          variables: {
            params: {
              users: [
                untouched('admin-user', 'Admin User', 'admin@example.com'),
                untouched(
                  'renamed-editor',
                  'Editor User',
                  'editor@example.com'
                ),
              ],
            },
          },
          ctxUser: admin,
        });
        expect(result.errors?.[0]?.message).toBe(
          'New users need a password: renamed-editor'
        );
        await expectNoChanges();
      });

      it('renames a username when the admin sets a new password', async () => {
        const { query, readUsers } = await setup({ isDetached });
        const result = await query({
          query: updateUsers,
          variables: {
            params: {
              users: [
                untouched('admin-user', 'Admin User', 'admin@example.com'),
                {
                  username: 'renamed-editor',
                  name: 'Editor User',
                  email: 'editor@example.com',
                  password: {
                    value: 'renamed-password',
                    passwordChangeRequired: true,
                  },
                },
              ],
            },
          },
          ctxUser: admin,
        });
        expect(result.errors).toBeUndefined();

        const stored = await readUsers();
        expect(stored.users[1].username).toBe('renamed-editor');
        expect(
          await checkPasswordHash({
            saltedHash: stored.users[1].password.value,
            password: 'renamed-password',
          })
        ).toBe(true);
      });
    });

    it('allows writes with no user when unauthenticated writes are on', async () => {
      const { query, readUsers } = await setup({
        isDetached,
        allowUnauthenticatedWrites: true,
      });
      const result = await query({
        query: `mutation { updateUser(relativePath: "index.json", params: ${usersParams}) { __typename } }`,
        variables: {},
      });
      expect(result.errors).toBeUndefined();
      expect((await readUsers()).users).toHaveLength(1);
    });

    it('allows non-admin writes to other collections', async () => {
      const { query, bridge } = await setup({ isDetached });
      const results = [
        await query({
          query: `mutation { updatePost(relativePath: "hello.md", params: { title: "Changed" }) { __typename } }`,
          variables: {},
          ctxUser: editor,
        }),
        await query({
          query: `mutation { createPost(relativePath: "new.md", params: { title: "New" }) { __typename } }`,
          variables: {},
          ctxUser: editor,
        }),
        await query({
          query: `mutation { updateDocument(collection: "data", relativePath: "settings.json", params: { data: { title: "Changed" } }) { __typename } }`,
          variables: {},
          ctxUser: editor,
        }),
        await query({
          query: `mutation { deleteDocument(collection: "post", relativePath: "new.md") { __typename } }`,
          variables: {},
          ctxUser: editor,
        }),
      ];
      for (const result of results) {
        expect(result.errors).toBeUndefined();
      }
      expect(bridge.getWrite('content/posts/hello.md')).toContain('Changed');
      expect(bridge.getWrite('content/settings.json')).toContain('Changed');
      expect(bridge.getDeletes()).toEqual(['content/posts/new.md']);
    });
  }
);

describe('auth collection permissions with references', () => {
  const referencesDir = path.join(__dirname, 'references');

  it('applies the user collection rules to reference updates', async () => {
    const { query, bridge, database } = await setupMutation(
      referencesDir,
      referencesConfig,
      { authCollection: { admins: ['admin-user'] } }
    );
    const usersBefore = JSON.parse(
      JSON.stringify(await database.get(USERS_PATH))
    );

    const result = await query({
      query: `mutation { updateDocument(collection: "post", relativePath: "hello.md", params: { relativePath: "renamed.md" }) { __typename } }`,
      variables: {},
      ctxUser: { sub: 'editor-user' },
    });

    expect(result.errors?.[0]?.message).toBe('Not authorized');
    expect(bridge.getWrites().size).toBe(0);
    expect(bridge.getDeletes()).toHaveLength(0);
    expect(await database.get('content/posts/hello.md')).toBeDefined();
    expect(JSON.parse(JSON.stringify(await database.get(USERS_PATH)))).toEqual(
      usersBefore
    );
  });

  it('reads user documents through a reference with the same fields as a direct read', async () => {
    const { query, database } = await setupMutation(
      referencesDir,
      referencesConfig
    );
    const stored = (await database.get(USERS_PATH)) as {
      users: { password: { value: string } }[];
    };

    const withoutValue = await query({
      query: `query { post(relativePath: "hello.md") { author { ... on User { users { username password { passwordChangeRequired } } } } } }`,
      variables: {},
    });
    const withValue = await query({
      query: `query { post(relativePath: "hello.md") { author { ... on User { users { username password { passwordChangeRequired value } } } } } }`,
      variables: {},
    });

    expect(withoutValue.errors).toBeUndefined();
    expect(JSON.stringify(withoutValue.data)).toContain('admin-user');
    const serialized = JSON.stringify([withoutValue, withValue]);
    for (const user of stored.users) {
      expect(serialized).not.toContain(user.password.value);
    }
  });
});

describe('auth collection permissions without an auth collection', () => {
  it('leaves sites without an auth collection unchanged', async () => {
    const config = buildConfig({ isDetached: false });
    const { query, bridge } = await setupMutation(__dirname, {
      schema: {
        collections: config.schema.collections.filter(
          (c) => !c.isAuthCollection
        ),
      },
    });
    const result = await query({
      query: `mutation { updateDocument(collection: "data", relativePath: "users/index.json", params: { data: { title: "Changed" } }) { __typename } }`,
      variables: {},
      ctxUser: { sub: 'editor-user' },
    });
    expect(result.errors).toBeUndefined();
    expect(bridge.getWrite('content/users/index.json')).toContain('Changed');
  });
});

describe('auth collection permissions with templates', () => {
  it('requires a user field on the auth collection', async () => {
    await expect(buildSchema(templatesConfig)).rejects.toThrow(
      'Auth collection must have a user field'
    );
  });
});

describe('auth collection admins', () => {
  const updateUsers = `mutation UpdateUsers($params: UserMutation!) { updateUser(relativePath: "index.json", params: $params) { __typename } }`;
  const adminOnly = {
    users: [
      {
        username: 'admin-user',
        name: 'Admin User',
        email: 'admin@example.com',
        password: { passwordChangeRequired: false },
      },
    ],
  };

  it('rejects an admin listed in config whose user record was removed', async () => {
    const { query } = await setupMutation(
      __dirname,
      buildConfig({ isDetached: true }),
      { authCollection: { admins: ['admin-user', 'editor-user'] } }
    );
    const removal = await query({
      query: updateUsers,
      variables: { params: adminOnly },
      ctxUser: { sub: 'admin-user' },
    });
    expect(removal.errors).toBeUndefined();

    const result = await query({
      query: updateUsers,
      variables: { params: adminOnly },
      ctxUser: { sub: 'editor-user' },
    });
    expect(result.errors?.[0]?.message).toBe('Not authorized');
  });

  it.each([{ isDetached: true }, { isDetached: false }])(
    'keeps a removed admin removed when their own password change is in flight (isDetached: $isDetached)',
    async ({ isDetached }) => {
      const { query, database } = await setupMutation(
        __dirname,
        buildConfig({ isDetached }),
        { authCollection: { admins: ['admin-user', 'editor-user'] } }
      );
      const passwordChange = query({
        query: `mutation { updatePassword(password: "editor-chosen") }`,
        variables: {},
        ctxUser: { sub: 'editor-user' },
      });
      const removal = await query({
        query: updateUsers,
        variables: { params: adminOnly },
        ctxUser: { sub: 'admin-user' },
      });
      expect(removal.errors).toBeUndefined();
      await passwordChange;

      const stored = JSON.parse(JSON.stringify(await database.get(USERS_PATH)));
      expect(stored.users.map((u: any) => u.username)).toEqual(['admin-user']);
      const adminWrite = await query({
        query: updateUsers,
        variables: { params: adminOnly },
        ctxUser: { sub: 'editor-user' },
      });
      expect(adminWrite.errors?.[0]?.message).toBe('Not authorized');
    }
  );

  it('rejects an admin when index.json is missing', async () => {
    const { query, bridge } = await setupMutation(
      path.join(__dirname, 'no-users'),
      buildConfig({ isDetached: false }),
      { authCollection: { admins: ['admin-user'] } }
    );
    const result = await query({
      query: updateUsers,
      variables: { params: adminOnly },
      ctxUser: { sub: 'admin-user' },
    });
    expect(result.errors?.[0]?.message).toBe('Not authorized');
    expect(bridge.getWrites().size).toBe(0);
  });
});
