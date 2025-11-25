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

      // Handle fuzzy search if enabled
      if (fuzzyParam === 'true' && searchIndex.fuzzySearchWrapper) {
        try {
          const fuzzyOptions = fuzzyOptionsParam
            ? JSON.parse(fuzzyOptionsParam)
            : {};

          // Extract search terms (non-collection filters)
          const searchTerms = queryObj.AND
            ? queryObj.AND.filter((term) => !term.includes('_collection:'))
            : [];

          const searchQuery = searchTerms.join(' ');

          console.log('[Fuzzy Search] Query:', searchQuery);
          console.log('[Fuzzy Search] Options:', fuzzyOptions);

          const result = await searchIndex.fuzzySearchWrapper.query(
            searchQuery,
            {
              ...options,
              fuzzy: true,
              fuzzyOptions,
            }
          );

          console.log(
            '[Fuzzy Search] Raw results:',
            result.results?.length || 0
          );
          console.log('[Fuzzy Search] Sample result:', result.results?.[0]);
          console.log('[Fuzzy Search] Fuzzy matches:', result.fuzzyMatches);

          // Filter results by collection if needed
          const collectionFilter = queryObj.AND
            ? queryObj.AND.find((term) => term.includes('_collection:'))
            : null;
          if (collectionFilter) {
            const collection = collectionFilter.split(':')[1];
            console.log('[Fuzzy Search] Filtering by collection:', collection);
            const originalLength = result.results.length;
            result.results = result.results.filter((r) => {
              // Check if _id contains the collection
              const hasCollection = r._id && r._id.startsWith(`${collection}:`);
              console.log(
                `[Fuzzy Search] Checking result ${r._id}: ${hasCollection}`
              );
              return hasCollection;
            });
            result.total = result.results.length;
            console.log(
              `[Fuzzy Search] Filtered ${originalLength} -> ${result.total} results`
            );
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
          console.error(
            'Fuzzy search failed, falling back to standard search:',
            error
          );
          // Fall through to standard search
        }
      }

      // Standard search
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
