import { streamText } from "ai";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { openai } from "@ai-sdk/openai";

export const textDocumentHandler = createDocumentHandler<"text">({
  kind: "text",
  
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";
    
    const { fullStream } = streamText({
      model: openai("gpt-4o"),
      system: `You are a skilled writer assistant. Generate high-quality written content based on the user's request. 
      
Key guidelines:
- Create well-structured, engaging content
- Use appropriate tone and style for the context
- Include proper formatting with paragraphs and sections
- Make the content comprehensive and valuable
- Support markdown formatting when appropriate`,
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

    return draftContent;
  },

  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";
    
    const { fullStream } = streamText({
      model: openai("gpt-4o"),
      system: `You are a skilled editor and writer. You will receive existing content and instructions on how to modify it.

Guidelines:
- Preserve the original intent and style unless specifically asked to change it
- Make improvements that enhance clarity, readability, and impact
- Follow the user's specific instructions for modifications
- Maintain proper formatting and structure
- If asked to expand, add valuable and relevant content
- If asked to condense, preserve the most important information

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

    return draftContent;
  },
});
