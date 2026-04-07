import { Client, LocalClient } from './index';
import {
  EDITORIAL_WORKFLOW_ERROR,
  EDITORIAL_WORKFLOW_STATUS,
  EditorialWorkflowErrorDetails,
} from '../toolkit/form-builder/editorial-workflow-constants';

const makeResponse = ({
  status,
  body,
  statusText = '',
}: {
  status: number;
  body: Record<string, unknown>;
  statusText?: string;
}) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: vi.fn().mockResolvedValue(body),
  }) as any;

describe('Tina Client', () => {
  describe('With localhost contentAPI URL', () => {
    let client: Client;

    beforeEach(() => {
      client = new LocalClient();
    });
    it('sets isLocalMode', () => {
      expect(client.isLocalMode).toEqual(true);
    });
  });

  describe('With prod contentAPI URL', () => {
    let client: Client;

    beforeEach(() => {
      client = new Client({
        clientId: '',
        branch: 'main',
        tokenStorage: 'LOCAL_STORAGE',
        customContentApiUrl: 'http://tina.io/fakeURL',
        tinaGraphQLVersion: '1.1',
      });
    });
    it('sets isLocalMode to false', () => {
      expect(client.isLocalMode).toEqual(false);
    });
  });

  describe('executeEditorialWorkflow', () => {
    let client: Client;
    let fetchWithToken: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.spyOn(console, 'error').mockImplementation(() => {});
      client = new Client({
        clientId: 'client-id',
        branch: 'main',
        tokenStorage: 'MEMORY',
        customContentApiUrl: 'http://tina.io/fakeURL',
        tinaGraphQLVersion: '1.1',
      });
      fetchWithToken = vi.fn();
      client.authProvider = {
        fetchWithToken,
      } as any;
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('preserves startup workflow errors from the API', async () => {
      fetchWithToken.mockResolvedValueOnce(
        makeResponse({
          status: 400,
          body: {
            message: 'Branch name validation failed',
            errorCode: EDITORIAL_WORKFLOW_ERROR.VALIDATION_FAILED,
          },
          statusText: 'Bad Request',
        })
      );

      await expect(
        client.executeEditorialWorkflow({
          branchName: 'feature/test',
          baseBranch: 'main',
        })
      ).rejects.toMatchObject({
        message: 'Branch name validation failed',
        errorCode: EDITORIAL_WORKFLOW_ERROR.VALIDATION_FAILED,
      });
    });

    it('polls until the workflow completes', async () => {
      const onStatusUpdate = vi.fn();

      fetchWithToken
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: { requestId: 'req-123' },
          })
        )
        .mockResolvedValueOnce(
          makeResponse({
            status: 202,
            body: {
              status: EDITORIAL_WORKFLOW_STATUS.CREATING_BRANCH,
              message: 'Creating branch...',
            },
          })
        )
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: {
              status: EDITORIAL_WORKFLOW_STATUS.COMPLETE,
              branchName: 'feature/test',
              pullRequestUrl: 'https://github.com/tinacms/tinacms/pull/1',
            },
          })
        );

      const promise = client.executeEditorialWorkflow({
        branchName: 'feature/test',
        baseBranch: 'main',
        onStatusUpdate,
      });

      await vi.advanceTimersByTimeAsync(10000);

      await expect(promise).resolves.toEqual({
        branchName: 'feature/test',
        pullRequestUrl: 'https://github.com/tinacms/tinacms/pull/1',
      });

      expect(onStatusUpdate).toHaveBeenNthCalledWith(1, {
        status: EDITORIAL_WORKFLOW_STATUS.QUEUED,
        message: 'Workflow queued, starting...',
      });
      expect(onStatusUpdate).toHaveBeenNthCalledWith(2, {
        status: EDITORIAL_WORKFLOW_STATUS.CREATING_BRANCH,
        message: 'Creating branch...',
      });
      expect(onStatusUpdate).toHaveBeenNthCalledWith(3, {
        status: EDITORIAL_WORKFLOW_STATUS.COMPLETE,
        message: `Status: ${EDITORIAL_WORKFLOW_STATUS.COMPLETE}`,
      });
    });

    it('fails fast on unexpected polling statuses', async () => {
      fetchWithToken
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: { requestId: 'req-123' },
          })
        )
        .mockResolvedValueOnce(
          makeResponse({
            status: 404,
            body: { message: 'Request not found' },
            statusText: 'Not Found',
          })
        );

      const promise = client.executeEditorialWorkflow({
        branchName: 'feature/test',
        baseBranch: 'main',
      });
      const rejection = expect(promise).rejects.toMatchObject({
        message: 'Request not found',
        errorCode: 'WORKFLOW_STATUS_FAILED',
      } satisfies Partial<EditorialWorkflowErrorDetails>);

      await vi.advanceTimersByTimeAsync(5000);

      await rejection;

      expect(fetchWithToken).toHaveBeenCalledTimes(2);
    });

    it('detects error status in polling response body', async () => {
      fetchWithToken
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: { requestId: 'req-123' },
          })
        )
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: {
              status: EDITORIAL_WORKFLOW_STATUS.ERROR,
              message:
                'Could not complete editorial workflow because your GitHub authoring connection needs attention.',
            },
          })
        );

      const promise = client.executeEditorialWorkflow({
        branchName: 'feature/test',
        baseBranch: 'main',
      });
      const rejection = expect(promise).rejects.toMatchObject({
        message:
          'Could not complete editorial workflow because your GitHub authoring connection needs attention.',
        errorCode: 'WORKFLOW_FAILED',
      });

      await vi.advanceTimersByTimeAsync(5000);

      await rejection;
    });

    it('detects error status in HTTP 500 polling response', async () => {
      fetchWithToken
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: { requestId: 'req-123' },
          })
        )
        .mockResolvedValueOnce(
          makeResponse({
            status: 500,
            body: {
              status: EDITORIAL_WORKFLOW_STATUS.ERROR,
              message: 'Indexing failed',
              errorCode: 'WORKFLOW_FAILED',
            },
          })
        );

      const promise = client.executeEditorialWorkflow({
        branchName: 'feature/test',
        baseBranch: 'main',
      });
      const rejection = expect(promise).rejects.toMatchObject({
        message: 'Indexing failed',
        errorCode: 'WORKFLOW_FAILED',
      });

      await vi.advanceTimersByTimeAsync(5000);

      await rejection;
    });

    it('retries transient polling failures', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      fetchWithToken
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: { requestId: 'req-123' },
          })
        )
        .mockRejectedValueOnce(new Error('network issue'))
        .mockResolvedValueOnce(
          makeResponse({
            status: 202,
            body: {
              status: EDITORIAL_WORKFLOW_STATUS.CREATING_PR,
              message: 'Creating PR...',
            },
          })
        )
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: {
              status: EDITORIAL_WORKFLOW_STATUS.COMPLETE,
              branchName: 'feature/test',
              pullRequestUrl: 'https://github.com/tinacms/tinacms/pull/2',
            },
          })
        );

      const promise = client.executeEditorialWorkflow({
        branchName: 'feature/test',
        baseBranch: 'main',
      });

      await vi.advanceTimersByTimeAsync(15000);

      await expect(promise).resolves.toEqual({
        branchName: 'feature/test',
        pullRequestUrl: 'https://github.com/tinacms/tinacms/pull/2',
      });

      expect(fetchWithToken).toHaveBeenCalledTimes(4);
      expect(warnSpy).toHaveBeenCalledOnce();
    });
  });
});
