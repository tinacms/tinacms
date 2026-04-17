import { APIRequestContext, APIResponse } from "@playwright/test";

// Media HTTP routes exposed by the Vite dev server:
//   POST   /media/upload/<relativePath>   (multipart)
//   GET    /media/list/<folder>
//   DELETE /media/<relativePath>
//
// The path segment is URL-encoded so that exotic inputs (../, null bytes,
// backslashes) survive client-side URL normalisation and reach the server
// verbatim — the server then runs decodeURIComponent and validates.
// Pass `rawPath: true` to send the path unencoded, which is required for
// vectors that are already percent-encoded (they test the double-decode path).

export type RequestOpts = { rawPath?: boolean };

export const encodeMediaPath = (relativePath: string, rawPath?: boolean) =>
  rawPath ? relativePath : encodeURIComponent(relativePath);

export function uploadMedia(
  apiContext: APIRequestContext,
  relativePath: string,
  buffer: Buffer,
  opts: RequestOpts & { mimeType?: string } = {}
): Promise<APIResponse> {
  const filename = relativePath.split("/").pop() ?? relativePath;
  return apiContext.post(
    `/media/upload/${encodeMediaPath(relativePath, opts.rawPath)}`,
    {
      multipart: {
        file: {
          name: filename,
          mimeType: opts.mimeType ?? "text/plain",
          buffer,
        },
      },
    }
  );
}

export async function listMedia(
  apiContext: APIRequestContext,
  folder = ""
): Promise<{
  files: Array<{ src: string; filename: string; size: number }>;
  directories: string[];
  cursor?: string;
}> {
  const resp = await apiContext.get(`/media/list/${folder}`);
  return resp.json();
}

export function deleteMedia(
  apiContext: APIRequestContext,
  relativePath: string,
  opts: RequestOpts = {}
): Promise<APIResponse> {
  return apiContext.delete(`/media/${encodeMediaPath(relativePath, opts.rawPath)}`);
}
