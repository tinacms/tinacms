import type { TinaSchema } from '@tinacms/schema-tools';
import type { GraphQLResolveInfo } from 'graphql';
import { get } from '../util';
import set from 'lodash.set';
import { checkPasswordHash, mapUserFields } from '../auth/utils';
import type { Resolver } from './index';

export async function handleAuthenticate({
  tinaSchema,
  resolver,
  args,
  ctxUser,
}: {
  tinaSchema: TinaSchema;
  resolver: Resolver;
  args: { sub?: string; password: string };
  info: GraphQLResolveInfo;
  ctxUser?: { sub?: string };
}): Promise<any> {
  const sub = args.sub || ctxUser?.sub;
  const collection = tinaSchema
    .getCollections()
    .find((c) => c.isAuthCollection);
  if (!collection) {
    throw new Error('Auth collection not found');
  }

  const userFields = mapUserFields(collection, ['_rawData']);
  if (!userFields.length) {
    throw new Error(
      `No user field found in collection ${collection.name}`
    );
  }
  if (userFields.length > 1) {
    throw new Error(
      `Multiple user fields found in collection ${collection.name}`
    );
  }
  const userField = userFields[0];

  const realPath = `${collection.path}/index.json`;
  const userDoc = await resolver.getDocument(realPath);
  const users = get(userDoc, userField.path);
  if (!users) {
    throw new Error('No users found');
  }
  const { idFieldName, passwordFieldName } = userField;
  if (!idFieldName) {
    throw new Error('No uid field found on user field');
  }
  const user = users.find((u) => u[idFieldName] === sub);
  if (!user) {
    return null;
  }

  const saltedHash = get(user, [passwordFieldName || '', 'value']);
  if (!saltedHash) {
    throw new Error('No password field found on user field');
  }

  const matches = await checkPasswordHash({
    saltedHash,
    password: args.password,
  });

  if (matches) {
    return user;
  }
  return null;
}

export async function handleAuthorize({
  tinaSchema,
  resolver,
  args,
  ctxUser,
}: {
  tinaSchema: TinaSchema;
  resolver: Resolver;
  args: { sub?: string };
  info: GraphQLResolveInfo;
  ctxUser?: { sub?: string };
}): Promise<any> {
  const sub = args.sub || ctxUser?.sub;
  const collection = tinaSchema
    .getCollections()
    .find((c) => c.isAuthCollection);
  if (!collection) {
    throw new Error('Auth collection not found');
  }

  const userFields = mapUserFields(collection, ['_rawData']);
  if (!userFields.length) {
    throw new Error(
      `No user field found in collection ${collection.name}`
    );
  }
  if (userFields.length > 1) {
    throw new Error(
      `Multiple user fields found in collection ${collection.name}`
    );
  }
  const userField = userFields[0];

  const realPath = `${collection.path}/index.json`;
  const userDoc = await resolver.getDocument(realPath);
  const users = get(userDoc, userField.path);
  if (!users) {
    throw new Error('No users found');
  }
  const { idFieldName } = userField;
  if (!idFieldName) {
    throw new Error('No uid field found on user field');
  }
  const user = users.find((u) => u[idFieldName] === sub);
  if (!user) {
    return null;
  }

  return user;
}

export async function handleUpdatePassword({
  tinaSchema,
  resolver,
  args,
  ctxUser,
}: {
  tinaSchema: TinaSchema;
  resolver: Resolver;
  args: { password: string };
  info: GraphQLResolveInfo;
  ctxUser?: { sub?: string };
}): Promise<boolean> {
  if (!ctxUser?.sub) {
    throw new Error('Not authorized');
  }

  if (!args.password) {
    throw new Error('No password provided');
  }

  const collection = tinaSchema
    .getCollections()
    .find((c) => c.isAuthCollection);
  if (!collection) {
    throw new Error('Auth collection not found');
  }

  const userFields = mapUserFields(collection, ['_rawData']);
  if (!userFields.length) {
    throw new Error(
      `No user field found in collection ${collection.name}`
    );
  }
  if (userFields.length > 1) {
    throw new Error(
      `Multiple user fields found in collection ${collection.name}`
    );
  }
  const userField = userFields[0];
  const realPath = `${collection.path}/index.json`;
  const userDoc = await resolver.getDocument(realPath);
  const users = get(userDoc, userField.path);
  if (!users) {
    throw new Error('No users found');
  }
  const { idFieldName, passwordFieldName } = userField;
  const user = users.find((u) => u[idFieldName] === ctxUser.sub);
  if (!user) {
    throw new Error('Not authorized');
  }

  user[passwordFieldName] = {
    value: args.password,
    passwordChangeRequired: false,
  };

  const params = {};
  set(
    params,
    userField.path.slice(1), // remove _rawData from users path
    users.map((u) => {
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

  await resolver.updateResolveDocument({
    collection,
    args: { params },
    realPath,
    isCollectionSpecific: true,
    isAddPendingDocument: false,
  });

  return true;
}