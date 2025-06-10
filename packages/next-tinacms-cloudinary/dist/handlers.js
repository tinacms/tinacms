var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/handlers.ts
var handlers_exports = {};
__export(handlers_exports, {
  createMediaHandler: () => createMediaHandler,
  mediaHandlerConfig: () => mediaHandlerConfig
});
module.exports = __toCommonJS(handlers_exports);
var import_cloudinary = require("cloudinary");
var import_path = __toESM(require("path"));
var import_multer = __toESM(require("multer"));
var import_util = require("util");
var mediaHandlerConfig = {
  api: {
    bodyParser: false
  }
};
var createMediaHandler = (config, options) => {
  import_cloudinary.v2.config(Object.assign({ secure: true }, config));
  return async (req, res) => {
    const isAuthorized = await config.authorized(req, res);
    if (!isAuthorized) {
      res.status(401).json({ message: "sorry this user is unauthorized" });
      return;
    }
    switch (req.method) {
      case "GET":
        return listMedia(req, res, options);
      case "POST":
        return uploadMedia(req, res);
      case "DELETE":
        return deleteAsset(req, res);
      default:
        res.end(404);
    }
  };
};
async function uploadMedia(req, res) {
  const upload = (0, import_util.promisify)(
    (0, import_multer.default)({
      storage: import_multer.default.diskStorage({
        // @ts-ignore
        directory: (req2, file, cb) => {
          cb(null, "/tmp");
        },
        filename: (req2, file, cb) => {
          cb(null, file.originalname);
        }
      })
    }).single("file")
  );
  await upload(req, res);
  const { directory } = req.body;
  try {
    const result = await import_cloudinary.v2.uploader.upload(req.file.path, {
      folder: directory.replace(/^\//, ""),
      use_filename: true,
      overwrite: false,
      resource_type: "auto"
    });
    res.json(result);
  } catch (error) {
    res.status(error.http_code).json({ message: error.message });
  }
}
async function listMedia(req, res, opts) {
  try {
    const mediaListOptions = {
      directory: req.query.directory || '""',
      limit: parseInt(req.query.limit, 10) || 500,
      offset: req.query.offset,
      filesOnly: req.query.filesOnly === "true" || false
    };
    const useRootDirectory = !mediaListOptions.directory || mediaListOptions.directory === "/" || mediaListOptions.directory === '""';
    const query = useRootDirectory ? 'folder=""' : `folder="${mediaListOptions.directory}"`;
    const response = await import_cloudinary.v2.search.expression(query).max_results(mediaListOptions.limit).next_cursor(mediaListOptions.offset).execute();
    const files = response.resources.map(getCloudinaryToTinaFunc(opts));
    import_cloudinary.v2.api.folders = (directory = '""') => {
      if (useRootDirectory) {
        return import_cloudinary.v2.api.root_folders();
      } else {
        return import_cloudinary.v2.api.sub_folders(directory);
      }
    };
    let folders = [];
    let folderRes = null;
    if (mediaListOptions.filesOnly) {
      res.json({
        items: [...files],
        offset: response.next_cursor
      });
      return;
    }
    try {
      folderRes = await import_cloudinary.v2.api.folders(mediaListOptions.directory);
    } catch (e) {
      if (e.error?.message.startsWith("Can't find folder with path")) {
      } else {
        console.error("Error getting folders");
        console.error(e);
        throw e;
      }
    }
    if (folderRes?.folders) {
      folders = folderRes.folders.map(function(folder) {
        "empty-repo/004";
        return {
          id: folder.path,
          type: "dir",
          filename: import_path.default.basename(folder.path),
          directory: import_path.default.dirname(folder.path)
        };
      });
    }
    res.json({
      items: [...folders, ...files],
      offset: response.next_cursor
    });
  } catch (e) {
    console.log(e);
    res.status(500);
    const message = findErrorMessage(e);
    res.json({ e: message });
  }
}
var findErrorMessage = (e) => {
  if (typeof e == "string") return e;
  if (e.message) return e.message;
  if (e.error && e.error.message) return e.error.message;
  return "an error occurred";
};
async function deleteAsset(req, res) {
  const { media } = req.query;
  const [, public_id] = media;
  import_cloudinary.v2.uploader.destroy(public_id, {}, (err) => {
    if (err) res.status(500);
    res.json({
      err,
      public_id
    });
  });
}
function getCloudinaryToTinaFunc(opts) {
  return function cloudinaryToTina(file) {
    let useHttps = true;
    if (typeof opts !== "undefined" && typeof opts.useHttps !== "undefined") {
      useHttps = opts.useHttps;
    }
    const sel = useHttps ? "secure_url" : "url";
    const filename = import_path.default.basename(file.public_id);
    const directory = import_path.default.dirname(file.public_id);
    return {
      id: file.public_id,
      filename,
      directory,
      src: file[sel],
      thumbnails: {
        "75x75": transformCloudinaryImage(file[sel], "w_75,h_75,c_fit,q_auto"),
        "400x400": transformCloudinaryImage(
          file[sel],
          "w_400,h_400,c_fit,q_auto"
        ),
        "1000x1000": transformCloudinaryImage(
          file[sel],
          "w_1000,h_1000,c_fit,q_auto"
        )
      },
      type: "file"
    };
  };
}
function transformCloudinaryImage(url, transformations) {
  const parts = url.split("/image/upload/");
  if (parts.length === 2) {
    return parts[0] + "/image/upload/" + transformations + "/" + parts[1];
  }
  return url;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createMediaHandler,
  mediaHandlerConfig
});
