import { Code2, Server, Settings, Users } from "lucide-react";

export const toolkitCreationTabs = [
  {
    id: "simple-workflow",
    title: "Simple Agent Workflow",
    description: "Create a basic AI agent workflow with multiple agents.",
    icon: Settings,
    code: `import { Agent, MultiAgentSystem } from 'ai-agent-sdk';

const researchAgent = new Agent('Researcher');
const analysisAgent = new Agent('Analyst');
const reportAgent = new Agent('Reporter');

const system = new MultiAgentSystem('MarketResearch');

system.addAgent(researchAgent, {
  task: 'collectData',
  output: 'rawData'
});

system.addAgent(analysisAgent, {
  task: 'analyzeData',
  input: 'rawData',
  output: 'analysisResults'
});

system.addAgent(reportAgent, {
  task: 'generateReport',
  input: 'analysisResults',
  output: 'finalReport'
});

const runResearch = async () => {
  const finalReport = await system.run();
  console.log('Research completed:', finalReport);
};`
  },
  {
    id: "multi-agent",
    title: "Multi-Agent Collaboration",
    description: "Set up multiple AI agents to work together on a complex task.",
    icon: Users,
    code: `import { Swarm, Agent } from 'ai-agent-sdk';

const client = new Swarm();

const transferToAgentB = (): Agent => {
  return agentB;
};

const agentA = new Agent({
  name: "Agent A",
  instructions: "You are a helpful agent.",
  functions: [transferToAgentB],
});

const agentB = new Agent({
  name: "Agent B",
  instructions: "Only speak in Haikus.",
});

const run = async () => {
  const response = await client.run({
    agent: agentA,
    messages: [{ role: "user", content: "I want to talk to agent B" }],
  });
  console.log('Response:', response);
};

run();`
  },
  {
    id: "tool-integration",
    title: "Tool Integration",
    description: "Integrate external tools and APIs into an AI agent workflow.",
    icon: Code2,
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
};

export const serverToolkit = createServerToolkit(
  baseToolkit,
  "System prompt for toolkit",
  async (params) => ({
    myAction: {
      callback: async (args) => {
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
);`
  },
  {
    id: "custom-behavior",
    title: "Customizable Agent Behavior",
    description: "Design a specialized AI agent with custom decision-making logic.",
    icon: Server,
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
);

const customAgent = new Agent({
  name: "Custom Agent",
  instructions: \`You are a specialized agent with custom logic.
                 Always consider context and make informed decisions.\`,
  decisionMaking: (context) => {
    if (context.userPreference === 'detailed') {
      return 'provide comprehensive analysis';
    }
    return 'provide concise summary';
  }
});`
  }
];
