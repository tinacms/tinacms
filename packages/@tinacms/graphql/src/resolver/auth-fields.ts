import path from 'path';
import type { TinaSchema } from '@tinacms/schema-tools';
import type { GraphQLResolveInfo } from 'graphql';
import { get } from '../util';
import { set } from 'es-toolkit/compat';
import { checkPasswordHash, mapUserFields } from '../auth/utils';
import type { Resolver } from './index';

async function getUserDocumentContext(
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

function findUserInCollection(users: any[], userField: any, userSub: string) {
  const { idFieldName } = userField;
  if (!idFieldName) {
    throw new Error('No uid field found on user field');
  }
  return users.find((u) => u[idFieldName] === userSub) || null;
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
  ctxUser?: { sub?: string };
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
  ctxUser?: { sub?: string };
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
  ctxUser?: { sub?: string };
}): Promise<boolean> {
  if (!ctxUser?.sub) {
    throw new Error('Not authorized');
  }

  if (!password) {
    throw new Error('No password provided');
  }

  const { collection, userField, users, relativePath } =
    await getUserDocumentContext(tinaSchema, resolver);

  const { idFieldName, passwordFieldName } = userField;
  const user = users.find((u: any) => u[idFieldName] === ctxUser.sub);
  if (!user) {
    throw new Error('Not authorized');
  }

  user[passwordFieldName] = {
    value: password,
    passwordChangeRequired: false,
  };

  const newBody = {};
  set(
    newBody,
    userField.path.slice(1), // remove _rawData from users path
    users.map((u: any) => {
      if (user[idFieldName] === u[idFieldName]) {
        return user;
      }
      return {
        // don't overwrite other users' passwords
        ...u,
        [passwordFieldName]: {
          ...u[passwordFieldName],
          value: '',
        },
      };
    })
  );

  await resolver.resolveUpdateDocument({
    collectionName: collection.name,
    relativePath,
    newBody,
  });

  return true;
}
