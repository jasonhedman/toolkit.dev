"use client";

import type React from "react";
import type { z, ZodObject } from "zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { mcpParameters } from "./base";

export const McpForm: React.ComponentType<{
  parameters: z.infer<ZodObject<typeof mcpParameters.shape>>;
  setParameters: (
    parameters: z.infer<ZodObject<typeof mcpParameters.shape>>,
  ) => void;
}> = ({ parameters, setParameters }) => {
  const setParameter = <K extends keyof typeof parameters>(
    key: K,
    value: (typeof parameters)[K],
  ) => {
    setParameters({
      ...parameters,
      transport: parameters.transport ?? "http",
      [key]: value,
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="mcp-url">Server URL</Label>
        <Input
          id="mcp-url"
          placeholder="https://example.com/mcp"
          value={parameters.url ?? ""}
          onChange={(event) => setParameter("url", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mcp-transport">Transport</Label>
        <select
          id="mcp-transport"
          className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          value={parameters.transport ?? "http"}
          onChange={(event) =>
            setParameter("transport", event.target.value as "http" | "sse")
          }
        >
          <option value="http">Streamable HTTP</option>
          <option value="sse">Server-sent events</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mcp-headers">Headers JSON</Label>
        <Textarea
          id="mcp-headers"
          placeholder='{"Authorization":"Bearer ..."}'
          value={parameters.headers ?? ""}
          onChange={(event) => setParameter("headers", event.target.value)}
          className="min-h-24 font-mono text-xs"
        />
      </div>
    </div>
  );
};
