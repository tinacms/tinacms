import { parseArgs } from 'node:util';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server';

export const DEFAULT_URL = 'http://localhost:4001/graphql';

const USAGE = `Usage: tinacms-mcp [options]

Serves a TinaCMS project's content to an MCP client over stdio.

Options:
  --url <url>     GraphQL endpoint (default ${DEFAULT_URL}, the "tinacms dev" server)
  --token <key>   TinaCloud token, sent as X-API-KEY (or set TINA_TOKEN)
  --read-only     Never expose the tools that create or change documents
  -h, --help      Show this help

Writes are enabled only for a local endpoint (localhost, 127.0.0.1, ::1).
A remote endpoint is always read-only.`;

export const isLocalUrl = (url: string): boolean => {
  const { hostname } = new URL(url);
  return ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
};

export const parseCliArgs = (argv: string[]) => {
  const { values } = parseArgs({
    args: argv,
    options: {
      url: { type: 'string' },
      token: { type: 'string' },
      'read-only': { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  const url = values.url ?? DEFAULT_URL;
  return {
    help: values.help === true,
    url,
    token: values.token ?? process.env.TINA_TOKEN,
    allowWrites: !values['read-only'] && isLocalUrl(url),
  };
};

export const runCli = async (argv: string[]): Promise<void> => {
  const args = parseCliArgs(argv);
  if (args.help) {
    console.log(USAGE);
    return;
  }
  const server = createServer({
    url: args.url,
    token: args.token,
    allowWrites: args.allowWrites,
  });
  await server.connect(new StdioServerTransport());
};
