export interface PathConfig {
  apiURL: string;
  searchPath: string;
}

export const createSearchIndexRouter = ({
  config,
  searchIndex,
}: {
  config: PathConfig;
  searchIndex: any;
}) => {
  const put = async (req, res) => {
    const { docs } = req.body as { docs: Record<string, any>[] };
    const result = await searchIndex.PUT(docs);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ result }));
  };

  const get = async (req, res) => {
    const requestURL = new URL(req.url, config.apiURL);
    const query = requestURL.searchParams.get('q');
    const optionsParam = requestURL.searchParams.get('options');
    const fuzzyParam = requestURL.searchParams.get('fuzzy');
    const fuzzyOptionsParam = requestURL.searchParams.get('fuzzyOptions');

    let options = {
      DOCUMENTS: false,
    };
    if (optionsParam) {
      options = {
        ...options,
        ...JSON.parse(optionsParam),
      };
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });

    if (query) {
      const queryObj = JSON.parse(query);

      if (fuzzyParam === 'true' && searchIndex.fuzzySearchWrapper) {
        try {
          const fuzzyOptions = fuzzyOptionsParam
            ? JSON.parse(fuzzyOptionsParam)
            : {};

          const searchTerms = queryObj.AND
            ? queryObj.AND.filter((term) => !term.includes('_collection:'))
            : [];

          const result = await searchIndex.fuzzySearchWrapper.query(
            searchTerms.join(' '),
            {
              ...options,
              fuzzy: true,
              fuzzyOptions,
            }
          );

          const collectionFilter = queryObj.AND?.find((term) =>
            term.includes('_collection:')
          );

          if (collectionFilter) {
            const collection = collectionFilter.split(':')[1];
            result.results = result.results.filter(
              (r) => r._id && r._id.startsWith(`${collection}:`)
            );
            result.total = result.results.length;
          }

          res.end(
            JSON.stringify({
              RESULT: result.results,
              RESULT_LENGTH: result.total,
              FUZZY_MATCHES: result.fuzzyMatches || {},
            })
          );
          return;
        } catch (error) {
          // Fall through to standard search on error
        }
      }

      const result = await searchIndex.QUERY(queryObj, options);
      res.end(JSON.stringify(result));
    } else {
      res.end(JSON.stringify({ RESULT: [] }));
    }
  };

  const del = async (req, res) => {
    const requestURL = new URL(req.url, config.apiURL);
    const docId = requestURL.pathname
      .split('/')
      .filter(Boolean)
      .slice(1)
      .join('/');
    const result = await searchIndex.DELETE(docId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ result }));
  };

  return { del, get, put };
};
