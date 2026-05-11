"use client";

import type React from "react";
import type { z, ZodObject } from "zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/stack";

import type { mcpParameters } from "./base";

export const Form: React.ComponentType<{
  parameters: z.infer<ZodObject<typeof mcpParameters.shape>>;
  setParameters: (
    parameters: z.infer<ZodObject<typeof mcpParameters.shape>>,
  ) => void;
}> = ({ parameters, setParameters }) => {
  return (
    <VStack className="items-stretch gap-4 px-4 py-2">
      <div className="grid gap-2">
        <Label htmlFor="mcp-server-url">Server URL</Label>
        <Input
          id="mcp-server-url"
          placeholder="https://example.com/mcp"
          value={parameters.serverUrl ?? ""}
          onChange={(event) =>
            setParameters({
              ...parameters,
              serverUrl: event.target.value,
            })
          }
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="mcp-headers">Headers</Label>
        <Textarea
          id="mcp-headers"
          className="min-h-24 font-mono text-sm"
          placeholder='{ "Authorization": "Bearer ..." }'
          value={parameters.headers ?? ""}
          onChange={(event) =>
            setParameters({
              ...parameters,
              headers: event.target.value,
            })
          }
        />
      </div>
    </VStack>
  );
};
