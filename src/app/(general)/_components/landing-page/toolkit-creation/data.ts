import { Code2, Server, Settings } from "lucide-react";

export const toolkitCreationSteps = [
  {
    icon: Settings,
    title: "Define Base Config",
    description: "Define the parameters + each tool's inputs and outputs",
    codeTitle: "base.ts",
    code: `export const baseToolkit = {
  tools: {
    myAction: {
      description: "Write notes to your workspace",
      inputSchema: z.object({
        note: z.string(),
      }),
      outputSchema: z.object({
        result: z.string(),
      }),
    },
  },
  // user configuration
  parameters: z.object({
    workspaceId: z.string(),
    scopes: z.array(z.string()),
  }),
};`,
    delay: 0,
  },
  {
    icon: Code2,
    title: "Create Client UI",
    description: "Create a loading and complete UI for each tool",
    codeTitle: "client.tsx",
    code: `export const clientToolkit = createClientToolkit(
  baseToolkit,
  {
    name: "Note Taker",
    description: "Write notes to your workspace",
    icon: Note,
  },
  {
    myAction: {
      CallComponent: ({ args }) => (
        <p>Writing note to {args.workspaceId}</p>
      ),
      CallButtonComponent: ({ result }) => (
        <Button>Save Note</Button>
      ),
    },
  },
);`,
    delay: 0.1,
  },
  {
    icon: Server,
    title: "Add Server Logic",
    description: "Implement server initialization + tool execution logic",
    codeTitle: "server.ts",
    code: `export const serverToolkit = createServerToolkit(
  baseToolkit,
  "System prompt for toolkit",
  async (params) => ({
    myAction: {
      callback: async (args) => {
        // Your custom logic here
        const userToken = await getUserToken();
        const result = await callExternalAPI(
          args.query, 
          params.apiKey
        );
        return { result };
      },
      aiMessage: "Note saved"
    },
  }),
);`,
    delay: 0.2,
  },
];
