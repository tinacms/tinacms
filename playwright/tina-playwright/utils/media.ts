import { APIRequestContext, APIResponse } from "@playwright/test";

// Helpers for the media routes served by the Vite dev server:
//   POST   /media/upload/<path>   (multipart)
//   GET    /media/list/<folder>
//   DELETE /media/<path>
//   POST   /media/rename          (JSON { from, to })
//
// Paths are URL-encoded so exotic inputs (../, null bytes) survive client-side
// normalisation — the server decodes and validates. Pass `rawPath: true` for
// vectors that are already percent-encoded.

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

// `from`/`to` are media-root-relative paths and travel in a JSON body, so no
// path encoding is involved.
export function renameMedia(
  apiContext: APIRequestContext,
  from: string,
  to: string
): Promise<APIResponse> {
  return apiContext.post(`/media/rename`, { data: { from, to } });
}

export function deleteMedia(
  apiContext: APIRequestContext,
  relativePath: string,
  opts: RequestOpts = {}
): Promise<APIResponse> {
  return apiContext.delete(`/media/${encodeMediaPath(relativePath, opts.rawPath)}`);
}
