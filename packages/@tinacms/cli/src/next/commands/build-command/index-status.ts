export interface IndexStatusResponse {
  status: 'inprogress' | 'complete' | 'failed' | 'unknown';
  timestamp: number;
  error?: string;
  message?: string;
  cause?: string;
}

const failureReason = ({
  error,
  message,
  cause,
}: Pick<IndexStatusResponse, 'error' | 'message' | 'cause'>) => {
  const reason = error || message;
  // NOTE: [08 Oct 2026] EK - TinaCloud also folds the cause into `error` for CLIs that predate `cause`.
  // See https://github.com/tinacms/tinacloud/pull/3822.
  if (!cause || reason?.includes(cause)) {
    return reason;
  }
  return reason ? `${reason}\nCaused by: ${cause}` : cause;
};

export const indexFailedMessage = ({
  status,
  branch,
  ...response
}: Pick<IndexStatusResponse, 'error' | 'message' | 'cause'> & {
  status: 'failed' | 'unknown';
  branch: string;
}) => {
  const retry = `Attempting to index but responded with status '${status}'. To retry the indexing process, click the "Reindex" button for '${branch}' in the TinaCloud configuration for this project.`;
  const reason = failureReason(response);
  return reason ? `${retry}\n\n${reason}` : retry;
};
