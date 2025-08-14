import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

const inputSchema = z.object({
  prompt: z.string().min(1).max(250).describe("The video generation prompt"),
});

const outputSchema = z.object({
  url: z.string().describe("The URL of the generated video"),
});

export const baseGenerateTool = createBaseTool({
  description: "Generate a video using Luma Labs Dream Machine",
  inputSchema,
  outputSchema,
});
