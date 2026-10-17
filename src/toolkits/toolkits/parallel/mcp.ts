import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { ToolExecutionContext } from "@/toolkits/types";
import { httpUrl, parallelOutput } from "./base";

const responseSchema = z.object({
  results: z.array(
    z.object({
      url: httpUrl,
      title: z.string().nullable().optional(),
      excerpts: z.array(z.string()),
      publish_date: z.string().nullable().optional(),
    }),
  ),
  warnings: z
    .array(z.object({ message: z.string() }))
    .nullable()
    .optional(),
  errors: z
    .array(z.object({ url: httpUrl, error_type: z.string() }))
    .optional(),
});

// One deadline covers connection, discovery and execution. Closing the transport
// also aborts HTTP requests in the version of the MCP SDK used by Toolkit.
export async function callParallel(
  name: "web_search" | "web_fetch",
  args: Record<string, unknown>,
  context: ToolExecutionContext,
) {
  const controller = new AbortController();
  const cancel = () => controller.abort(context.abortSignal?.reason);
  if (context.abortSignal?.aborted) cancel();
  context.abortSignal?.addEventListener("abort", cancel, { once: true });
  const timeout = setTimeout(
    () =>
      controller.abort(
        new Error("Parallel request timed out after 20 seconds"),
      ),
    20_000,
  );
  const client = new Client({ name: "toolkit.dev", version: "0.1.0" });
  const transport = new StreamableHTTPClientTransport(
    new URL("https://search.parallel.ai/mcp"),
    {
      requestInit: {
        headers: { "User-Agent": "Toolkit.dev/0.1.0 (+https://toolkit.dev)" },
      },
      reconnectionOptions: {
        maxRetries: 0,
        initialReconnectionDelay: 1000,
        maxReconnectionDelay: 1000,
        reconnectionDelayGrowFactor: 1,
      },
    },
  );
  const close = () => {
    void transport.close();
  };
  controller.signal.addEventListener("abort", close, { once: true });
  try {
    controller.signal.throwIfAborted();
    const options = { signal: controller.signal, timeout: 20_000 };
    await client.connect(transport, options);
    const { tools } = await client.listTools({}, options);
    if (!tools.some((tool) => tool.name === name)) {
      throw new Error(`Parallel does not advertise ${name}`);
    }
    const result = CallToolResultSchema.parse(
      await client.callTool(
        {
          name,
          arguments: {
            ...args,
            session_id: context.sessionId,
            ...(context.modelName ? { model_name: context.modelName } : {}),
          },
        },
        undefined,
        options,
      ),
    );
    if (result.isError) {
      throw new Error(
        result.content
          .filter((item) => item.type === "text")
          .map((item) => item.text)
          .join("\n") || "Parallel request failed",
      );
    }
    const text = result.content.find((item) => item.type === "text");
    const response = responseSchema.parse(
      result.structuredContent ??
        JSON.parse(text?.type === "text" ? text.text : "null"),
    );
    const warnings = [
      ...(response.warnings?.map((warning) => warning.message) ?? []),
      ...(response.errors?.map(
        (error) => `${error.url}: ${error.error_type}`,
      ) ?? []),
    ];
    if (response.results.length === 0 && response.errors?.length) {
      throw new Error(warnings.join("\n"));
    }
    return parallelOutput.parse({
      results: response.results.map((result) => ({
        title: result.title ?? new URL(result.url).hostname,
        url: result.url,
        content: result.excerpts.join("\n\n"),
        ...(result.publish_date ? { publishedDate: result.publish_date } : {}),
      })),
      warnings,
    });
  } catch (error) {
    controller.signal.throwIfAborted();
    throw error;
  } finally {
    clearTimeout(timeout);
    context.abortSignal?.removeEventListener("abort", cancel);
    controller.signal.removeEventListener("abort", close);
    await client.close();
  }
}
