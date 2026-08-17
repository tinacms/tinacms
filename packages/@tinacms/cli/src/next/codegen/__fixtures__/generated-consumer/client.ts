import { queries } from './types.js';

export const client = {
  queries: queries({ request: (q: string) => null }),
};
export default client;
