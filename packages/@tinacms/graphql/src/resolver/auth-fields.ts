import type { TinaSchema } from '@tinacms/schema-tools';
import { randomBytes } from 'crypto';
import { set } from 'es-toolkit/compat';
import type { GraphQLResolveInfo } from 'graphql';
import path from 'path';
import {
  checkPasswordHash,
  generatePasswordHash,
  mapUserFields,
} from '../auth/utils';
import { get } from '../util';
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

function withoutPasswordValue(user: any, userField: any) {
  const { passwordFieldName } = userField;
  if (!passwordFieldName) {
    return user;
  }
  return {
    ...user,
    [passwordFieldName]: {
      passwordChangeRequired:
        user[passwordFieldName]?.passwordChangeRequired ?? false,
    },
  };
}

let dummyPasswordHash: Promise<string> | undefined;

const getDummyPasswordHash = () => {
  dummyPasswordHash ??= generatePasswordHash({
    password: randomBytes(32).toString('hex'),
  });
  return dummyPasswordHash;
};

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
  if (ctxUser !== undefined) {
    return null;
  }

  const { userField, users } = await getUserDocumentContext(
    tinaSchema,
    resolver
  );

  const user = sub ? findUserInCollection(users, userField, sub) : null;
  const { passwordFieldName } = userField;
  const saltedHash = user
    ? get(user, [passwordFieldName || '', 'value'])
    : undefined;
  if (!saltedHash) {
    // Run one hash check for each sign-in, also when there is no stored hash.
    await checkPasswordHash({
      saltedHash: await getDummyPasswordHash(),
      password: password ?? '',
    });
    return null;
  }

  const matches = await checkPasswordHash({
    saltedHash,
    password,
  });
  return matches ? withoutPasswordValue(user, userField) : null;
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
  return user ? withoutPasswordValue(user, userField) : null;
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

  await resolver.updateAuthDocument({ newBody });

  return true;
}
