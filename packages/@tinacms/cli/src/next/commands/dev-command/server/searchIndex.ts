export interface PathConfig {
  apiURL: string
  searchPath: string
}

export const createSearchIndexRouter = ({
  config,
  searchIndex,
}: {
  config: PathConfig
  searchIndex: any
}) => {
  const put = async (req, res) => {
    const { docs } = req.body as { docs: Record<string, any>[] }
    const result = await searchIndex.PUT(docs)
    res.end(JSON.stringify({ result }))
  }

  const get = async (req, res) => {
    const requestURL = new URL(req.url, config.apiURL)
    const query = requestURL.searchParams.get('q')
    const optionsParam = requestURL.searchParams.get('options')
    let options = {
      DOCUMENTS: false,
    }
    if (optionsParam) {
      options = {
        ...options,
        ...JSON.parse(optionsParam),
      }
    }
    if (query) {
      const result = await searchIndex.QUERY(JSON.parse(query), options)
      res.end(JSON.stringify(result))
    } else {
      // TODO do we need this anymore?
      const docId = requestURL.pathname
        .split('/')
        .filter(Boolean)
        .slice(1)
        .join('/')
      const result = await searchIndex.DOCUMENTS(docId)
      res.end(JSON.stringify(result))
    }
  }

  const del = async (req, res) => {
    const requestURL = new URL(req.url, config.apiURL)
    const docId = requestURL.pathname
      .split('/')
      .filter(Boolean)
      .slice(1)
      .join('/')
    const result = await searchIndex.DELETE(docId)
    res.end(JSON.stringify({ result }))
  }

  return { del, get, put }
}
