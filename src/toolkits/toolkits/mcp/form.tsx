"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/stack";

import type { z } from "zod";
import type { mcpParameters } from "./base";

interface McpFormProps {
  parameters: z.infer<typeof mcpParameters>;
  setParameters: (parameters: z.infer<typeof mcpParameters>) => void;
}

export const McpForm: React.FC<McpFormProps> = ({
  parameters,
  setParameters,
}) => {
  return (
    <VStack className="w-full items-start gap-4 p-4">
      <VStack className="w-full items-start gap-2">
        <Label htmlFor="mcp-url">MCP URL</Label>
        <Input
          id="mcp-url"
          value={parameters.url ?? ""}
          onChange={(event) =>
            setParameters({
              ...parameters,
              url: event.target.value,
            })
          }
          placeholder="https://example.com/sse"
        />
      </VStack>
      <VStack className="w-full items-start gap-2">
        <Label htmlFor="mcp-headers">Headers</Label>
        <Textarea
          id="mcp-headers"
          value={parameters.headers ?? ""}
          onChange={(event) =>
            setParameters({
              ...parameters,
              headers: event.target.value,
            })
          }
          placeholder={'{"Authorization":"Bearer token"}'}
          rows={5}
        />
      </VStack>
    </VStack>
  );
};
