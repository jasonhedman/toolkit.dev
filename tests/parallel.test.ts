import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { generateText, type Tool } from "ai";
import { MockLanguageModelV1 } from "ai/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { resolveInitialToolkits } from "../src/lib/cookies/default-toolkits";
import { resolveToolkitTools } from "../src/toolkits/resolve-tools";
import { Toolkits } from "../src/toolkits/toolkits/shared";
import { baseParallelToolkitConfig } from "../src/toolkits/toolkits/parallel/base";
import { ParallelResults } from "../src/toolkits/toolkits/parallel/client";

const originalFetch = globalThis.fetch;
const conversation = "726f31a7-685e-43b0-b3ba-5936b2058195";
const selected = [{ id: Toolkits.Parallel, parameters: {} }];
const searchArgs = {
  objective: "Find the Node.js test runner documentation",
  queries: ["Node.js test runner documentation"],
};
const page = {
  url: "https://nodejs.org/api/test.html",
  title: "Node.js test runner",
  excerpts: ["Run tests with node --test."],
  publish_date: null,
};
type Rpc = {
  id?: number;
  method: string;
  params?: { name?: string; arguments?: Record<string, unknown> };
};
type RequestRecord = {
  url: string;
  method: string;
  headers: Headers;
  rpc?: Rpc;
  signal?: AbortSignal | null;
};

function requestUrl(url: Parameters<typeof fetch>[0]): string {
  return typeof url === "string"
    ? url
    : url instanceof URL
      ? url.href
      : url.url;
}

function fixture(
  reply: (rpc: Rpc, signal?: AbortSignal | null) => unknown = () => ({
    results: [page],
  }),
) {
  const requests: RequestRecord[] = [];
  globalThis.fetch = (async (url, init) => {
    const rpc =
      typeof init?.body === "string"
        ? (JSON.parse(init.body) as Rpc)
        : undefined;
    requests.push({
      url: requestUrl(url),
      method: init?.method ?? "GET",
      headers: new Headers(init?.headers),
      rpc,
      signal: init?.signal,
    });
    if (!rpc) return new Response(null, { status: 405 });
    if (rpc.id === undefined) return new Response(null, { status: 202 });
    let result: unknown;
    if (rpc.method === "initialize")
      result = {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "fixture", version: "1" },
      };
    else if (rpc.method === "tools/list")
      result = {
        tools: ["web_search", "web_fetch"].map((name) => ({
          name,
          inputSchema: { type: "object" },
        })),
      };
    else if (rpc.method === "tools/call") {
      const response = await reply(rpc, init?.signal);
      result = { content: [{ type: "text", text: JSON.stringify(response) }] };
    } else throw new Error(`Unexpected RPC ${rpc.method}`);
    return Response.json({ jsonrpc: "2.0", id: rpc.id, result });
  }) as typeof fetch;
  return requests;
}

async function tools() {
  return (
    await resolveToolkitTools(selected, {
      sessionId: conversation,
      modelName: "openai/gpt-4o",
    })
  ).tools;
}

async function execute(
  tool: Tool | undefined,
  args: Record<string, unknown>,
  abortSignal?: AbortSignal,
) {
  assert.ok(tool?.execute);
  return (await tool.execute(args, {
    toolCallId: "test",
    messages: [],
    abortSignal,
  })) as {
    isError?: boolean;
    result: {
      results?: Array<{ url: string; content: string }>;
      warnings?: string[];
      error?: string;
    };
  };
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

void test("fresh default, saved choices, explicit disable and credentials", async () => {
  fixture();
  assert.deepEqual(resolveInitialToolkits(undefined, false, false), selected);
  for (const saved of [
    [],
    [{ id: Toolkits.Exa, parameters: {} }],
    [{ id: Toolkits.Parallel, parameters: {} }],
  ]) {
    assert.equal(resolveInitialToolkits(saved, false, false), saved);
    assert.equal(resolveInitialToolkits(saved, true, true), saved);
  }
  assert.deepEqual(resolveInitialToolkits(undefined, true, false), []);
  assert.deepEqual(resolveInitialToolkits(undefined, false, true), []);
  // The dispatcher only grants tools explicitly selected by the client. An empty
  // workbench, disabled search, or a model without tool calling sends no tools.
  assert.deepEqual((await resolveToolkitTools([], {})).tools, {});
});

void test("real registry dispatch constructs anonymous search/fetch and preserves sources", async () => {
  const requests = fixture();
  const loaded = await tools();
  assert.deepEqual(Object.keys(loaded), ["parallel_search", "parallel_fetch"]);
  const search = await execute(loaded.parallel_search, searchArgs);
  const fetch = await execute(loaded.parallel_fetch, {
    urls: [page.url],
    objective: "Read the test runner usage",
  });
  for (const result of [search, fetch]) {
    assert.equal(result.isError, undefined);
    assert.equal(result.result.results?.[0]?.url, page.url);
    assert.match(result.result.results?.[0]?.content ?? "", /node --test/);
  }
  const calls = requests.filter(
    (request) => request.rpc?.method === "tools/call",
  );
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0]?.rpc?.params?.arguments, {
    objective: searchArgs.objective,
    search_queries: searchArgs.queries,
    session_id: conversation,
    model_name: "openai/gpt-4o",
  });
  assert.deepEqual(calls[1]?.rpc?.params?.arguments, {
    urls: [page.url],
    objective: "Read the test runner usage",
    session_id: conversation,
    model_name: "openai/gpt-4o",
  });
  for (const request of requests) {
    assert.equal(request.url, "https://search.parallel.ai/mcp");
    assert.equal(
      request.headers.get("user-agent"),
      "Toolkit.dev/0.1.0 (+https://toolkit.dev)",
    );
    assert.equal(request.headers.get("authorization"), null);
    assert.equal(request.headers.get("x-api-key"), null);
  }
  for (const method of ["initialize", "tools/list", "tools/call"])
    assert.ok(requests.some((r) => r.rpc?.method === method));
});

void test("scripted AI SDK model consumes dispatcher search results in its next step", async () => {
  fixture();
  let steps = 0;
  const model = new MockLanguageModelV1({
    doGenerate: async ({ prompt }) => {
      steps++;
      const common = {
        rawCall: { rawPrompt: null, rawSettings: {} },
        usage: { promptTokens: 1, completionTokens: 1 },
      };
      if (steps === 1)
        return {
          ...common,
          finishReason: "tool-calls",
          toolCalls: [
            {
              toolCallType: "function",
              toolCallId: "search-1",
              toolName: "parallel_search",
              args: JSON.stringify(searchArgs),
            },
          ],
        };
      assert.match(JSON.stringify(prompt), /Run tests with node --test/);
      assert.match(
        JSON.stringify(prompt),
        /https:\/\/nodejs.org\/api\/test.html/,
      );
      return {
        ...common,
        finishReason: "stop",
        text: "Use node --test; see https://nodejs.org/api/test.html.",
      };
    },
  });
  const result = await generateText({
    model,
    prompt: "How do I run Node.js tests?",
    tools: await tools(),
    maxSteps: 3,
  });
  assert.equal(steps, 2);
  assert.match(result.text, /node --test/);
  assert.equal(result.steps[0]?.toolResults[0]?.toolName, "parallel_search");
});

void test("URL validation rejects non-web URLs and credentials before network access", async () => {
  const requests = fixture();
  const loaded = await tools();
  for (const url of [
    "file:///etc/passwd",
    "javascript:alert(1)",
    "https://user:pass@example.com/",
  ]) {
    assert.equal(
      baseParallelToolkitConfig.tools.fetch.inputSchema.safeParse({
        urls: [url],
      }).success,
      false,
    );
    assert.equal(
      (await execute(loaded.parallel_fetch, { urls: [url] })).isError,
      true,
    );
  }
  assert.equal(requests.length, 0);
});

void test("empty results and partial extraction failures remain visible", async () => {
  fixture(() => ({ results: [] }));
  const loaded = await tools();
  assert.deepEqual(
    (await execute(loaded.parallel_search, searchArgs)).result.results,
    [],
  );
  fixture(() => ({
    results: [page],
    errors: [{ url: "https://example.com/missing", error_type: "not_found" }],
    warnings: [{ message: "A source could not be read" }],
  }));
  const result = await execute(loaded.parallel_fetch, {
    urls: [page.url, "https://example.com/missing"],
  });
  assert.equal(result.isError, undefined);
  assert.deepEqual(result.result.warnings, [
    "A source could not be read",
    "https://example.com/missing: not_found",
  ]);
  const markup = renderToStaticMarkup(
    createElement(ParallelResults, {
      result: {
        results: [
          {
            title: page.title,
            url: page.url,
            content: page.excerpts.join("\n"),
          },
        ],
        warnings: result.result.warnings ?? [],
      },
    }),
  );
  assert.match(markup, /Node.js test runner/);
  assert.match(markup, /A source could not be read/);
  assert.match(markup, /https:\/\/example.com\/missing: not_found/);
});

void test("HTTP, MCP, malformed-result and fetch failures are reported without fallback", async () => {
  const loaded = await tools();
  for (const response of [
    { content: [{ type: "text", text: "quota exceeded" }], isError: true },
    { content: [{ type: "text", text: "not json" }] },
    {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            results: [{ ...page, url: "javascript:alert(1)" }],
          }),
        },
      ],
    },
    {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            results: [],
            errors: [{ url: page.url, error_type: "unavailable" }],
          }),
        },
      ],
    },
  ]) {
    const original = fixture();
    const validFetch = globalThis.fetch;
    globalThis.fetch = (async (url, init) => {
      const rpc =
        typeof init?.body === "string"
          ? (JSON.parse(init.body) as Rpc)
          : undefined;
      if (rpc?.method === "tools/call")
        return Response.json({ jsonrpc: "2.0", id: rpc.id, result: response });
      return validFetch(url, init);
    }) as typeof fetch;
    assert.equal(
      (await execute(loaded.parallel_search, searchArgs)).isError,
      true,
    );
    assert.ok(
      original.every(
        (request) => request.url === "https://search.parallel.ai/mcp",
      ),
    );
  }
  const requests: string[] = [];
  globalThis.fetch = (async (url) => {
    requests.push(requestUrl(url));
    return new Response("service unavailable", { status: 503 });
  }) as typeof fetch;
  const result = await execute(loaded.parallel_search, searchArgs);
  assert.equal(result.isError, true);
  assert.match(result.result.error ?? "", /503/);
  assert.ok(requests.every((url) => url === "https://search.parallel.ai/mcp"));
});

void test("cancellation aborts active HTTP work and an already cancelled call sends nothing", async () => {
  let started!: () => void;
  const waiting = new Promise<void>((resolve) => {
    started = resolve;
  });
  let signal: AbortSignal | null | undefined;
  fixture(async (_rpc, requestSignal) => {
    signal = requestSignal;
    started();
    return new Promise((_resolve, reject) =>
      requestSignal?.addEventListener(
        "abort",
        () =>
          reject(
            requestSignal.reason instanceof Error
              ? requestSignal.reason
              : new Error("Request aborted"),
          ),
        { once: true },
      ),
    );
  });
  const loaded = await tools();
  const controller = new AbortController();
  const running = execute(
    loaded.parallel_search,
    searchArgs,
    controller.signal,
  );
  await waiting;
  controller.abort(new Error("User stopped search"));
  assert.match((await running).result.error ?? "", /User stopped search/);
  assert.equal(signal?.aborted, true);
  const requests = fixture();
  assert.equal(
    (await execute(loaded.parallel_search, searchArgs, controller.signal))
      .isError,
    true,
  );
  assert.equal(requests.length, 0);
});

void test(
  "the 20-second deadline aborts a stalled HTTP request",
  { timeout: 25_000 },
  async () => {
    let signal: AbortSignal | null | undefined;
    fixture(async (_rpc, requestSignal) => {
      signal = requestSignal;
      return new Promise((_resolve, reject) =>
        requestSignal?.addEventListener(
          "abort",
          () =>
            reject(
              requestSignal.reason instanceof Error
                ? requestSignal.reason
                : new Error("Request aborted"),
            ),
          { once: true },
        ),
      );
    });
    const loaded = await tools();
    const result = await execute(loaded.parallel_search, searchArgs);
    assert.equal(result.isError, true);
    assert.match(result.result.error ?? "", /timed out after 20 seconds/);
    assert.equal(signal?.aborted, true);
  },
);
