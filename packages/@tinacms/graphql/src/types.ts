/**

*/

export type GraphQLConfig =
  | {
      useRelativeMedia: true
    }
  | { useRelativeMedia: false; clientId: string; assetsHost: string }
