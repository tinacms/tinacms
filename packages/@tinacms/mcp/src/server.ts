import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TinaClient, type TinaClientOptions } from './client';
import { readTools, type ToolDefinition, writeTools } from './tools';

export interface CreateServerOptions extends TinaClientOptions {
  /** Register create_document and update_document. Defaults to false. */
  allowWrites?: boolean;
  version?: string;
}

export const createServer = (options: CreateServerOptions): McpServer => {
  const client = new TinaClient(options);
  const server = new McpServer({
    name: 'tinacms',
    version: options.version ?? '0.0.0',
  });
  const tools: ToolDefinition[] = [
    ...readTools(client),
    ...(options.allowWrites ? writeTools(client) : []),
  ];
  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: { readOnlyHint: tool.readOnly },
      },
      // The handler's argument type is derived from the tool's own schema.
      tool.handler as never
    );
  }
  return server;
};
