import { tool } from "ai";
import { z } from "zod";
import { createServerOnlyCaller } from "@/server/api/root";

export function createArtifactTool(chatId: string) {
  return tool({
    description: `Create an artifact for content that should be displayed in a workspace-like interface. 
    
Use this tool when the user asks for:
- Text content like essays, emails, documents, or long-form writing
- Code snippets, scripts, or programming examples  
- Custom structured content that would benefit from a dedicated workspace

Do not use for:
- Simple questions or short responses
- Conversational replies
- Basic explanations

The artifact will be rendered in a special interface alongside the chat.`,
    
    parameters: z.object({
      title: z.string().describe("A clear, descriptive title for the artifact"),
      kind: z.enum(["text", "code", "custom"]).describe("The type of artifact to create"),
      content: z.string().describe("The full content for the artifact"),
      description: z.string().optional().describe("Optional description of what was created"),
    }),
    
    execute: async ({ title, kind, content, description }) => {
      try {
        // Create the document in the database
        const caller = await createServerOnlyCaller();
        
        const document = await caller.documents.create({
          title,
          kind,
          initialContent: content,
          chatId, // Link to the current chat
        });

        return {
          success: true,
          documentId: document.id,
          title: document.title,
          kind: document.kind,
          description: description || `Created ${kind} artifact: ${title}`,
          message: `I've created a ${kind} artifact titled "${title}". You can view and edit it in the workspace panel.`,
        };
      } catch (error) {
        console.error("Failed to create artifact:", error);
        return {
          success: false,
          error: "Failed to create artifact",
          message: "I encountered an error while creating the artifact. Please try again.",
        };
      }
    },
  });
}
