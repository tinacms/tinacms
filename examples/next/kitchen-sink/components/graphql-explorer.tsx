'use client';

import { useState } from 'react';
import { BiPlay, BiRefresh } from 'react-icons/bi';

export const EXAMPLE_QUERY = `query PostsQuery {
  postConnection {
    edges {
      node {
        id
        title
        date
        excerpt
        author {
          ... on Author {
            name
          }
        }
      }
    }
  }
}`;

const INTROSPECTION_QUERY = `{
  __schema {
    types {
      name
      description
      kind
    }
  }
}`;

interface ExecutionResult {
  data?: any;
  errors?: Array<{ message: string }>;
}

export function GraphQLExplorer() {
  const [query, setQuery] = useState(EXAMPLE_QUERY);
  const [variables, setVariables] = useState('{}');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseTab, setResponseTab] = useState<'data' | 'raw'>('data');

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let parsedVariables = {};
      if (variables.trim() && variables.trim() !== '{}') {
        parsedVariables = JSON.parse(variables);
      }

      const response = await fetch('/api/gql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: parsedVariables,
        }),
      });

      const data = await response.json();
      setResult(data);

      if (!response.ok) {
        setError(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setQuery(EXAMPLE_QUERY);
    setVariables('{}');
    setResult(null);
  };

  const loadIntrospection = () => {
    setQuery(INTROSPECTION_QUERY);
    setVariables('{}');
    setResult(null);
  };

  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className='rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg'>
      {/* Header */}
      <div className='bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4'>
        <h3 className='text-lg font-bold mb-3'>GraphQL Explorer</h3>
        <div className='flex flex-wrap gap-2'>
          <button
            onClick={loadExample}
            className='text-sm px-3 py-1.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition font-medium'
          >
            Load Example
          </button>
          <button
            onClick={loadIntrospection}
            className='text-sm px-3 py-1.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition font-medium'
          >
            Schema Introspection
          </button>
          <button
            onClick={() => setQuery('')}
            className='text-sm px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium'
          >
            Clear
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700'>
        {/* Left: Input Panel */}
        <div className='bg-gray-50 dark:bg-gray-800 p-6'>
          <div className='mb-4'>
            <label
              htmlFor='gql-query'
              className='block text-sm font-semibold mb-2'
            >
              Query
            </label>
            <textarea
              id='gql-query'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='w-full h-64 p-3 rounded font-mono text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500'
              placeholder='Enter GraphQL query...'
              spellCheck='false'
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='gql-variables'
              className='block text-sm font-semibold mb-2'
            >
              Variables (JSON)
            </label>
            <textarea
              id='gql-variables'
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              className='w-full h-24 p-3 rounded font-mono text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500'
              placeholder='{}'
              spellCheck='false'
            />
          </div>

          <button
            onClick={executeQuery}
            disabled={loading}
            className='w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold px-4 py-3 rounded transition'
          >
            {loading ? (
              <>
                <BiRefresh className='animate-spin' size={20} />
                Executing...
              </>
            ) : (
              <>
                <BiPlay size={20} />
                Execute Query
              </>
            )}
          </button>
        </div>

        {/* Right: Results Panel */}
        <div className='bg-white dark:bg-gray-900 p-6 flex flex-col'>
          <label className='block text-sm font-semibold mb-2'>Response</label>

          {error ? (
            <div className='flex-1 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-red-700 dark:text-red-300 text-sm font-mono overflow-auto'>
              <div className='font-bold mb-2'>Error:</div>
              {error}
            </div>
          ) : result && !loading ? (
            <>
              {/* Response Tabs */}
              <div className='flex gap-2 mb-3 border-b border-gray-200 dark:border-gray-700'>
                <button
                  onClick={() => setResponseTab('data')}
                  className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
                    responseTab === 'data'
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Data
                </button>
                <button
                  onClick={() => setResponseTab('raw')}
                  className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
                    responseTab === 'raw'
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Raw JSON
                </button>
              </div>

              <div className='flex-1 rounded bg-gray-900 text-gray-100 p-4 font-mono text-sm overflow-y-auto max-h-96 border border-gray-700'>
                <pre className='whitespace-pre-wrap break-words'>
                  {responseTab === 'data'
                    ? formatJSON(result.data ?? result.errors ?? result)
                    : formatJSON(result)}
                </pre>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className='mt-3 text-sm text-red-600 dark:text-red-400'>
                  ⚠️ {result.errors.length} error(s) in response
                </div>
              )}
            </>
          ) : (
            <div className='flex-1 rounded bg-gray-100 dark:bg-gray-800 p-4 text-gray-500 dark:text-gray-400 flex items-center justify-center italic'>
              {loading
                ? 'Executing query...'
                : 'Execute a query to see results'}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className='bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 text-xs text-gray-600 dark:text-gray-400'>
        <p>
          💡 Tip: Use the buttons above to load example queries, or write your
          own. Results are displayed in real-time.
        </p>
      </div>
    </div>
  );
}
