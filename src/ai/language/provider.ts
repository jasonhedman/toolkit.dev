import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const openrouter = createOpenRouter({
  headers: {
    "HTTP-Referer": "https://toolkit.dev",
    "X-Title": "Toolkit.dev",
  },
});
