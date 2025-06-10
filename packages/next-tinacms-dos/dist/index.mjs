import { DEFAULT_MEDIA_UPLOAD_TYPES } from "tinacms";
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
  message: "Something went wrong fetching your media from Digital Ocean Space.",
  docsLink: "https://tina.io/packages/next-tinacms-dos"
});
const E_UNAUTHORIZED = new MediaListError({
  title: "Unauthorized",
  message: "You don't have access to this resource.",
  docsLink: "https://tina.io/packages/next-tinacms-dos"
});
const E_CONFIG = new MediaListError({
  title: "Missing Credentials",
  message: "Unable to connect to Digital Ocean Space because one or more environment variables are missing.",
  docsLink: "https://tina.io/docs/media-dos/"
});
const E_KEY_FAIL = new MediaListError({
  title: "Bad Credentials",
  message: "Unable to connect to Digital Ocean Space because one or more environment variables are misconfigured.",
  docsLink: "https://tina.io/docs/media-dos/"
});
const E_BAD_ROUTE = new MediaListError({
  title: "Bad Route",
  message: "The Digital Ocean Space API route is missing or misconfigured.",
  docsLink: "https://tina.io/packages/next-tinacms-dos/#set-up-api-routes"
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
class DOSMediaStore {
  constructor() {
    this.fetchFunction = (input, init) => {
      return fetch(input, init);
    };
    this.accept = DEFAULT_MEDIA_UPLOAD_TYPES;
    this.parse = (img) => {
      return img.src;
    };
  }
  async persist(media) {
    const newFiles = [];
    for (const item of media) {
      const { file, directory } = item;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", directory);
      formData.append("filename", file.name);
      const res = await this.fetchFunction(`/api/dos/media`, {
        method: "POST",
        body: formData
      });
      if (res.status != 200) {
        const responseData = await res.json();
        throw new Error(responseData.message);
      }
      const fileRes = await res.json();
      await new Promise((resolve) => {
        setTimeout(resolve, 2e3);
      });
      newFiles.push(fileRes);
    }
    return newFiles;
  }
  async delete(media) {
    await this.fetchFunction(`/api/dos/media/${encodeURIComponent(media.id)}`, {
      method: "DELETE"
    });
  }
  async list(options) {
    const query = this.buildQuery(options);
    const response = await this.fetchFunction("/api/dos/media" + query);
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
class TinaCloudDOSMediaStore extends DOSMediaStore {
  constructor(client) {
    super();
    this.client = client;
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
export {
  DOSMediaStore,
  TinaCloudDOSMediaStore
};
