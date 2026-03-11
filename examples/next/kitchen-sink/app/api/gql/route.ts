import { NextResponse } from 'next/server';
import { databaseRequest } from '../../../lib/databaseConnection';

export async function GET() {
  return NextResponse.json({
    message: 'TinaCMS GraphQL API',
    description: 'POST GraphQL queries to this endpoint',
    usage: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        query: 'your GraphQL query string',
        variables: 'optional variables object',
      },
    },
    example: {
      query: `query PostsQuery {
  postConnection {
    edges {
      node {
        id
        title
        date
      }
    }
  }
}`,
    },
    links: {
      documentation: '/gql',
      graphqlDocs: 'https://tina.io/docs/graphql/overview',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, variables } = body ?? {};
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "query" field in request body' },
        { status: 400 }
      );
    }
    const result = await databaseRequest({ query, variables });
    return NextResponse.json(result);
  } catch (err: unknown) {
    // Log the original error server-side and avoid leaking internals to clients
    console.error('GraphQL endpoint error:', err);
    const message =
      process.env.NODE_ENV === 'development'
        ? String(err)
        : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
