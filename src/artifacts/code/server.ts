import { streamText } from "ai";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { openai } from "@ai-sdk/openai";

export const codeDocumentHandler = createDocumentHandler<"code">({
  kind: "code",
  
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";
    
    const { fullStream } = streamText({
      model: openai("gpt-4o"),
      system: `You are an expert software developer. Generate high-quality, working code based on the user's request.

Key guidelines:
- Write clean, readable, and well-documented code
- Follow best practices and conventions for the target language
- Include helpful comments explaining complex logic
- Make the code functional and ready to run
- Use appropriate error handling where needed
- Consider edge cases and provide robust solutions
- If multiple languages could work, choose the most appropriate one
- Start with a language detection comment like: // Language: JavaScript

Format your response as clean code without markdown code blocks.`,
      prompt: title,
    });

    // Detect language from the first few tokens and send metadata
    let hasDetectedLanguage = false;
    
    for await (const delta of fullStream) {
      if (delta.type === "text-delta") {
        draftContent += delta.textDelta;
        
        // Try to detect language from the beginning of the content
        if (!hasDetectedLanguage && draftContent.length > 20) {
          const language = detectLanguage(draftContent);
          if (language) {
            dataStream.writeData({
              type: "language-update",
              content: language,
            });
            hasDetectedLanguage = true;
          }
        }
        
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
      system: `You are an expert software developer and code reviewer. You will receive existing code and instructions on how to modify it.

Guidelines:
- Maintain code quality and best practices
- Preserve working functionality unless specifically asked to change it
- Add proper error handling and edge case consideration
- Include clear comments for new or modified sections
- Follow the existing code style and conventions
- Make sure the modified code is functional and ready to run
- If changing languages, ensure a smooth transition
- Optimize for readability and maintainability

Current code:
\`\`\`
${document.content}
\`\`\`

Format your response as clean code without markdown code blocks.`,
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

function detectLanguage(code: string): string | null {
  const content = code.toLowerCase().trim();
  
  // Check for explicit language comments
  if (content.includes("// language:")) {
    const match = content.match(/\/\/ language:\s*(\w+)/);
    return match?.[1] ?? null;
  }
  
  // Pattern-based detection
  if (content.includes("def ") || content.includes("import ") || content.includes("print(")) {
    return "python";
  }
  if (content.includes("function ") || content.includes("const ") || content.includes("console.log")) {
    return "javascript";
  }
  if (content.includes("interface ") || content.includes("type ") || content.includes(": string")) {
    return "typescript";
  }
  if (content.includes("<!doctype") || content.includes("<html")) {
    return "html";
  }
  if (content.includes("select ") || content.includes("from ") || content.includes("where ")) {
    return "sql";
  }
  if (content.includes("{") && content.includes(":") && content.includes("}")) {
    return "json";
  }
  
  return null;
}
