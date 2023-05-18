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
      // TODO this should be handled in the client
      let q
      const parts = query.split(' ')
      if (parts.length === 1) {
        q = { AND: [parts[0]] }
      } else {
        // TODO only allow AND for now - need parser
        q = { AND: parts.filter((part) => part.toLowerCase() !== 'and') }
      }

      const result = await searchIndex.QUERY(q, options)
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
