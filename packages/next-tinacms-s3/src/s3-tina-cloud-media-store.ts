/**

*/

import { S3MediaStore } from './s3-media-store';
import type { Client } from 'tinacms';

export class TinaCloudS3MediaStore extends S3MediaStore {
  client: Client;
  constructor(client: Client) {
    super();
    this.client = client;

    const basePath = this.client.schema.config.config.build?.basePath;
    this.basePath = basePath || '';

    this.fetchFunction = async (input: RequestInfo, init?: RequestInit) => {
      try {
        const url = input.toString();
        const query = `${url.includes('?') ? '&' : '?'}clientID=${
          client.clientId
        }`;

        const res = client.authProvider.fetchWithToken(url + query, init);
        return res;
      } catch (error) {
        console.error(error);
      }
    };
  }
}
