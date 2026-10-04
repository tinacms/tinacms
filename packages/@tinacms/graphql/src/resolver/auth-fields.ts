import path from 'path';
import type { Collection, TinaSchema } from '@tinacms/schema-tools';
import type { GraphQLResolveInfo } from 'graphql';
import { get } from '../util';
import {
  checkPasswordHash,
  generatePasswordHash,
  mapUserFields,
} from '../auth/utils';
import type { Resolver } from './index';

export async function getUserDocumentContext(
  tinaSchema: TinaSchema,
  resolver: Resolver
) {
  const collection = tinaSchema
    .getCollections()
    .find((c) => c.isAuthCollection);
  if (!collection) {
    throw new Error('Auth collection not found');
  }

  const userFields = mapUserFields(collection, ['_rawData']);
  if (!userFields.length) {
    throw new Error(`No user field found in collection ${collection.name}`);
  }
  if (userFields.length > 1) {
    throw new Error(
      `Multiple user fields found in collection ${collection.name}`
    );
  }
  const userField = userFields[0];

  const relativePath = 'index.json';
  const realPath = path.join(collection.path, relativePath);
  const userDoc = await resolver.getDocument(realPath);
  const users = get(userDoc, userField.path);
  if (!users) {
    throw new Error('No users found');
  }

  return { collection, userField, users, userDoc, relativePath };
}

export function findUserInCollection(
  users: any[],
  userField: any,
  userSub: string
) {
  const { idFieldName } = userField;
  if (!idFieldName) {
    throw new Error('No uid field found on user field');
  }
  return users.find((u) => u[idFieldName] === userSub) || null;
}

/**
 * A stored hash only carries over to a user with the same uid, so a new or
 * renamed user saved without a password could never sign in.
 */
export function assertNewUsersHavePasswords(
  collection: Collection<true>,
  newBody: Record<string, unknown>,
  existingData?: Record<string, unknown>
) {
  const userFields = mapUserFields(collection);
  if (userFields.length !== 1) {
    return;
  }
  const [{ path: usersPath, idFieldName, passwordFieldName }] = userFields;
  const users = get(newBody, usersPath);
  if (!Array.isArray(users) || !idFieldName || !passwordFieldName) {
    return;
  }
  const storedUsers = get(existingData, usersPath);
  const storedIds = new Set(
    (Array.isArray(storedUsers) ? storedUsers : []).map((u) => u?.[idFieldName])
  );
  const withoutPassword = users
    .filter(
      (u) =>
        !storedIds.has(u?.[idFieldName]) && !u?.[passwordFieldName]?.['value']
    )
    .map((u) => u?.[idFieldName]);
  if (withoutPassword.length) {
    throw new Error(`New users need a password: ${withoutPassword.join(', ')}`);
  }
}

export async function handleAuthenticate({
  tinaSchema,
  resolver,
  sub,
  password,
  ctxUser,
}: {
  tinaSchema: TinaSchema;
  resolver: Resolver;
  sub?: string;
  password: string;
  info: GraphQLResolveInfo;
  ctxUser?: { sub?: string } | null;
}): Promise<any> {
  const userSub = sub || ctxUser?.sub;
  const { userField, users } = await getUserDocumentContext(
    tinaSchema,
    resolver
  );

  const user = findUserInCollection(users, userField, userSub);
  if (!user) {
    return null;
  }

  const { passwordFieldName } = userField;
  const saltedHash = get(user, [passwordFieldName || '', 'value']);
  if (!saltedHash) {
    throw new Error('No password field found on user field');
  }

  const matches = await checkPasswordHash({
    saltedHash,
    password,
  });
  return matches ? user : null;
}

export async function handleAuthorize({
  tinaSchema,
  resolver,
  sub,
  ctxUser,
}: {
  tinaSchema: TinaSchema;
  resolver: Resolver;
  sub?: string;
  info: GraphQLResolveInfo;
  ctxUser?: { sub?: string } | null;
}): Promise<any> {
  const userSub = sub || ctxUser?.sub;
  const { userField, users } = await getUserDocumentContext(
    tinaSchema,
    resolver
  );

  const user = findUserInCollection(users, userField, userSub);
  return user ? user : null;
}

export async function handleUpdatePassword({
  tinaSchema,
  resolver,
  password,
  ctxUser,
}: {
  tinaSchema: TinaSchema;
  resolver: Resolver;
  password: string;
  info: GraphQLResolveInfo;
  ctxUser?: { sub?: string } | null;
}): Promise<boolean> {
  if (!ctxUser?.sub) {
    throw new Error('Not authorized');
  }

  if (!password) {
    throw new Error('No password provided');
  }

  const { userField, users } = await getUserDocumentContext(
    tinaSchema,
    resolver
  );

  const { idFieldName, passwordFieldName } = userField;
  if (!users.find((u: any) => u[idFieldName] === ctxUser.sub)) {
    throw new Error('Not authorized');
  }

  // Hashing is slow, so it happens before the store is read for the write
  const passwordHash = await generatePasswordHash({ password });
  await resolver.updateAuthDocumentInternal((rawData) => {
    const storedUsers = get(rawData, userField.path.slice(1)); // drop _rawData
    const user = Array.isArray(storedUsers)
      ? storedUsers.find((u: any) => u[idFieldName] === ctxUser.sub)
      : undefined;
    if (!user) {
      throw new Error('Not authorized');
    }
    user[passwordFieldName] = {
      value: passwordHash,
      passwordChangeRequired: false,
    };
    return rawData;
  });

  return true;
}
