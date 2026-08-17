/**

*/

export type GraphQLConfig =
  | {
      useRelativeMedia: true;
    }
  | {
      useRelativeMedia: false;
      clientId: string;
      assetsHost: string;
      branch?: string;
      mediaBranch?: string;
    };
