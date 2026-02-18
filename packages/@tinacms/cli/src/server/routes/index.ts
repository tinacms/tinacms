/**

*/

import { join } from 'path';
import { Router } from 'express';
import multer from 'multer';
import { PathTraversalError, assertPathWithinBase } from '../../utils/path';
import { MediaModel, PathConfig } from '../models/media';

export const createMediaRouter = (config: PathConfig): Router => {
  const mediaFolder = join(
    config.rootPath,
    config.publicFolder,
    config.mediaRoot
  );
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, mediaFolder);
    },
    filename: function (req, _file, cb) {
      const file = req.params[0];
      try {
        // Validate that the filename doesn't escape mediaFolder.
        // assertPathWithinBase returns the resolved absolute path, but multer
        // concatenates destination + filename via path.join internally, so we
        // need to pass only the relative portion back. We validate here and
        // pass the original relative name; multer will join it with the
        // already-validated destination.
        assertPathWithinBase(file, mediaFolder);
      } catch (error) {
        return cb(error, undefined);
      }
      cb(null, file);
    },
  });

  const upload = multer({ storage });
  const uploadRoute = upload.single('file');

  const mediaModel = new MediaModel(config);

  const mediaRouter = Router();

  mediaRouter.get('/list/*', async (req, res) => {
    try {
      const folder = req.params[0];
      const cursor = req.query.cursor as string;
      const limit = req.query.limit as string;
      const media = await mediaModel.listMedia({
        searchPath: folder,
        cursor,
        limit,
      });
      res.json(media);
    } catch (error) {
      if (error instanceof PathTraversalError) {
        res.status(403).json({ error: error.message });
        return;
      }
      throw error;
    }
  });

  mediaRouter.delete('/*', async (req, res) => {
    try {
      const file = req.params[0];
      const didDelete = await mediaModel.deleteMedia({ searchPath: file });
      res.json(didDelete);
    } catch (error) {
      if (error instanceof PathTraversalError) {
        res.status(403).json({ error: error.message });
        return;
      }
      throw error;
    }
  });

  mediaRouter.post('/upload/*', async function (req, res) {
    // do it this way for better error handling
    await uploadRoute(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ message: err.message });
        // A Multer error occurred when uploading.
      } else if (err) {
        // An unknown error occurred when uploading.
        res.status(500).json({ message: err.message });
      } else {
        res.json({ success: true });
      }
    });
  });

  return mediaRouter;
};
