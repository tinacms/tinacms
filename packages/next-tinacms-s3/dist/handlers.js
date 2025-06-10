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
  getUploadUrl: () => getUploadUrl,
  mediaHandlerConfig: () => mediaHandlerConfig
});
module.exports = __toCommonJS(handlers_exports);
var import_client_s3 = require("@aws-sdk/client-s3");
var import_s3_request_presigner = require("@aws-sdk/s3-request-presigner");
var import_node_path = __toESM(require("node:path"));
var mediaHandlerConfig = {
  api: {
    bodyParser: false
  }
};
var createMediaHandler = (config, options) => {
  const client = new import_client_s3.S3Client(config.config);
  const bucket = config.bucket;
  const region = config.config.region || "us-east-1";
  let mediaRoot = config.mediaRoot || "";
  if (mediaRoot) {
    if (!mediaRoot.endsWith("/")) {
      mediaRoot = mediaRoot + "/";
    }
    if (mediaRoot.startsWith("/")) {
      mediaRoot = mediaRoot.substr(1);
    }
  }
  const endpoint = config.config.endpoint || `https://s3.${region}.amazonaws.com`;
  let cdnUrl = options?.cdnUrl || endpoint.toString().replace(/http(s|):\/\//i, `https://${bucket}.`);
  cdnUrl = cdnUrl + (cdnUrl.endsWith("/") ? "" : "/");
  return async (req, res) => {
    const isAuthorized = await config.authorized(req, res);
    if (!isAuthorized) {
      res.status(401).json({ message: "sorry this user is unauthorized" });
      return;
    }
    switch (req.method) {
      case "GET":
        if (req.query.key) {
          const expiresIn = req.query.expiresIn && Number(req.query.expiresIn) || 3600;
          const s3_key = req.query.key ? Array.isArray(req.query.key) ? req.query.key[0] : req.query.key : null;
          if (!s3_key) {
            return res.status(400).json({ message: "key is required" });
          }
          if (await keyExists(client, bucket, s3_key)) {
            return res.status(400).json({ message: "key already exists" });
          }
          const signedUrl = await getUploadUrl(
            bucket,
            s3_key,
            expiresIn,
            client
          );
          return res.json({ signedUrl, src: cdnUrl + s3_key });
        }
        return listMedia(req, res, client, bucket, mediaRoot, cdnUrl);
      case "DELETE":
        return deleteAsset(req, res, client, bucket);
      default:
        res.end(404);
    }
  };
};
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
      Prefix: mediaRoot ? import_node_path.default.join(mediaRoot, prefix) : prefix,
      Marker: offset?.toString(),
      MaxKeys: directory && !offset ? +limit + 1 : +limit
    };
    const command = new import_client_s3.ListObjectsCommand(params);
    const response = await client.send(command);
    const items = [];
    response.CommonPrefixes?.forEach(({ Prefix }) => {
      const strippedPrefix = stripMediaRoot(mediaRoot, Prefix);
      if (!strippedPrefix) {
        return;
      }
      items.push({
        id: Prefix,
        type: "dir",
        filename: import_node_path.default.basename(strippedPrefix),
        directory: import_node_path.default.dirname(strippedPrefix)
      });
    });
    items.push(
      ...(response.Contents || []).filter((file) => {
        const strippedKey = stripMediaRoot(mediaRoot, file.Key);
        return strippedKey !== prefix;
      }).map(getS3ToTinaFunc(cdnUrl, mediaRoot))
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
  const [, objectKey] = media;
  const params = {
    Bucket: bucket,
    Key: objectKey
  };
  const command = new import_client_s3.DeleteObjectCommand(params);
  try {
    const data = await client.send(command);
    res.json(data);
  } catch (e) {
    console.error("Error deleting media");
    console.error(e);
    res.status(500);
    const message = findErrorMessage(e);
    res.json({ e: message });
  }
}
async function keyExists(client, bucket, key) {
  try {
    const cmd = new import_client_s3.HeadObjectCommand({
      Bucket: bucket,
      Key: key
    });
    const output = await client.send(cmd);
    return output && output.$metadata.httpStatusCode === 200;
  } catch (error) {
    if (error.$metadata?.httpStatusCode === 404) {
      return false;
    } else if (error.$metadata?.httpStatusCode === 403) {
      return false;
    } else {
      throw new Error("unexpected error checking if key exists");
    }
  }
}
var getUploadUrl = async (bucket, key, expiresIn, client) => {
  return (0, import_s3_request_presigner.getSignedUrl)(
    client,
    new import_client_s3.PutObjectCommand({
      Bucket: bucket,
      Key: key
    }),
    { expiresIn }
  );
};
function getS3ToTinaFunc(cdnUrl, mediaRoot) {
  return function s3ToTina(file) {
    const strippedKey = stripMediaRoot(mediaRoot, file.Key);
    const filename = import_node_path.default.basename(strippedKey);
    const directory = import_node_path.default.dirname(strippedKey) + "/";
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
  getUploadUrl,
  mediaHandlerConfig
});
