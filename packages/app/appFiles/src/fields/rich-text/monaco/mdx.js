var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value))
      } catch (e) {
        reject(e)
      }
    }
    var rejected = (value) => {
      try {
        step(generator.throw(value))
      } catch (e) {
        reject(e)
      }
    }
    var step = (x) =>
      x.done
        ? resolve(x.value)
        : Promise.resolve(x.value).then(fulfilled, rejected)
    step((generator = generator.apply(__this, __arguments)).next())
  })
}

// ../../next-tinacms-cloudinary/src/errors.ts
var MediaListError = class extends Error {
  constructor(config) {
    super(config.message)
    this.ERR_TYPE = 'MediaListError'
    this.title = config.title
    this.docsLink = config.docsLink
  }
}
var E_DEFAULT = new MediaListError({
  title: 'An Error Occurred',
  message: 'Something went wrong fetching your media from Cloudinary.',
  docsLink: 'https://tina.io/packages/next-tinacms-cloudinary',
})
var E_UNAUTHORIZED = new MediaListError({
  title: 'Unauthorized',
  message: "You don't have access to this resource.",
  docsLink: 'https://tina.io/packages/next-tinacms-cloudinary',
})
var E_CONFIG = new MediaListError({
  title: 'Missing Credentials',
  message:
    'Unable to connect to Cloudinary because one or more environment variables are missing.',
  docsLink: 'https://tina.io/docs/media-cloudinary/',
})
var E_KEY_FAIL = new MediaListError({
  title: 'Bad Credentials',
  message:
    'Unable to connect to Cloudinary because one or more environment variables are misconfigured.',
  docsLink: 'https://tina.io/docs/media-cloudinary/',
})
var E_BAD_ROUTE = new MediaListError({
  title: 'Bad Route',
  message: 'The Cloudinary API route is missing or misconfigured.',
  docsLink:
    'https://tina.io/packages/next-tinacms-cloudinary/#set-up-api-routes',
})
var interpretErrorMessage = (message) => {
  switch (message) {
    case 'Must supply cloud_name':
    case 'Must supply api_key':
    case 'Must supply api_secret':
      return E_CONFIG
    case 'unknown api_key':
      return E_KEY_FAIL
    default:
      return E_DEFAULT
  }
}

// ../../next-tinacms-cloudinary/src/cloudinary-media-store.ts
var CloudinaryMediaStore = class {
  constructor() {
    this.fetchFunction = (input, init) => {
      return fetch(input, init)
    }
    this.accept = 'text/*,  application/*, image/*'
    this.previewSrc = (publicId) => {
      if (typeof publicId === 'string') return publicId
      return publicId.previewSrc
    }
    this.parse = (img) => {
      return img.previewSrc
    }
  }
  persist(media) {
    return __async(this, null, function* () {
      let newFiles = []
      for (const item of media) {
        const { file, directory } = item
        const formData = new FormData()
        formData.append('file', file)
        formData.append('directory', directory)
        formData.append('filename', file.name)
        const res = yield this.fetchFunction(`/api/cloudinary/media`, {
          method: 'POST',
          body: formData,
        })
        if (res.status != 200) {
          const responseData = yield res.json()
          throw new Error(responseData.message)
        }
        const fileRes = yield res.json()
        yield new Promise((resolve) => {
          setTimeout(resolve, 2e3)
        })
        const parsedRes = {
          type: 'file',
          id: fileRes.public_id,
          filename: fileRes.original_filename,
          directory: '/',
          previewSrc: fileRes.url,
        }
        newFiles.push(parsedRes)
      }
      return newFiles
    })
  }
  delete(media) {
    return __async(this, null, function* () {
      yield this.fetchFunction(
        `/api/cloudinary/media/${encodeURIComponent(media.id)}`,
        {
          method: 'DELETE',
        }
      )
    })
  }
  list(options) {
    return __async(this, null, function* () {
      const query = this.buildQuery(options)
      const response = yield this.fetchFunction('/api/cloudinary/media' + query)
      if (response.status == 401) {
        throw E_UNAUTHORIZED
      }
      if (response.status == 404) {
        throw E_BAD_ROUTE
      }
      if (response.status >= 500) {
        const { e } = yield response.json()
        const error = interpretErrorMessage(e)
        throw error
      }
      const { items, offset } = yield response.json()
      return {
        items: items.map((item) => item),
        nextOffset: offset,
      }
    })
  }
  buildQuery(options) {
    const params = Object.keys(options)
      .filter((key) => options[key] !== '' && options[key] !== void 0)
      .map((key) => `${key}=${options[key]}`)
      .join('&')
    return `?${params}`
  }
}

// ../../next-tinacms-cloudinary/src/cloudinary-tina-cloud-media-store.ts
var TinaCloudCloudinaryMediaStore = class extends CloudinaryMediaStore {
  constructor(client) {
    super()
    this.client = client
    this.fetchFunction = (input, init) =>
      __async(this, null, function* () {
        try {
          const url = input.toString()
          const query = `${url.includes('?') ? '&' : '?'}clientID=${
            client.clientId
          }`
          const res = client.fetchWithToken(url + query, init)
          return res
        } catch (error) {
          console.error(error)
        }
      })
  }
}
export { CloudinaryMediaStore, TinaCloudCloudinaryMediaStore }
