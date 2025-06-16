"use client";

import { motion } from "motion/react";
import { useChatContext } from "@/app/_contexts/chat-context";
import { Toolkits } from "@/toolkits/toolkits/shared";
import { useMemo } from "react";
import { clientToolkits } from "@/toolkits/toolkits/client";
import { ToolkitIcons } from "@/components/toolkit/toolkit-icons";
import { HStack } from "@/components/ui/stack";

// Dynamic starter prompts with toolkit associations
interface StarterPrompt {
  title: string;
  prompt: string;
  toolkitIds: Toolkits[];
  description?: string;
}

const DYNAMIC_STARTER_PROMPTS: StarterPrompt[] = [
  // Multi-toolkit prompts (4+ toolkits - highest priority)
  {
    title: "Comprehensive Project Dashboard",
    prompt:
      "Create a comprehensive project dashboard by analyzing my Notion database, GitHub repositories, and generating visual progress charts with memory of key insights",
    toolkitIds: [
      Toolkits.Notion,
      Toolkits.Github,
      Toolkits.Image,
      Toolkits.Memory,
    ],
    description:
      "Ultimate project management combining workspace data, code analysis, visualization, and persistent insights",
  },
  {
    title: "Market Research & Competitive Intelligence",
    prompt:
      "Research market trends, analyze competitor GitHub repos, create infographics, and store findings in Notion with persistent memory",
    toolkitIds: [
      Toolkits.Exa,
      Toolkits.Github,
      Toolkits.Image,
      Toolkits.Notion,
      Toolkits.Memory,
    ],
    description:
      "Complete competitive intelligence workflow with research, analysis, visualization, documentation, and memory",
  },
  {
    title: "Intelligent Meeting Coordination",
    prompt:
      "Schedule team meetings based on calendar availability, prepare agenda from Notion pages and Drive documents, and remember meeting preferences",
    toolkitIds: [
      Toolkits.GoogleCalendar,
      Toolkits.Notion,
      Toolkits.GoogleDrive,
      Toolkits.Memory,
    ],
    description:
      "Intelligent meeting coordination with multi-source document preparation and learning preferences",
  },
  {
    title: "Data-Driven Productivity Analysis",
    prompt:
      "Analyze my Notion task database with Python, create productivity visualizations, and schedule optimization based on calendar patterns",
    toolkitIds: [
      Toolkits.Notion,
      Toolkits.E2B,
      Toolkits.Image,
      Toolkits.GoogleCalendar,
    ],
    description:
      "Data-driven productivity optimization with computational analysis and visual insights",
  },

  // Multi-toolkit prompts (3 toolkits)
  {
    title: "Competitor Analysis with Memory",
    prompt:
      "Research my competitors and create a comprehensive analysis with visual charts stored in memory for future reference",
    toolkitIds: [Toolkits.Exa, Toolkits.Image, Toolkits.Memory],
    description:
      "Uses web search, image generation, and memory for comprehensive competitor analysis",
  },
  {
    title: "GitHub Architecture Analysis",
    prompt:
      "Analyze this GitHub repository, create a visual architecture diagram, and execute code examples to understand the implementation",
    toolkitIds: [Toolkits.Github, Toolkits.Image, Toolkits.E2B],
    description:
      "Combines GitHub analysis, code execution, and visual diagram generation",
  },
  {
    title: "AI Research with Code Analysis",
    prompt:
      "Find research papers on AI, summarize key findings with code analysis, and remember important insights for future conversations",
    toolkitIds: [Toolkits.Exa, Toolkits.Memory, Toolkits.E2B],
    description:
      "Research papers with data analysis and persistent memory storage",
  },
  {
    title: "Visual Knowledge Base Creation",
    prompt:
      "Create a knowledge base by analyzing my Notion pages, generating visual summaries, and storing key insights in memory",
    toolkitIds: [Toolkits.Notion, Toolkits.Image, Toolkits.Memory],
    description:
      "Notion content analysis with visual summaries and persistent knowledge storage",
  },
  {
    title: "Data Visualization Dashboard",
    prompt:
      "Build a data visualization dashboard by analyzing my Google Drive spreadsheets with Python and creating interactive charts",
    toolkitIds: [Toolkits.GoogleDrive, Toolkits.E2B, Toolkits.Image],
    description:
      "Data processing with computational analysis and visual output generation",
  },
  {
    title: "Industry Trend Infographics",
    prompt:
      "Research industry trends, generate infographics, and organize findings in my Notion workspace",
    toolkitIds: [Toolkits.Exa, Toolkits.Image, Toolkits.Notion],
    description:
      "Market research with visual content creation and organized documentation",
  },
  {
    title: "Technical Roadmap Planning",
    prompt:
      "Find GitHub repositories for my project idea, create a technical roadmap visualization, and document in Notion",
    toolkitIds: [Toolkits.Github, Toolkits.Image, Toolkits.Notion],
    description:
      "Repository discovery with comprehensive visual planning and documentation",
  },
  {
    title: "Database Analytics with Visualizations",
    prompt:
      "Query my Notion database, perform statistical analysis with Python, and create data visualizations",
    toolkitIds: [Toolkits.Notion, Toolkits.E2B, Toolkits.Image],
    description:
      "Database analysis with computational processing and visual reporting",
  },
  {
    title: "Time Management Optimization",
    prompt:
      "Analyze my calendar patterns, research productivity techniques, and create a time management visualization",
    toolkitIds: [Toolkits.GoogleCalendar, Toolkits.Exa, Toolkits.Image],
    description:
      "Calendar analysis with research-backed productivity optimization",
  },
  {
    title: "Document Analysis with Memory",
    prompt:
      "Search my Google Drive for project files, execute analysis scripts, and remember key findings",
    toolkitIds: [Toolkits.GoogleDrive, Toolkits.E2B, Toolkits.Memory],
    description:
      "Document analysis with computational processing and insight storage",
  },

  // Two-toolkit prompts
  {
    title: "Notion Visual Reports",
    prompt:
      "Analyze my Notion database and create beautiful data visualizations and reports",
    toolkitIds: [Toolkits.Notion, Toolkits.Image],
    description: "Notion database analysis with visual reporting",
  },
  {
    title: "Notion Data Analysis",
    prompt:
      "Query my Notion workspace and perform advanced data analysis with Python",
    toolkitIds: [Toolkits.Notion, Toolkits.E2B],
    description: "Notion data processing with computational analysis",
  },
  {
    title: "Notion Memory Search",
    prompt:
      "Search my Notion pages and remember important information for future conversations",
    toolkitIds: [Toolkits.Notion, Toolkits.Memory],
    description: "Notion content search with persistent memory storage",
  },
  {
    title: "Calendar Time Analysis",
    prompt:
      "Analyze my calendar patterns and create a time management visualization",
    toolkitIds: [Toolkits.GoogleCalendar, Toolkits.Image],
    description: "Calendar analysis with visual insights",
  },
  {
    title: "Research with Code Testing",
    prompt:
      "Search for machine learning papers and execute code examples to test concepts",
    toolkitIds: [Toolkits.Exa, Toolkits.E2B],
    description: "Research with hands-on code experimentation",
  },
  {
    title: "Competitive Intelligence Memory",
    prompt: "Find competitors in my industry and remember their key strategies",
    toolkitIds: [Toolkits.Exa, Toolkits.Memory],
    description: "Competitive intelligence with persistent insights",
  },
  {
    title: "GitHub Portfolio Showcase",
    prompt:
      "Analyze my GitHub contributions and generate a portfolio showcase image",
    toolkitIds: [Toolkits.Github, Toolkits.Image],
    description: "Code portfolio visualization",
  },
  {
    title: "Drive Document Analysis",
    prompt:
      "Search my Google Drive for project files and run analysis scripts on the data",
    toolkitIds: [Toolkits.GoogleDrive, Toolkits.E2B],
    description: "Document analysis with computational processing",
  },
  {
    title: "Smart Calendar Learning",
    prompt:
      "Remember my meeting preferences and schedule optimization based on calendar analysis",
    toolkitIds: [Toolkits.GoogleCalendar, Toolkits.Memory],
    description: "Smart scheduling with learning preferences",
  },
  {
    title: "Research Data Visualizations",
    prompt: "Create stunning visualizations of research data and trends",
    toolkitIds: [Toolkits.Exa, Toolkits.Image],
    description: "Research visualization and infographic creation",
  },
  {
    title: "GitHub Pattern Recognition",
    prompt:
      "Analyze GitHub repositories and remember coding patterns for future projects",
    toolkitIds: [Toolkits.Github, Toolkits.Memory],
    description: "Code analysis with pattern recognition and memory",
  },
  {
    title: "Drive to Notion Organization",
    prompt:
      "Search my Google Drive documents and organize findings in my Notion workspace",
    toolkitIds: [Toolkits.GoogleDrive, Toolkits.Notion],
    description: "Document search with organized knowledge management",
  },
  {
    title: "Team Database Scheduling",
    prompt:
      "Analyze my Notion team database and schedule coordination meetings",
    toolkitIds: [Toolkits.Notion, Toolkits.GoogleCalendar],
    description: "Team management with intelligent scheduling",
  },
  {
    title: "GitHub Research Documentation",
    prompt:
      "Research GitHub projects and document findings in my Notion knowledge base",
    toolkitIds: [Toolkits.Github, Toolkits.Notion],
    description: "Code research with organized documentation",
  },
  {
    title: "Industry Insights Organization",
    prompt:
      "Search for industry insights and organize them in my Notion workspace",
    toolkitIds: [Toolkits.Exa, Toolkits.Notion],
    description: "Research with structured knowledge organization",
  },

  // Single-toolkit prompts (ensure at least one per server)
  {
    title: "AI & ML Research",
    prompt:
      "Search for the latest developments in artificial intelligence and machine learning",
    toolkitIds: [Toolkits.Exa],
    description: "Comprehensive web research and information gathering",
  },
  {
    title: "Custom Visual Content",
    prompt:
      "Generate a beautiful infographic, chart, or custom image for my presentation",
    toolkitIds: [Toolkits.Image],
    description:
      "Custom visual content creation with AI-powered image generation",
  },
  {
    title: "GitHub Code Analysis",
    prompt:
      "Find and analyze interesting GitHub repositories, users, and code patterns in my field",
    toolkitIds: [Toolkits.Github],
    description: "Repository discovery, code analysis, and developer insights",
  },
  {
    title: "Smart Calendar Management",
    prompt:
      "Help me organize and optimize my calendar schedule with smart scheduling suggestions",
    toolkitIds: [Toolkits.GoogleCalendar],
    description: "Intelligent calendar management and scheduling assistance",
  },
  {
    title: "Google Drive Analysis",
    prompt:
      "Search and analyze documents in my Google Drive with content extraction",
    toolkitIds: [Toolkits.GoogleDrive],
    description: "Document discovery, analysis, and content extraction",
  },
  {
    title: "Conversation Memory",
    prompt:
      "Remember important information from our conversation for future reference and context",
    toolkitIds: [Toolkits.Memory],
    description: "Persistent memory storage and intelligent context management",
  },
  {
    title: "Notion Workspace Analysis",
    prompt:
      "Analyze my Notion workspace, databases, and pages to extract insights and organize information",
    toolkitIds: [Toolkits.Notion],
    description:
      "Comprehensive Notion workspace analysis and knowledge extraction",
  },
  {
    title: "Python Code Execution",
    prompt:
      "Execute Python code to analyze data, create visualizations, or solve complex computational problems",
    toolkitIds: [Toolkits.E2B],
    description:
      "Secure code execution, data analysis, and algorithmic problem solving",
  },

  // Fallback generic prompts (no specific toolkits required)
  {
    title: "Creative Brainstorming",
    prompt:
      "Help me brainstorm creative ideas for my project with innovative approaches",
    toolkitIds: [],
    description: "Creative ideation and innovative thinking assistance",
  },
  {
    title: "Concept Explanation",
    prompt:
      "Explain a complex topic in simple terms with clear examples and analogies",
    toolkitIds: [],
    description: "Educational content and concept explanation",
  },
  {
    title: "Content Review & Feedback",
    prompt:
      "Review and improve my writing, code, or presentation with detailed feedback",
    toolkitIds: [],
    description: "Content review, optimization, and constructive feedback",
  },
  {
    title: "Strategic Planning",
    prompt:
      "Create a strategic plan or roadmap for achieving my goals with actionable steps",
    toolkitIds: [],
    description: "Strategic planning, goal setting, and execution roadmaps",
  },
  {
    title: "Problem Solving",
    prompt:
      "Help me solve a problem with creative solutions and analytical thinking",
    toolkitIds: [],
    description:
      "Problem-solving with innovative approaches and logical analysis",
  },
  {
    title: "Expert Consultation",
    prompt: "Provide expert advice and guidance on a topic I'm working on",
    toolkitIds: [],
    description: "Professional consultation and expert guidance",
  },
];

export const StarterPrompts = () => {
  const { append, toolkits } = useChatContext();

  // Get currently selected toolkit IDs
  const selectedToolkitIds = useMemo(() => {
    return new Set(toolkits.map((t) => t.id));
  }, [toolkits]);

  // Filter and sort prompts based on selected toolkits
  const relevantPrompts = useMemo(() => {
    if (selectedToolkitIds.size === 0) {
      // If no toolkits selected, show generic prompts
      return DYNAMIC_STARTER_PROMPTS.filter(
        (prompt) => prompt.toolkitIds.length === 0,
      ).slice(0, 4);
    }

    // Score prompts based on how many of their required toolkits are selected
    const scoredPrompts = DYNAMIC_STARTER_PROMPTS.map((prompt) => {
      const matchingToolkits = prompt.toolkitIds.filter((id) =>
        selectedToolkitIds.has(id),
      ).length;

      const totalRequired = prompt.toolkitIds.length;

      // Only include prompts where ALL required toolkits are available
      if (totalRequired === 0 || matchingToolkits === totalRequired) {
        return {
          ...prompt,
          score: matchingToolkits, // Higher score for more toolkit usage
          matchingToolkits,
        };
      }

      return null;
    }).filter(Boolean) as Array<
      StarterPrompt & { score: number; matchingToolkits: number }
    >;

    // Sort by score (descending) - prompts using more toolkits come first
    scoredPrompts.sort((a, b) => b.score - a.score);

    // Take top 4-6 prompts, ensuring variety
    const selectedPrompts = [];
    const usedScores = new Set<number>();

    for (const prompt of scoredPrompts) {
      if (selectedPrompts.length >= 6) break;

      // Try to include prompts with different scores for variety
      if (!usedScores.has(prompt.score) || selectedPrompts.length < 4) {
        selectedPrompts.push(prompt);
        usedScores.add(prompt.score);
      }
    }

    return selectedPrompts.slice(0, 4);
  }, [selectedToolkitIds]);

  const handlePromptClick = (prompt: string) => {
    void append({
      role: "user",
      content: prompt,
    });
  };

  if (relevantPrompts.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="from-background absolute top-0 left-0 z-10 hidden h-full w-4 bg-gradient-to-r to-transparent md:block" />
      <div className="no-scrollbar flex max-w-full flex-col gap-2 overflow-x-auto px-4 md:flex-row">
        {relevantPrompts.map((prompt, index) => (
          <motion.button
            key={`${prompt.title}-${selectedToolkitIds.size}`} // Key includes toolkit state for proper re-animation
            initial={{ opacity: 0, height: "auto" }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              enter: { delay: 0.1 + index * 0.1 },
              exit: { delay: 0, duration: 0.1 },
            }}
            onClick={() => handlePromptClick(prompt.prompt)}
            className="hover:bg-muted/80 text-muted-foreground hover:text-foreground group relative rounded-xl border p-2 text-left text-sm transition-colors"
            title={prompt.description}
          >
            <HStack className="gap-2 overflow-hidden">
              <ToolkitIcons toolkits={prompt.toolkitIds} />
              <p className="flex-1 truncate text-sm leading-relaxed whitespace-nowrap">
                {prompt.title}
              </p>
            </HStack>
          </motion.button>
        ))}
      </div>
      <div className="from-background absolute top-0 right-0 z-10 hidden h-full w-4 bg-gradient-to-l to-transparent md:block" />
    </div>
  );
};
