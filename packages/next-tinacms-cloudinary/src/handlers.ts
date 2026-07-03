/**

*/

import { v2 as cloudinary } from 'cloudinary';
import type { Media, MediaListOptions } from 'tinacms';
import path from 'path';
import os from 'os';
import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { promisify } from 'util';
import { resolveKey, resolveDirectory, MediaKeyError } from './media-key';
import { safeUploadName } from './upload-filename';

export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
  authorized: (req: NextApiRequest, res: NextApiResponse) => Promise<boolean>;
}

export interface CloudinaryOptions {
  useHttps?: boolean;
}

export const mediaHandlerConfig = {
  api: {
    bodyParser: false,
  },
};

export const createMediaHandler = (
  config: CloudinaryConfig,
  options?: CloudinaryOptions
) => {
  cloudinary.config(Object.assign({ secure: true }, config));

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const isAuthorized = await config.authorized(req, res);
    // make sure the user is authorized to upload
    if (!isAuthorized) {
      res.status(401).json({ message: 'sorry this user is unauthorized' });
      return;
    }
    switch (req.method) {
      case 'GET':
        return listMedia(req, res, options);
      case 'POST':
        return uploadMedia(req, res);
      case 'DELETE':
        return deleteAsset(req, res);
      default:
        res.end(404);
    }
  };
};

async function uploadMedia(req: NextApiRequest, res: NextApiResponse) {
  const upload = promisify(
    multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, os.tmpdir());
        },
        filename: (req, file, cb) => {
          cb(null, safeUploadName(file.originalname));
        },
      }),
    }).single('file')
  );

  // @ts-ignore
  await upload(req, res);

  // @ts-ignore - multer augments the request with `file`
  if (!req.file) {
    return res.status(400).json({ message: 'file is required' });
  }

  const { directory } = req.body;
  // @ts-ignore - multer augments the request with `file`
  const filename: string = req.file.originalname;

  let folder: string;
  try {
    // Cloudinary has no mediaRoot concept yet; an empty folder (root upload)
    // is allowed, but traversal / absolute folders are rejected.
    const rawFolder = (directory || '').replace(/^\/+/, '');
    folder = rawFolder ? resolveKey('', rawFolder, { decode: false }) : '';
    // Validate the filename with the same rules. Cloudinary still derives the
    // public_id from folder + use_filename; we only reject illegal names here
    // and leave the naming model unchanged.
    resolveKey('', filename, { decode: false });
  } catch (e) {
    if (e instanceof MediaKeyError) {
      return res.status(400).json({ message: e.message });
    }
    throw e;
  }

  try {
    //@ts-ignore
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder,
      use_filename: true,
      overwrite: false,
      resource_type: 'auto',
    });

    res.json(result);
  } catch (error) {
    res.status(error.http_code).json({ message: error.message });
  }
}

async function listMedia(
  req: NextApiRequest,
  res: NextApiResponse,
  opts?: CloudinaryOptions
) {
  try {
    const mediaListOptions: MediaListOptions = {
      directory: (req.query.directory as string) || '""',
      limit: parseInt(req.query.limit as string, 10) || 500,
      offset: req.query.offset as string,
      filesOnly: req.query.filesOnly === 'true' || false,
    };

    const useRootDirectory =
      !mediaListOptions.directory ||
      mediaListOptions.directory === '/' ||
      mediaListOptions.directory === '""';

    if (!useRootDirectory) {
      try {
        // Validation only: reject upward traversal in the listing directory for
        // consistency with the other adapters. The normalised result is
        // intentionally discarded; the raw directory is still interpolated into
        // the search expression below, so this does NOT bound the listing the
        // way resolveDirectory bounds the S3/DOS prefix. Search-expression
        // escaping (SEC-5) is a separate follow-up.
        resolveDirectory(mediaListOptions.directory);
      } catch (e) {
        if (e instanceof MediaKeyError) {
          res.status(400).json({ message: e.message });
          return;
        }
        throw e;
      }
    }

    const query = useRootDirectory
      ? 'folder=""'
      : `folder="${mediaListOptions.directory}"`;

    const response = await cloudinary.search
      .expression(query)
      .max_results(mediaListOptions.limit)
      .next_cursor(mediaListOptions.offset as string)
      .execute();

    const files = response.resources.map(getCloudinaryToTinaFunc(opts));

    //@ts-ignore TODO: Open PR to cloudinary-core
    cloudinary.api.folders = (directory: string = '""') => {
      if (useRootDirectory) {
        return cloudinary.api.root_folders();
      } else {
        return cloudinary.api.sub_folders(directory);
      }
    };
    let folders: string[] = [];
    let folderRes = null;

    if (mediaListOptions.filesOnly) {
      res.json({
        items: [...files],
        offset: response.next_cursor,
      });
      return;
    }

    try {
      // @ts-ignore
      folderRes = await cloudinary.api.folders(mediaListOptions.directory);
    } catch (e) {
      // If the folder doesn't exist, just return an empty array
      if (e.error?.message.startsWith("Can't find folder with path")) {
        // ignore
      } else {
        console.error('Error getting folders');
        console.error(e);
        throw e;
      }
    }

    if (folderRes?.folders) {
      folders = folderRes.folders.map(function (folder: {
        name: string;
        path: string;
      }): Media {
        'empty-repo/004';
        return {
          id: folder.path,
          type: 'dir',
          filename: path.basename(folder.path),
          directory: path.dirname(folder.path),
        };
      });
    }

    res.json({
      items: [...folders, ...files],
      offset: response.next_cursor,
    });
  } catch (e) {
    console.log(e);
    res.status(500);
    const message = findErrorMessage(e);
    res.json({ e: message });
  }
}

/**
 * we're getting inconsistent errors in this try-catch
 * sometimes we just get a string, sometimes we get the whole response.
 * I suspect this is coming from Cloudinary SDK so let's just try to
 * normalize it into a string here.
 */
const findErrorMessage = (e: any) => {
  if (typeof e == 'string') return e;
  if (e.message) return e.message;
  if (e.error && e.error.message) return e.error.message;
  return 'an error occurred';
};

async function deleteAsset(req: NextApiRequest, res: NextApiResponse) {
  const { media } = req.query;
  const [, rawPublicId] = media as string[];

  let public_id: string;
  try {
    // The framework already decodes the route param once; decoding again here
    // would mangle keys containing a literal "%" (e.g. "100%off.png").
    public_id = resolveKey('', rawPublicId, { decode: false });
  } catch (e) {
    if (e instanceof MediaKeyError) {
      return res.status(400).json({ message: e.message });
    }
    throw e;
  }

  cloudinary.uploader.destroy(public_id, {}, (err: any) => {
    if (err) res.status(500);
    res.json({
      err,
      public_id,
    });
  });
}
function getCloudinaryToTinaFunc(opts: CloudinaryOptions) {
  return function cloudinaryToTina(file: any): Media {
    // TODO: I want to use this but it seams we might have to update our webpack config in order to do this in node
    // const useHttps = opts?.useHttps ?? true

    // Default to true
    let useHttps = true;
    if (typeof opts !== 'undefined' && typeof opts.useHttps !== 'undefined') {
      useHttps = opts.useHttps;
    }

    const sel = useHttps ? ('secure_url' as const) : ('url' as const);

    const filename = path.basename(file.public_id);
    const directory = path.dirname(file.public_id);

    return {
      id: file.public_id,
      filename,
      directory,
      src: file[sel],
      thumbnails: {
        '75x75': transformCloudinaryImage(file[sel], 'w_75,h_75,c_fit,q_auto'),
        '400x400': transformCloudinaryImage(
          file[sel],
          'w_400,h_400,c_fit,q_auto'
        ),
        '1000x1000': transformCloudinaryImage(
          file[sel],
          'w_1000,h_1000,c_fit,q_auto'
        ),
      },
      type: 'file',
    };
  };
}

function transformCloudinaryImage(
  url: string,
  transformations: string
): string {
  const parts = url.split('/image/upload/');

  if (parts.length === 2) {
    return parts[0] + '/image/upload/' + transformations + '/' + parts[1];
  }

  return url;
}
