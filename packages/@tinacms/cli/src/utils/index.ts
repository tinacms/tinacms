/**

*/

import { ChangeType } from '@graphql-inspector/core';

// this function removes the starting slash if it exists

export const parseMediaFolder = (str: string) => {
  let returnString = str;
  if (returnString.startsWith('/')) returnString = returnString.substr(1);

  if (returnString.endsWith('/'))
    returnString = returnString.substr(0, returnString.length - 1);

  return returnString;
};

// This function attempts to retrieve an FAQ link in relation to GraphQL diff errors.
export const getFaqLink = (type: ChangeType): string | null => {
  switch (type) {
    case ChangeType.FieldRemoved: {
      return 'https://tina.io/docs/r/FAQ/#2-how-do-i-resolve-the-local-graphql-schema-doesnt-match-the-remote-graphql-schema-error';
    }
    default:
      return null;
  }
};
