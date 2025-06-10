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
  message: "Something went wrong fetching your media from Azure Blob Storage.",
  docsLink: "https://tina.io/docs/reference/media/external/azure"
});
const E_UNAUTHORIZED = new MediaListError({
  title: "Unauthorized",
  message: "You don't have access to this resource.",
  docsLink: "https://tina.io/docs/reference/media/external/cloudinary/#set-up-api-routes-nextjs-example"
});
const E_CONFIG = new MediaListError({
  title: "Missing Credentials",
  message: "Unable to connect to Cloudinary because one or more environment variables are missing.",
  docsLink: "https://tina.io/docs/media-cloudinary/"
});
const E_KEY_FAIL = new MediaListError({
  title: "Bad Credentials",
  message: "Unable to connect to Cloudinary because one or more environment variables are misconfigured.",
  docsLink: "https://tina.io/docs/media-cloudinary/"
});
const E_BAD_ROUTE = new MediaListError({
  title: "Bad Route",
  message: "The Cloudinary API route is missing or misconfigured.",
  docsLink: "https://tina.io/docs/reference/media/external/cloudinary/#set-up-api-routes-nextjs-example"
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
class AzureMediaStore {
  constructor(options) {
    this.fetchFunction = (input, init) => fetch(input, init);
    this.accept = DEFAULT_MEDIA_UPLOAD_TYPES;
    this.parse = (img) => {
      return img.src;
    };
    this.baseUrl = (options == null ? void 0 : options.baseUrl) || "/api/azure/media";
  }
  async persist(media) {
    const newFiles = [];
    for (const item of media) {
      const { file, directory } = item;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", directory);
      formData.append("filename", file.name);
      const res = await this.fetchFunction(this.baseUrl, {
        method: "POST",
        body: formData
      });
      if (res.status !== 200) {
        const responseData = await res.json();
        throw new Error(responseData.message);
      }
      const fileRes = await res.json();
      const parsedRes = {
        type: "file",
        id: fileRes.name,
        filename: fileRes.filename,
        directory: "/",
        thumbnails: {
          "75x75": fileRes.url,
          "400x400": fileRes.url,
          "1000x1000": fileRes.url
        },
        src: fileRes.url
      };
      newFiles.push(parsedRes);
    }
    return newFiles;
  }
  async delete(media) {
    await this.fetchFunction(
      `${this.baseUrl}/${encodeURIComponent(media.id)}`,
      {
        method: "DELETE"
      }
    );
  }
  async list(options) {
    const query = this.buildQuery(options);
    const response = await this.fetchFunction(this.baseUrl + query);
    if (response.status === 401) {
      throw E_UNAUTHORIZED;
    }
    if (response.status === 404) {
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
    const params = Object.entries(options).filter(([_, value]) => value !== "" && value !== void 0).map(([key, value]) => {
      return typeof value === "object" ? `${key}=${encodeURIComponent(JSON.stringify(value))}` : `${key}=${encodeURIComponent(String(value))}`;
    }).join("&");
    return `?${params}`;
  }
}
const createTinaCloudAzureMediaStore = (options = { baseUrl: "/api/azure/media" }) => class TinaCloudAzureMediaStore extends AzureMediaStore {
  constructor(client) {
    super(options);
    this.client = client;
    this.fetchFunction = async (input, init) => {
      try {
        const url = input.toString();
        const query = `${url.includes("?") ? "&" : "?"}clientID=${client.clientId}`;
        const res = client.authProvider.fetchWithToken(url + query, init);
        return res;
      } catch (error) {
        console.error(error);
        return new Response(null, { status: 500 });
      }
    };
  }
};
const TinaCloudAzureMediaStore = createTinaCloudAzureMediaStore();
export {
  AzureMediaStore,
  TinaCloudAzureMediaStore,
  createTinaCloudAzureMediaStore
};
