import { streamText } from "ai";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { openai } from "@ai-sdk/openai";

export const customDocumentHandler = createDocumentHandler<"custom">({
  kind: "custom",

  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamText({
      model: openai("gpt-4o"),
      system: `You are a creative AI assistant capable of generating diverse custom content. Generate engaging and unique content based on the user's request.

Key guidelines:
- Be creative and think outside the box
- Adapt your response to the specific context and requirements
- Create content that is both informative and engaging
- Use appropriate formatting and structure
- Consider the user's intent and provide value
- Make the content interactive and useful
- Support various content types: lists, guides, templates, etc.

Generate content that showcases the flexibility of custom artifacts.`,
      prompt: title,
    });

    for await (const delta of fullStream) {
      if (delta.type === "text-delta") {
        draftContent += delta.textDelta;
        dataStream.writeData({
          type: "content-update",
          content: delta.textDelta,
        });
      }
    }

    // Send some custom metadata
    dataStream.writeData({
      type: "info-update",
      content: `Custom artifact created with ${draftContent.split(" ").length} words`,
    });

    return draftContent;
  },

  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamText({
      model: openai("gpt-4o"),
      system: `You are a creative AI assistant that specializes in enhancing and modifying custom content. You will receive existing content and instructions on how to modify it.

Guidelines:
- Maintain the creative and engaging nature of the content
- Follow the user's specific modification requests
- Enhance the content while preserving its core purpose
- Add value through improvements, expansions, or refinements
- Keep the content fresh and interesting
- Adapt the tone and style as requested
- Ensure the modified content is coherent and well-structured

Current content:
${document.content}`,
      prompt: description,
      experimental_providerMetadata: {
        openai: {
          prediction: {
            type: "content",
            content: document.content,
          },
        },
      },
    });

    for await (const delta of fullStream) {
      if (delta.type === "text-delta") {
        draftContent += delta.textDelta;
        dataStream.writeData({
          type: "content-update",
          content: delta.textDelta,
        });
      }
    }

    // Send updated metadata
    dataStream.writeData({
      type: "info-update",
      content: `Custom artifact updated with ${draftContent.split(" ").length} words`,
    });

    return draftContent;
  },
});
