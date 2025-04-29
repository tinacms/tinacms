import type { Client } from 'tinacms';
import type { AzureMediaStoreOptions } from './azure-media-store';
import { AzureMediaStore } from './azure-media-store';

export const createTinaCloudAzureMediaStore = (
  options: AzureMediaStoreOptions = { baseUrl: '/api/azure/media' }
) =>
  class TinaCloudAzureMediaStore extends AzureMediaStore {
    client: Client;
    constructor(client: Client) {
      super(options);
      this.client = client;
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
          return new Response(null, { status: 500 });
        }
      };
    }
  };

export const TinaCloudAzureMediaStore = createTinaCloudAzureMediaStore();
