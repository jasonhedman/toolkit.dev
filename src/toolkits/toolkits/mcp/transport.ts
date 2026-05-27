import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { z } from "zod";

import type { mcpParameters } from "./base";

export type McpClientConfig = z.infer<typeof mcpParameters>;

export const createMcpClientConfig = (params: McpClientConfig) => {
  return {
    ...params,
    headers: parseHeaders(params.headers),
  };
};

const parseHeaders = (headers?: string): Record<string, string> | undefined => {
  if (!headers?.trim()) {
    return undefined;
  }

  const parsed = JSON.parse(headers) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("MCP headers must be a JSON object");
  }

  return Object.fromEntries(
    Object.entries(parsed).map(([key, value]) => [key, String(value)]),
  );
};

export const withMcpClient = async <T>(
  config: ReturnType<typeof createMcpClientConfig>,
  callback: (client: Client) => Promise<T>,
) => {
  const client = new Client({
    name: "toolkit-dev-mcp-client",
    version: "0.1.0",
  });

  const url = new URL(config.url);
  const transport =
    config.transport === "sse"
      ? new SSEClientTransport(url, {
          requestInit: { headers: config.headers },
        })
      : new StreamableHTTPClientTransport(url, {
          requestInit: { headers: config.headers },
        });

  await client.connect(transport);

  try {
    return await callback(client);
  } finally {
    await client.close();
  }
};
