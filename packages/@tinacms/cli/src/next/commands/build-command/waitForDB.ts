import { type Config, parseURL } from '@tinacms/schema-tools';
import Progress from 'progress';

import { logger } from '../../../logger';
import { sleepAndCallFunc } from '../../../utils/sleep';
import { spin } from '../../../utils/spinner';
import { logText } from '../../../utils/theme';

const POLLING_INTERVAL = 5000;

const STATUS_INPROGRESS = 'inprogress';
const STATUS_COMPLETE = 'complete';
const STATUS_FAILED = 'failed';

export interface IndexStatusResponse {
  status: 'inprogress' | 'complete' | 'failed' | 'unknown';
  timestamp: number;
  error?: string;
}

class IndexFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IndexFailedError';
  }
}

export const waitForDB = async (
  config: Config<true>,
  apiUrl: string,
  previewName?: string,
  verbose?: boolean
) => {
  const token = config.token;
  const { clientId, branch, isLocalClient, host } = parseURL(apiUrl);

  // Can't check status if we're not using TinaCloud
  if (isLocalClient || !host || !clientId || !branch) {
    if (verbose) {
      logger.info(logText('Not using TinaCloud, skipping DB check'));
    }
    return;
  }

  const bar = new Progress(
    'Checking indexing process in TinaCloud... :prog',
    1
  );

  const pollForStatus = async () => {
    try {
      if (verbose) {
        logger.info(logText('Polling for status...'));
      }
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');

      if (token) {
        headers.append('X-API-KEY', token);
      }

      const response = await fetch(
        `https://${host}/db/${clientId}/status/${previewName || branch}`,
        {
          method: 'GET',
          headers,
          cache: 'no-cache',
        }
      );
      const { status, error } = (await response.json()) as IndexStatusResponse;

      const statusMessage = `Indexing status: '${status}'`;

      // Index Complete
      if (status === STATUS_COMPLETE) {
        bar.tick({
          prog: '✅',
        });

        // Index Inprogress
      } else if (status === STATUS_INPROGRESS) {
        if (verbose) {
          logger.info(logText(`${statusMessage}, trying again in 5 seconds`));
        }
        await sleepAndCallFunc({ fn: pollForStatus, ms: POLLING_INTERVAL });

        // Index Failed
      } else if (status === STATUS_FAILED) {
        throw new IndexFailedError(
          `Attempting to index but responded with status 'failed'. To retry the indexing process, click the "Reindex" button for '${
            previewName || branch
          }' in the TinaCloud configuration for this project.  ${error}`
        );

        // Index Unknown
      } else {
        throw new IndexFailedError(
          `Attempting to index but responded with status 'unknown'. To retry the indexing process, click the "Reindex" button for '${
            previewName || branch
          }' in the TinaCloud configuration for this project.  ${error}`
        );
      }
    } catch (e) {
      if (e instanceof IndexFailedError) {
        bar.tick({
          prog: '❌',
        });
        throw e;
      } else {
        throw new Error(
          `Unable to query DB for indexing status, encountered error: ${e.message}`
        );
      }
    }
  };

  await spin({
    text: 'Checking indexing process in TinaCloud...',
    waitFor: pollForStatus,
  });
};
