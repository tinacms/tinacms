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
var import_client_s3 = require("@aws-sdk/client-s3");
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
var import_multer = __toESM(require("multer"));
var import_util = require("util");
var mediaHandlerConfig = {
  api: {
    bodyParser: false
  }
};
var createMediaHandler = (config, options) => {
  const client = new import_client_s3.S3Client(config.config);
  const bucket = config.bucket;
  let mediaRoot = config.mediaRoot || "";
  if (mediaRoot) {
    if (!mediaRoot.endsWith("/")) {
      mediaRoot = mediaRoot + "/";
    }
    if (mediaRoot.startsWith("/")) {
      mediaRoot = mediaRoot.substr(1);
    }
  }
  let cdnUrl = options?.cdnUrl || config.config.endpoint.toString().replace(/http(s|):\/\//i, `https://${bucket}.`);
  cdnUrl = cdnUrl + (cdnUrl.endsWith("/") ? "" : "/");
  return async (req, res) => {
    const isAuthorized = await config.authorized(req, res);
    if (!isAuthorized) {
      res.status(401).json({ message: "sorry this user is unauthorized" });
      return;
    }
    switch (req.method) {
      case "GET":
        return listMedia(req, res, client, bucket, mediaRoot, cdnUrl);
      case "POST":
        return uploadMedia(req, res, client, bucket, mediaRoot, cdnUrl);
      case "DELETE":
        return deleteAsset(req, res, client, bucket);
      default:
        res.end(404);
    }
  };
};
async function uploadMedia(req, res, client, bucket, mediaRoot, cdnUrl) {
  const upload = (0, import_util.promisify)(
    (0, import_multer.default)({
      storage: import_multer.default.diskStorage({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
  let prefix = directory.replace(/^\//, "").replace(/\/$/, "");
  if (prefix) prefix = prefix + "/";
  const filePath = req.file.path;
  const fileType = req.file?.mimetype;
  const blob = import_fs.default.readFileSync(filePath);
  const filename = import_path.default.basename(filePath);
  const params = {
    Bucket: bucket,
    Key: mediaRoot ? import_path.default.join(mediaRoot, prefix + filename) : prefix + filename,
    Body: blob,
    ACL: "public-read",
    ContentType: fileType || "application/octet-stream"
  };
  const command = new import_client_s3.PutObjectCommand(params);
  try {
    const src = cdnUrl + prefix + filename;
    await client.send(command);
    res.json({
      type: "file",
      id: prefix + filename,
      filename,
      directory: prefix,
      thumbnails: {
        "75x75": src,
        "400x400": src,
        "1000x1000": src
      },
      src: cdnUrl + (mediaRoot ? import_path.default.join(mediaRoot, prefix + filename) : prefix + filename)
    });
  } catch (e) {
    console.error("Error uploading media");
    console.error(e);
    res.status(500).send(findErrorMessage(e));
  }
}
function stripMediaRoot(mediaRoot, key) {
  if (!mediaRoot) {
    return key;
  }
  const mediaRootParts = mediaRoot.split("/").filter((part) => part);
  if (!mediaRootParts || !mediaRootParts[0]) {
    return key;
  }
  const keyParts = key.split("/").filter((part) => part);
  for (let i = 0; i < mediaRootParts.length; i++) {
    if (keyParts[0] === mediaRootParts[i]) {
      keyParts.shift();
    }
  }
  return keyParts.join("/");
}
async function listMedia(req, res, client, bucket, mediaRoot, cdnUrl) {
  try {
    const {
      directory = "",
      limit = 500,
      offset
    } = req.query;
    let prefix = directory.replace(/^\//, "").replace(/\/$/, "");
    if (prefix) prefix = prefix + "/";
    const params = {
      Bucket: bucket,
      Delimiter: "/",
      Prefix: mediaRoot ? import_path.default.join(mediaRoot, prefix) : prefix,
      Marker: offset?.toString(),
      MaxKeys: directory && !offset ? +limit + 1 : +limit
    };
    const response = await client.send(new import_client_s3.ListObjectsCommand(params));
    const items = [];
    response.CommonPrefixes?.forEach(({ Prefix }) => {
      const strippedPrefix = stripMediaRoot(mediaRoot, Prefix);
      if (!strippedPrefix) {
        return;
      }
      items.push({
        id: Prefix,
        type: "dir",
        filename: import_path.default.basename(strippedPrefix),
        directory: import_path.default.dirname(strippedPrefix)
      });
    });
    items.push(
      ...(response.Contents || []).filter((file) => {
        const strippedKey = stripMediaRoot(mediaRoot, file.Key);
        return strippedKey !== prefix;
      }).map(getDOSToTinaFunc(cdnUrl, mediaRoot))
    );
    res.json({
      items,
      offset: response.NextMarker
    });
  } catch (e) {
    console.error("Error listing media");
    console.error(e);
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
async function deleteAsset(req, res, client, bucket) {
  const { media } = req.query;
  let [, objectKey] = media;
  const objectKeyIsSplit = media && media.length > 2 && typeof media !== "string";
  if (objectKeyIsSplit) {
    objectKey = media.slice(1).join("/");
  }
  const params = {
    Bucket: bucket,
    Key: objectKey
  };
  try {
    const data = await client.send(new import_client_s3.DeleteObjectCommand(params));
    res.json(data);
  } catch (err) {
    console.error("Error deleting media");
    console.error(err);
    res.status(500).json({
      message: err.message || "Something went wrong"
    });
  }
}
function getDOSToTinaFunc(cdnUrl, mediaRoot) {
  return function dosToTina(file) {
    const strippedKey = stripMediaRoot(mediaRoot, file.Key);
    const filename = import_path.default.basename(strippedKey);
    const directory = import_path.default.dirname(strippedKey) + "/";
    const src = cdnUrl + file.Key;
    return {
      id: file.Key,
      filename,
      directory,
      src,
      thumbnails: {
        "75x75": src,
        "400x400": src,
        "1000x1000": src
      },
      type: "file"
    };
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createMediaHandler,
  mediaHandlerConfig
});
