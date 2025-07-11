import { z } from 'zod';

//@ts-ignore can't locate BranchChangeEvent
import { BranchChangeEvent, BranchData, EventBus } from '@tinacms/toolkit';
import {
  DocumentNode,
  GraphQLSchema,
  buildClientSchema,
  getIntrospectionQuery,
  parse,
  print,
} from 'graphql';
import { TokenObject } from '../auth/authenticate';

import {
  AuthProvider,
  Schema,
  TinaSchema,
  addNamespaceToSchema,
} from '@tinacms/schema-tools';
import {
  SearchClient,
  optionsToSearchIndexOptions,
  parseSearchIndexResponse,
  queryToSearchIndexQuery,
} from '@tinacms/search/dist/index-client';
import gql from 'graphql-tag';
import { EDITORIAL_WORKFLOW_STATUS } from '../toolkit/form-builder/editorial-workflow-constants';
import { AsyncData, asyncPoll } from './asyncPoll';
import { LocalAuthProvider, TinaCloudAuthProvider } from './authProvider';
import { TinaCloudProject } from './types';

export * from './authProvider';

export type OnLoginFunc = (args: { token?: TokenObject }) => Promise<void>;

export type TinaIOConfig = {
  assetsApiUrlOverride?: string; // https://assets.tinajs.io
  frontendUrlOverride?: string; // https://app.tina.io
  identityApiUrlOverride?: string; // https://identity.tinajs.io
  contentApiUrlOverride?: string; // https://content.tinajs.io
};
interface ServerOptions {
  schema?: Schema;
  clientId: string;
  branch: string;
  tinaGraphQLVersion: string;
  customContentApiUrl?: string;
  getTokenFn?: () => Promise<TokenObject>;
  tinaioConfig?: TinaIOConfig;
  tokenStorage?: 'MEMORY' | 'LOCAL_STORAGE' | 'CUSTOM';
}

const captureBranchName = /^refs\/heads\/(.*)/;
const parseRefForBranchName = (ref: string) => {
  const matches = ref.match(captureBranchName);
  return matches[1];
};

const ListBranchResponse = z
  .object({
    name: z.string(),
    protected: z.boolean().optional().default(false),
    githubPullRequestUrl: z.string().optional(),
  })
  .array()
  .nonempty();

const IndexStatusResponse = z.object({
  status: z
    .union([
      z.literal('complete'),
      z.literal('unknown'),
      z.literal('failed'),
      z.literal('inprogress'),
    ])
    .optional(),
  timestamp: z.number().optional(),
});

export class Client {
  authProvider: AuthProvider;
  onLogin?: OnLoginFunc;
  onLogout?: () => Promise<void>;
  frontendUrl: string;
  contentApiUrl: string;
  identityApiUrl: string;
  assetsApiUrl: string;
  gqlSchema: GraphQLSchema;
  schema?: TinaSchema;
  clientId: string;
  contentApiBase: string;
  tinaGraphQLVersion: string;
  branch: string;
  private options: ServerOptions;
  events = new EventBus(); // automatically hooked into global event bus when attached via cms.
  protectedBranches: string[] = [];
  usingEditorialWorkflow: boolean = false;

  constructor({ tokenStorage = 'MEMORY', ...options }: ServerOptions) {
    this.tinaGraphQLVersion = options.tinaGraphQLVersion;
    this.onLogin =
      options.schema?.config?.admin?.authHooks?.onLogin ||
      options.schema?.config?.admin?.auth?.onLogin;
    this.onLogout =
      options.schema?.config?.admin?.authHooks?.onLogout ||
      options.schema?.config?.admin?.auth?.onLogout;

    if (options.schema) {
      const enrichedSchema = new TinaSchema({
        version: { fullVersion: '', major: '', minor: '', patch: '' },
        meta: { flags: [] },
        ...addNamespaceToSchema({ ...options.schema }, []),
      });
      this.schema = enrichedSchema;
    }
    this.options = options;

    if (options.schema?.config?.contentApiUrlOverride) {
      this.options.customContentApiUrl =
        options.schema.config.contentApiUrlOverride;
    }
    this.setBranch(options.branch);
    this.events.subscribe<BranchChangeEvent>(
      'branch:change',
      ({ branchName }) => {
        this.setBranch(branchName);
      }
    );
    this.clientId = options.clientId;

    // TODO: auth provider should be dynamically passed in
    // TODO: update auth provider whenever the clientID or url change
    this.authProvider =
      this.schema?.config?.config?.authProvider ||
      new TinaCloudAuthProvider({
        clientId: options.clientId,
        identityApiUrl: this.identityApiUrl,
        getTokenFn: options.getTokenFn,
        tokenStorage: tokenStorage,
        frontendUrl: this.frontendUrl,
      });
  }

  public get isLocalMode() {
    return false;
  }

  public get isCustomContentApi() {
    return !!this.options.customContentApiUrl;
  }

  setBranch(branchName: string) {
    const encodedBranch = encodeURIComponent(branchName);
    // When we change our branch, we add the 'x-branch' cookie. This is used when you change branches and want to use content from the new branch.
    // This is then used in the TinaClient to fetch the correct content from the correct branch. Instead of defaulting to the 'main' branch which is generated at build time.
    document.cookie = `x-branch=${encodedBranch}; path=/; max-age=3600`;
    this.branch = encodedBranch;
    this.assetsApiUrl =
      this.options.tinaioConfig?.assetsApiUrlOverride ||
      'https://assets.tinajs.io';
    this.frontendUrl =
      this.options.tinaioConfig?.frontendUrlOverride || 'https://app.tina.io';
    this.identityApiUrl =
      this.options.tinaioConfig?.identityApiUrlOverride ||
      'https://identity.tinajs.io';
    this.contentApiBase =
      this.options.tinaioConfig?.contentApiUrlOverride ||
      `https://content.tinajs.io`;

    this.contentApiUrl =
      this.options.customContentApiUrl ||
      `${this.contentApiBase}/${this.tinaGraphQLVersion}/content/${this.options.clientId}/github/${encodedBranch}`;
    if (this.authProvider instanceof TinaCloudAuthProvider) {
      this.authProvider.identityApiUrl = this.identityApiUrl;
      this.authProvider.frontendUrl = this.frontendUrl;
    }
  }

  getBranch() {
    return this.branch;
  }

  addPendingContent = async (props) => {
    const mutation = `#graphql
mutation addPendingDocumentMutation(
  $relativePath: String!
  $collection: String!
  $template: String
) {
  addPendingDocument(
    relativePath: $relativePath
    template: $template
    collection: $collection
  ) {
    ... on Document {
      _sys {
        relativePath
        path
        breadcrumbs
        collection {
          slug
        }
      }
    }
  }
}`;
    const result = await this.request(mutation, {
      variables: props,
    });
    // TODO: fix this type
    return result as any;
  };

  getSchema = async () => {
    if (!this.gqlSchema) {
      const data = await this.request<any>(getIntrospectionQuery(), {
        variables: {},
      });

      this.gqlSchema = buildClientSchema(data);
    }

    return this.gqlSchema;
  };

  /**
   *
   * Returns a version of the query with fragments inlined. Eg.
   * ```graphql
   * {
   *   getPostDocument(relativePath: "") {
   *     data {
   *       ...PostFragment
   *     }
   *   }
   * }
   *
   * fragment PostFragment on Post {
   *   title
   * }
   * ```
   * Turns into
   * ```graphql
   * {
   *   getPostDocument(relativePath: "") {
   *     data {
   *       title
   *     }
   *   }
   * }
   */
  getOptimizedQuery = async (documentNode: DocumentNode) => {
    const data = await this.request<any>(
      `query GetOptimizedQuery($queryString: String!) {
        getOptimizedQuery(queryString: $queryString)
      }`,
      {
        variables: { queryString: print(documentNode) },
      }
    );
    return parse(data.getOptimizedQuery);
  };

  async request<ReturnType>(
    query: ((gqlTag: typeof gql) => DocumentNode) | string,
    { variables }: { variables: object }
  ): Promise<ReturnType> {
    const token = await this.authProvider.getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token?.id_token) {
      headers['Authorization'] = 'Bearer ' + token?.id_token;
    }
    const res = await fetch(this.contentApiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: typeof query === 'function' ? print(query(gql)) : query,
        variables,
      }),
    });

    if (res.status !== 200) {
      let errorMessage = `Unable to complete request, ${res.statusText}`;
      const resBody = await res.json();
      if (resBody.message) {
        errorMessage = `${errorMessage}, Response: ${resBody.message}`;
      }
      if (!this.isCustomContentApi) {
        errorMessage = `${errorMessage}, Please check that the following information is correct: \n\tclientId: ${this.options.clientId}\n\tbranch: ${this.branch}.`;
        if (this.branch !== 'main') {
          errorMessage = `${errorMessage}\n\tNote: This error can occur if the branch does not exist on GitHub or on TinaCloud`;
        }
      }

      throw new Error(errorMessage);
    }

    const json = await res.json();
    if (json.errors) {
      throw new Error(
        `Unable to fetch, errors: \n\t${json.errors
          .map((error) => error.message)
          .join('\n')}`
      );
    }

    return json.data as ReturnType;
  }

  get appDashboardLink() {
    return `${this.frontendUrl}/projects/${this.clientId}`;
  }

  async checkSyncStatus({
    assetsSyncing,
  }: {
    assetsSyncing: string[];
  }): Promise<{ assetsSyncing: string[] }> {
    const res = await this.authProvider.fetchWithToken(
      `${this.assetsApiUrl}/v1/${this.clientId}/syncStatus`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assetsSyncing: assetsSyncing }),
      }
    );
    const jsonRes = await res.json();
    return jsonRes;
  }

  async getProject() {
    const res = await this.authProvider.fetchWithToken(
      `${this.identityApiUrl}/v2/apps/${this.clientId}`,
      {
        method: 'GET',
      }
    );
    const val = await res.json();
    return val as TinaCloudProject;
  }

  async getRequestStatus(requestId: string): Promise<{
    error: boolean;
    message?: string;
  }> {
    const res = await this.authProvider.fetchWithToken(
      `${this.contentApiBase}/request-status/${this.clientId}/${requestId}`,
      {
        method: 'GET',
      }
    );
    const val = await res.json();
    return val;
  }

  async createPullRequest({
    baseBranch,
    branch,
    title,
  }: {
    baseBranch: string;
    branch: string;
    title: string;
  }) {
    const url = `${this.contentApiBase}/github/${this.clientId}/create_pull_request`;

    try {
      const res = await this.authProvider.fetchWithToken(url, {
        method: 'POST',
        body: JSON.stringify({
          baseBranch,
          branch,
          title,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error(
          `There was an error creating a new branch. ${res.statusText}`
        );
      }
      const values = await res.json();
      return values;
    } catch (error) {
      console.error('There was an error creating a new branch.', error);
      throw error;
    }
  }

  async fetchEvents(
    limit?: number,
    cursor?: string
  ): Promise<{
    events: {
      message: string;
      timestamp: number;
      id: string;
      isError: boolean;
      isGlobal: boolean;
    }[];
    cursor?: string;
  }> {
    if (this.isLocalMode) {
      return {
        events: [],
      };
    } else {
      return (
        await this.authProvider.fetchWithToken(
          `${this.contentApiBase}/events/${this.clientId}/${
            this.branch
          }?limit=${limit || 1}${cursor ? `&cursor=${cursor}` : ''}`,
          { method: 'GET' }
        )
      ).json();
    }
  }

  async getBillingState() {
    if (!this.clientId) {
      return null;
    }

    const url = `${this.identityApiUrl}/v2/apps/${this.clientId}/billing/state`;

    try {
      const res = await this.authProvider.fetchWithToken(url, {
        method: 'GET',
      });
      const val = await res.json();
      if (!res.status.toString().startsWith('2')) {
        console.error(val.error);
        return null;
      }
      return {
        clientId: val.clientId || this.clientId,
        delinquencyDate: val.delinquencyDate,
        billingState: val.billingState,
      } as {
        clientId: string;
        delinquencyDate: number;
        billingState: 'current' | 'late' | 'delinquent';
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  waitForIndexStatus({ ref }: { ref: string }) {
    let unknownCount = 0;
    try {
      const [prom, cancel] = asyncPoll(
        async (): Promise<AsyncData<any>> => {
          try {
            const result = await this.getIndexStatus({ ref });
            if (
              !(result.status === 'inprogress' || result.status === 'unknown')
            ) {
              return Promise.resolve({
                done: true,
                data: result,
              });
            } else {
              if (result.status === 'unknown') {
                unknownCount++;
                if (unknownCount > 5) {
                  throw new Error(
                    'AsyncPoller: status unknown for too long, please check indexing progress the TinaCloud dashboard'
                  );
                }
              }
              return Promise.resolve({
                done: false,
              });
            }
          } catch (err) {
            return Promise.reject(err);
          }
        },
        // interval is 5s
        5000, // interval
        //  timeout is 15 min
        900000 // timeout
      );
      return [prom, cancel];
    } catch (error) {
      if (error.message === 'AsyncPoller: reached timeout') {
        console.warn(error);
        return [Promise.resolve({ status: 'timeout' }), () => {}];
      }
      throw error;
    }
  }

  async getIndexStatus({ ref }: { ref: string }) {
    const url = `${this.contentApiBase}/db/${this.clientId}/status/${ref}`;
    const res = await this.authProvider.fetchWithToken(url);
    const result = await res.json();
    const parsedResult = IndexStatusResponse.parse(result);
    return parsedResult;
  }

  async listBranches(args?: { includeIndexStatus?: boolean }) {
    try {
      const url = `${this.contentApiBase}/github/${this.clientId}/list_branches`;
      const res = await this.authProvider.fetchWithToken(url, {
        method: 'GET',
      });
      const branches = await res.json();
      const parsedBranches = await ListBranchResponse.parseAsync(branches);
      if (args?.includeIndexStatus === false) {
        return parsedBranches;
      }
      const indexStatusPromises = parsedBranches.map(async (branch) => {
        const indexStatus = await this.getIndexStatus({ ref: branch.name });
        return {
          ...branch,
          indexStatus,
        };
      });
      this.protectedBranches = parsedBranches
        .filter((x) => x.protected)
        .map((x) => x.name);
      const indexStatus = await Promise.all(indexStatusPromises);

      return indexStatus;
    } catch (error) {
      console.error('There was an error listing branches.', error);
      throw error;
    }
  }
  usingProtectedBranch() {
    return (
      this.usingEditorialWorkflow &&
      this.protectedBranches?.includes(this.branch)
    );
  }
  async createBranch({ baseBranch, branchName }: BranchData) {
    const url = `${this.contentApiBase}/github/${this.clientId}/create_branch`;

    try {
      const res = await this.authProvider.fetchWithToken(url, {
        method: 'POST',
        body: JSON.stringify({
          baseBranch,
          branchName,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        console.error('There was an error creating a new branch.');
        const error = await res.json();
        throw new Error(error?.message);
      }
      const values = await res.json();
      return parseRefForBranchName(values.data.ref);
    } catch (error) {
      console.error('There was an error creating a new branch.', error);
      throw error;
    }
  }

  async getLatestVersion(): Promise<LatestVersionResponse> {
    // needs to point at production content api as self hosted doesn't have this endpoint
    const url = 'https://content.tinajs.io/latest-version';

    try {
      const res = await fetch(url, {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch latest version: ${res.statusText}`);
      }

      const data = await res.json();
      return data as LatestVersionResponse;
    } catch (error) {
      console.error('Error fetching latest version:', error);
      throw error;
    }
  }

  /**
   * Initiate and poll for the results of an editorial workflow operation
   *
   * @param options Editorial workflow options
   * @returns Object with branch and PR info when complete
   */
  async executeEditorialWorkflow(options: {
    branchName: string;
    baseBranch: string;
    prTitle?: string;
    graphQLContentOp?: {
      query: string;
      variables: Record<string, unknown>;
    };
    onStatusUpdate?: (status: { status: string; message?: string }) => void;
  }) {
    const url = `${this.contentApiBase}/editorial-workflow/${this.clientId}`;

    try {
      const res = await this.authProvider.fetchWithToken(url, {
        method: 'POST',
        body: JSON.stringify({
          branchName: options.branchName,
          baseBranch: options.baseBranch,
          prTitle: options.prTitle,
          graphQLContentOp: options.graphQLContentOp,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseBody = await res.json();

      if (!res.ok) {
        console.error('There was an error starting editorial workflow.');
        throw new Error(
          responseBody?.message || 'Failed to start editorial workflow'
        );
      }

      const requestId = responseBody.requestId;

      if (!requestId) {
        return responseBody;
      }

      if (options.onStatusUpdate) {
        options.onStatusUpdate({
          status: EDITORIAL_WORKFLOW_STATUS.QUEUED,
          message: 'Workflow queued, starting...',
        });
      }

      const maxAttempts = 60;
      const pollInterval = 5000;
      let attempts = 0;

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        attempts++;

        const statusUrl = `${this.contentApiBase}/editorial-workflow/${this.clientId}/status/${requestId}`;
        const statusResponse =
          await this.authProvider.fetchWithToken(statusUrl);

        if (!statusResponse.ok) {
          throw new Error(
            `Failed to check workflow status: ${statusResponse.statusText}`
          );
        }

        const statusResponseBody = await statusResponse.json();

        if (options.onStatusUpdate) {
          options.onStatusUpdate({
            status: statusResponseBody.status,
            message:
              statusResponseBody.message ||
              `Status: ${statusResponseBody.status}`,
          });
        }

        // Only on 200 OK status, return the response
        if (statusResponse.status === 200) {
          return {
            branchName: statusResponseBody.branchName,
            pullRequestUrl: statusResponseBody.pullRequestUrl,
          };
        }

        if (!statusResponse.ok) {
          throw new Error(
            statusResponseBody.message || 'Editorial workflow failed'
          );
        }
      }

      throw new Error('Editorial workflow timed out after 5 minutes');
    } catch (error) {
      console.error(
        'There was an error with editorial workflow operation.',
        error
      );
      throw error;
    }
  }
}

export const DEFAULT_LOCAL_TINA_GQL_SERVER_URL =
  'http://localhost:4001/graphql';

export class LocalClient extends Client {
  constructor(
    props?: {
      customContentApiUrl?: string;
      schema?: Schema;
    } & Omit<ServerOptions, 'clientId' | 'branch' | 'tinaGraphQLVersion'>
  ) {
    const clientProps = {
      ...props,
      clientId: '',
      branch: '',
      tinaGraphQLVersion: '',
      customContentApiUrl:
        props && props.customContentApiUrl
          ? props.customContentApiUrl
          : DEFAULT_LOCAL_TINA_GQL_SERVER_URL,
    };
    super(clientProps);
    // use whatever auth provider is passed in, or default to local auth provider
    this.authProvider =
      this.schema?.config?.config?.authProvider || new LocalAuthProvider();
  }
  public get isLocalMode() {
    return true;
  }
}

export class TinaCMSSearchClient implements SearchClient {
  constructor(
    private client: Client,
    private tinaSearchConfig?: { stopwordLanguages?: string[] }
  ) {}
  async query(
    query: string,
    options?: {
      limit?: number;
      cursor?: string;
    }
  ): Promise<{
    results: any[];
    nextCursor: string | null;
    total: number;
    prevCursor: string | null;
  }> {
    const q = queryToSearchIndexQuery(
      query,
      this.tinaSearchConfig?.stopwordLanguages
    );
    const opt = optionsToSearchIndexOptions(options);
    const optionsParam = opt['PAGE'] ? `&options=${JSON.stringify(opt)}` : '';
    const res = await this.client.authProvider.fetchWithToken(
      `${this.client.contentApiBase}/searchIndex/${
        this.client.clientId
      }/${this.client.getBranch()}?q=${JSON.stringify(q)}${optionsParam}`
    );
    return parseSearchIndexResponse(await res.json(), options);
  }

  async del(ids: string[]): Promise<any> {
    const res = await this.client.authProvider.fetchWithToken(
      `${this.client.contentApiBase}/searchIndex/${
        this.client.clientId
      }/${this.client.getBranch()}?ids=${ids.join(',')}`,
      {
        method: 'DELETE',
      }
    );
    if (res.status !== 200) {
      throw new Error('Failed to update search index');
    }
  }

  async put(docs: any[]): Promise<any> {
    // TODO should only be called if search is enabled and supportsClientSideIndexing is true
    const res = await this.client.authProvider.fetchWithToken(
      `${this.client.contentApiBase}/searchIndex/${
        this.client.clientId
      }/${this.client.getBranch()}`,
      {
        method: 'POST',
        body: JSON.stringify({ docs }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (res.status !== 200) {
      throw new Error('Failed to update search index');
    }
  }

  supportsClientSideIndexing(): boolean {
    return true;
  }
}

export class LocalSearchClient implements SearchClient {
  constructor(private client: Client) {}
  async query(
    query: string,
    options?: {
      limit?: number;
      cursor?: string;
    }
  ): Promise<{
    results: any[];
    nextCursor: string | null;
    total: number;
    prevCursor: string | null;
  }> {
    const q = queryToSearchIndexQuery(query);
    const opt = optionsToSearchIndexOptions(options);
    const optionsParam = opt['PAGE'] ? `&options=${JSON.stringify(opt)}` : '';
    const res = await this.client.authProvider.fetchWithToken(
      `http://localhost:4001/searchIndex?q=${JSON.stringify(q)}${optionsParam}`
    );
    return parseSearchIndexResponse(await res.json(), options);
  }

  del(ids: string[]): Promise<any> {
    return Promise.resolve(undefined);
  }

  put(docs: any[]): Promise<any> {
    return Promise.resolve(undefined);
  }

  supportsClientSideIndexing(): boolean {
    // chokidar will keep index updated
    return false;
  }
}

export type PackageVersionInfo = {
  version: string;
  publishedAt: string;
};

export type LatestVersionResponse = Record<string, PackageVersionInfo>;
