(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("tinacms")) : typeof define === "function" && define.amd ? define(["exports", "tinacms"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global["next-tinacms-s3"] = {}, global.NOOP));
})(this, function(exports2, tinacms) {
  "use strict";
  class MediaListError extends Error {
    constructor(config) {
      super(config.message);
      this.ERR_TYPE = "MediaListError";
      this.title = config.title;
      this.docsLink = config.docsLink;
    }
  }
  const E_DEFAULT = new MediaListError({
    title: "An Error Occurred",
    message: "Something went wrong fetching your media from S3.",
    docsLink: "https://tina.io/packages/next-tinacms-s3"
  });
  const E_UNAUTHORIZED = new MediaListError({
    title: "Unauthorized",
    message: "You don't have access to this resource.",
    docsLink: "https://tina.io/packages/next-tinacms-s3"
  });
  const E_CONFIG = new MediaListError({
    title: "Missing Credentials",
    message: "Unable to connect to S3 because one or more environment variables are missing.",
    docsLink: "https://tina.io/docs/media-s3/"
  });
  const E_KEY_FAIL = new MediaListError({
    title: "Bad Credentials",
    message: "Unable to connect to S3 because one or more environment variables are misconfigured.",
    docsLink: "https://tina.io/docs/media-s3/"
  });
  const E_BAD_ROUTE = new MediaListError({
    title: "Bad Route",
    message: "The S3 API route is missing or misconfigured.",
    docsLink: "https://tina.io/packages/next-tinacms-s3/#set-up-api-routes"
  });
  const interpretErrorMessage = (message) => {
    switch (message) {
      case "Must supply cloud_name":
      case "Must supply api_key":
      case "Must supply api_secret":
        return E_CONFIG;
      case "unknown api_key":
        return E_KEY_FAIL;
      default:
        return E_DEFAULT;
    }
  };
  const s3ErrorRegex = /<Error>.*<Code>(.+)<\/Code>.*<Message>(.+)<\/Message>.*/;
  class S3MediaStore {
    constructor() {
      this.fetchFunction = (input, init) => {
        return fetch(input, init);
      };
      this.accept = tinacms.DEFAULT_MEDIA_UPLOAD_TYPES;
      this.basePath = "";
      this.parse = (img) => {
        return img.src;
      };
    }
    fetchWithBasePath(path, init) {
      const fullPath = this.getFullPath(path);
      const normalizedPath = fullPath.startsWith("/") ? fullPath : `/${fullPath}`;
      return this.fetchFunction(normalizedPath, init);
    }
    getFullPath(path) {
      return `${this.basePath}${path}`;
    }
    async persist(media) {
      const newFiles = [];
      for (const item of media) {
        let directory = item.directory;
        if (directory == null ? void 0 : directory.endsWith("/")) {
          directory = directory.substr(0, directory.length - 1);
        }
        const path = `${directory && directory !== "/" ? `${directory}/${item.file.name}` : item.file.name}`;
        const res = await this.fetchWithBasePath(
          `/api/s3/media/upload_url?key=${path}`,
          {
            method: "GET"
          }
        );
        if (res.status != 200) {
          const responseData = await res.json();
          throw new Error(responseData.message);
        }
        const { signedUrl, src } = await res.json();
        if (!signedUrl || !src) {
          throw new Error("Unexpected error generating upload url");
        }
        const uploadRes = await fetch(signedUrl, {
          method: "PUT",
          body: item.file,
          headers: {
            "Content-Type": item.file.type || "application/octet-stream"
          }
        });
        if (!uploadRes.ok) {
          const xmlRes = await uploadRes.text();
          const matches = s3ErrorRegex.exec(xmlRes);
          console.error(xmlRes);
          if (!matches) {
            throw new Error("Unexpected error uploading media asset");
          } else {
            throw new Error(`Upload error: '${matches[2]}'`);
          }
        }
        await new Promise((resolve) => {
          setTimeout(resolve, 2e3);
        });
        newFiles.push({
          directory: item.directory,
          filename: item.file.name,
          id: item.file.name,
          type: "file",
          thumbnails: {
            "75x75": src,
            "400x400": src,
            "1000x1000": src
          },
          src
        });
      }
      return newFiles;
    }
    async delete(media) {
      await this.fetchWithBasePath(
        `/api/s3/media/${encodeURIComponent(media.id)}`,
        {
          method: "DELETE"
        }
      );
    }
    async list(options) {
      const query = this.buildQuery(options);
      const response = await this.fetchWithBasePath("/api/s3/media" + query);
      if (response.status == 401) {
        throw E_UNAUTHORIZED;
      }
      if (response.status == 404) {
        throw E_BAD_ROUTE;
      }
      if (response.status >= 500) {
        const { e } = await response.json();
        const error = interpretErrorMessage(e);
        throw error;
      }
      const { items, offset } = await response.json();
      return {
        items: items.map((item) => item),
        nextOffset: offset
      };
    }
    buildQuery(options) {
      const params = Object.keys(options).filter((key) => options[key] !== "" && options[key] !== void 0).map((key) => `${key}=${options[key]}`).join("&");
      return `?${params}`;
    }
  }
  class TinaCloudS3MediaStore extends S3MediaStore {
    constructor(client) {
      var _a;
      super();
      this.client = client;
      const basePath = (_a = this.client.schema.config.config.build) == null ? void 0 : _a.basePath;
      this.basePath = basePath || "";
      this.fetchFunction = async (input, init) => {
        try {
          const url = input.toString();
          const query = `${url.includes("?") ? "&" : "?"}clientID=${client.clientId}`;
          const res = client.authProvider.fetchWithToken(url + query, init);
          return res;
        } catch (error) {
          console.error(error);
        }
      };
    }
  }
  exports2.S3MediaStore = S3MediaStore;
  exports2.TinaCloudS3MediaStore = TinaCloudS3MediaStore;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
