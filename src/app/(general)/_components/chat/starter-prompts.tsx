"use client";

import { motion } from "motion/react";
import { useChatContext } from "@/app/(general)/_contexts/chat-context";
import { Toolkits } from "@/toolkits/toolkits/shared";
import { useMemo } from "react";
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
    title: "Analyze Toolkit.dev",
    prompt:
      "Search GitHub for jasonhedman/toolkit.dev, analyze the repo, clone the repo and read the readme in a sandbox environment, and give me a getting started guide.",
    toolkitIds: [Toolkits.Github, Toolkits.E2B, Toolkits.Exa],
    description:
      "Complete React/Next.js analysis: repository discovery, component execution, architecture visualization, and pattern learning",
  },
  {
    title: "AI/ML Competitive Intelligence",
    prompt:
      "Research competitors' AI approaches (LLM fine-tuning, RAG systems, vector databases), analyze their GitHub repositories for ML pipelines and model architectures, generate comparison charts, and store findings for future reference",
    toolkitIds: [
      Toolkits.Exa,
      Toolkits.Github,
      Toolkits.Image,
      Toolkits.Memory,
    ],
    description:
      "AI/ML competitive analysis with model architecture review, visualization, and strategic insights",
  },
  {
    title: "Transformer Architecture Research Pipeline",
    prompt:
      "Search for research papers on transformer architectures and attention mechanisms, find GitHub implementations of BERT/GPT variants, test model performance with Python execution, create architecture comparison visualizations, and store key insights",
    toolkitIds: [
      Toolkits.Exa,
      Toolkits.Github,
      Toolkits.E2B,
      Toolkits.Image,
      Toolkits.Memory,
    ],
    description:
      "Complete AI research workflow: paper discovery, implementation analysis, model testing, and knowledge retention",
  },
  {
    title: "Full-Stack Documentation Generator",
    prompt:
      "Analyze my Notion API documentation and database schemas, search for similar FastAPI/Django REST implementations on GitHub, generate API architecture diagrams, and create comprehensive technical specifications with memory of project context",
    toolkitIds: [
      Toolkits.Notion,
      Toolkits.Github,
      Toolkits.Image,
      Toolkits.Memory,
    ],
    description:
      "API documentation automation with implementation examples, visual diagrams, and contextual memory",
  },

  // Multi-toolkit prompts (3 toolkits)
  {
    title: "Computer Vision Algorithm Implementation",
    prompt:
      "Search for research papers on object detection and image segmentation, find PyTorch/OpenCV implementations on GitHub, and benchmark performance with Python execution",
    toolkitIds: [Toolkits.Exa, Toolkits.Github, Toolkits.E2B],
    description:
      "CV research-to-implementation pipeline with performance benchmarking",
  },
  {
    title: "Microservices Architecture Visualization",
    prompt:
      "Analyze GitHub repositories with Docker/Kubernetes microservices architectures, execute container orchestration scripts to understand deployment flow, and generate system architecture diagrams",
    toolkitIds: [Toolkits.Github, Toolkits.E2B, Toolkits.Image],
    description:
      "Microservices analysis with deployment testing and visual architecture mapping",
  },
  {
    title: "AI/ML Framework Knowledge Bank",
    prompt:
      "Research emerging ML frameworks (LangChain, Hugging Face Transformers, MLflow), analyze trending PyTorch/TensorFlow projects, and build a persistent knowledge base of implementation patterns",
    toolkitIds: [Toolkits.Exa, Toolkits.Github, Toolkits.Memory],
    description:
      "ML technology scouting with repository analysis and pattern retention",
  },
  {
    title: "Web Performance Analysis Dashboard",
    prompt:
      "Extract performance metrics from my Notion project tracking (Core Web Vitals, bundle sizes, API response times), run statistical analysis with Python, and generate performance visualization charts",
    toolkitIds: [Toolkits.Notion, Toolkits.E2B, Toolkits.Image],
    description:
      "Web performance analysis with computational processing and visualization",
  },
  {
    title: "JavaScript Framework Comparison Engine",
    prompt:
      "Research current JavaScript framework trends (React vs Vue vs Svelte), analyze popular GitHub repositories for each framework, and create visual technology comparison charts",
    toolkitIds: [Toolkits.Exa, Toolkits.Github, Toolkits.Image],
    description:
      "Frontend framework research with repository analysis and comparative visualization",
  },
  {
    title: "ML Design Pattern Recognition",
    prompt:
      "Analyze GitHub repositories for machine learning design patterns (MLOps pipelines, model serving, data preprocessing), execute code examples, and remember successful patterns for future ML projects",
    toolkitIds: [Toolkits.Github, Toolkits.E2B, Toolkits.Memory],
    description:
      "ML pattern analysis with code execution and persistent learning",
  },
  {
    title: "Web API Project Documentation",
    prompt:
      "Search GitHub for similar REST API and GraphQL implementations, create technical documentation in Notion for authentication and data modeling, and remember key architectural decisions",
    toolkitIds: [Toolkits.Github, Toolkits.Notion, Toolkits.Memory],
    description:
      "API documentation with implementation research and decision tracking",
  },
  {
    title: "AI Framework & Library Research",
    prompt:
      "Research latest AI/ML libraries (Anthropic SDK, OpenAI API, vector databases like Pinecone), analyze their GitHub repositories for implementation examples, and document findings in Notion",
    toolkitIds: [Toolkits.Exa, Toolkits.Github, Toolkits.Notion],
    description:
      "AI library research with implementation analysis and structured documentation",
  },

  // Two-toolkit prompts - High Value Technical Combinations
  {
    title: "React Component Deep Dive",
    prompt:
      "Search for advanced React repositories (state management with Zustand/Redux, custom hooks, performance optimization), then execute and analyze component patterns to understand implementation details",
    toolkitIds: [Toolkits.Github, Toolkits.E2B],
    description:
      "React component discovery with hands-on code analysis and execution",
  },
  {
    title: "LLM Fine-tuning Research",
    prompt:
      "Find research papers on large language model fine-tuning techniques (LoRA, QLoRA, RLHF), then implement and test the training algorithms using Python with PyTorch",
    toolkitIds: [Toolkits.Exa, Toolkits.E2B],
    description:
      "LLM research with practical fine-tuning implementation and testing",
  },
  {
    title: "System Architecture Diagram Generator",
    prompt:
      "Analyze GitHub repositories with modern web architectures (Next.js + Prisma + tRPC, FastAPI + PostgreSQL), then generate clean architecture diagrams and data flow charts",
    toolkitIds: [Toolkits.Github, Toolkits.Image],
    description:
      "Web architecture analysis with professional diagram generation",
  },
  {
    title: "Frontend Performance Intelligence",
    prompt:
      "Research web performance optimization techniques (code splitting, lazy loading, CDN strategies), then analyze high-performance GitHub repositories for implementation patterns",
    toolkitIds: [Toolkits.Exa, Toolkits.Github],
    description:
      "Performance research combined with real-world implementation analysis",
  },
  {
    title: "ML Pipeline Visualization",
    prompt:
      "Execute machine learning pipelines (data preprocessing, model training, evaluation metrics) with Python and generate professional ML workflow diagrams and result visualizations",
    toolkitIds: [Toolkits.E2B, Toolkits.Image],
    description: "ML pipeline execution with publication-ready visualizations",
  },
  {
    title: "Web Development Pattern Memory",
    prompt:
      "Analyze GitHub repositories for modern web development patterns (authentication with NextAuth, API design with tRPC, database patterns with Prisma), storing insights for future projects",
    toolkitIds: [Toolkits.Github, Toolkits.Memory],
    description:
      "Web development pattern learning with persistent knowledge retention",
  },
  {
    title: "AI Technology Trend Visualization",
    prompt:
      "Research emerging AI technologies (multimodal models, agent frameworks, retrieval-augmented generation), then create comprehensive infographics and trend analysis charts",
    toolkitIds: [Toolkits.Exa, Toolkits.Image],
    description:
      "AI technology research with professional visual trend analysis",
  },
  {
    title: "Developer Tool Knowledge Base",
    prompt:
      "Research modern development tools and practices (CI/CD with GitHub Actions, testing with Playwright, deployment with Vercel), then organize findings in Notion engineering documentation",
    toolkitIds: [Toolkits.Exa, Toolkits.Notion],
    description: "DevOps research with structured knowledge organization",
  },
  {
    title: "Web Project Analysis Dashboard",
    prompt:
      "Extract project metrics from Notion workspace (sprint velocity, bug counts, feature completion rates) and perform statistical analysis to identify development bottlenecks and optimization opportunities",
    toolkitIds: [Toolkits.Notion, Toolkits.E2B],
    description: "Development project analysis with computational insights",
  },
  {
    title: "Schedule Engineering Meeting",
    prompt:
      "Find my soonest available time to meet with my engineering team, and schedule a meeting with them.",
    toolkitIds: [Toolkits.Notion, Toolkits.GoogleCalendar],
    description: "Schedule a meeting with my engineering team",
  },
  {
    title: "AI Research Memory Bank",
    prompt:
      "Research cutting-edge AI developments (foundation models, prompt engineering techniques, AI safety research), storing detailed insights and findings for future reference and decision-making",
    toolkitIds: [Toolkits.Exa, Toolkits.Memory],
    description: "AI technology scouting with persistent strategic knowledge",
  },
  {
    title: "Technical Specification Visualization",
    prompt:
      "Analyze my Notion technical specifications and API documentation, creating visual system diagrams and storing key architectural insights for future reference",
    toolkitIds: [Toolkits.Notion, Toolkits.Image],
    description: "Technical documentation with visual specification creation",
  },
  {
    title: "Engineering Decision Memory",
    prompt:
      "Analyze my Notion engineering notes and architectural decision records (ADRs), remembering key technical choices and trade-offs for future architectural discussions",
    toolkitIds: [Toolkits.Notion, Toolkits.Memory],
    description: "Technical decision tracking with persistent context building",
  },

  // Single-toolkit prompts - Core Technical Tools
  {
    title: "Advanced GitHub Code Analysis",
    prompt:
      "Perform deep analysis of React/Next.js repositories, Node.js APIs, or Python ML projects - search for specific implementations, analyze commit patterns, and discover trending projects in modern web and AI development",
    toolkitIds: [Toolkits.Github],
    description: "Comprehensive repository analysis for web and AI development",
  },
  {
    title: "Python Development Environment",
    prompt:
      "Execute Python code for web scraping with BeautifulSoup, ML model training with scikit-learn/PyTorch, API testing with requests, data analysis with pandas, or algorithm implementation with full execution environment",
    toolkitIds: [Toolkits.E2B],
    description:
      "Full Python development environment for web and AI development",
  },
  {
    title: "Technical Research Intelligence",
    prompt:
      "Research web development trends (Server Components, edge computing, JAMstack), AI/ML breakthroughs (transformer architectures, prompt engineering), technical blogs, and competitive analysis with comprehensive search",
    toolkitIds: [Toolkits.Exa],
    description:
      "Advanced technical research for web and AI development trends",
  },
  {
    title: "Technical Visualization Studio",
    prompt:
      "Generate React component hierarchy diagrams, ML model architecture visualizations, API flow charts, database schema diagrams, system architecture blueprints, and technical presentation graphics",
    toolkitIds: [Toolkits.Image],
    description:
      "Professional technical visualization for web and AI architectures",
  },
  {
    title: "Engineering Knowledge System",
    prompt:
      "Store and retrieve technical insights about React patterns, ML model architectures, API design decisions, performance optimizations, and engineering context across conversations",
    toolkitIds: [Toolkits.Memory],
    description:
      "Persistent technical knowledge management for web and AI development",
  },
  {
    title: "Notion Engineering Workspace",
    prompt:
      "Analyze Notion databases with project specifications, API documentation, technical requirements, code review notes, and engineering documentation to extract insights and organize technical knowledge",
    toolkitIds: [Toolkits.Notion],
    description:
      "Technical workspace analysis and engineering documentation management",
  },

  // Generic prompts for technical audience
  {
    title: "React/Next.js Architecture Design",
    prompt:
      "Design scalable React/Next.js application architecture with TypeScript, state management (Zustand/Redux), API layer (tRPC/GraphQL), database design (Prisma/Drizzle), and deployment considerations (Vercel/AWS)",
    toolkitIds: [],
    description:
      "Complete React/Next.js system design with modern best practices",
  },
  {
    title: "ML Algorithm Optimization",
    prompt:
      "Analyze machine learning algorithm complexity, suggest model optimizations, review neural network architectures, and provide performance improvement recommendations for training and inference",
    toolkitIds: [],
    description:
      "ML algorithm analysis with performance optimization and architecture assessment",
  },
  {
    title: "Full-Stack Code Review",
    prompt:
      "Comprehensive code review for React/Node.js applications or Python ML projects focusing on design patterns, performance, security, maintainability, and modern best practices",
    toolkitIds: [],
    description:
      "Professional code review with architectural and performance insights",
  },
  {
    title: "API Design & Documentation",
    prompt:
      "Design RESTful APIs or GraphQL schemas with FastAPI/Express/tRPC, including proper documentation, error handling, authentication (JWT/OAuth), rate limiting, and versioning strategies",
    toolkitIds: [],
    description:
      "Complete API design with modern authentication and documentation",
  },
  {
    title: "Database & ML Data Pipeline Design",
    prompt:
      "Design efficient database schemas (PostgreSQL/MongoDB), optimize queries, plan migrations, design ML data pipelines (ETL/ELT), and recommend indexing strategies for web and AI applications",
    toolkitIds: [],
    description:
      "Database and ML data architecture with performance optimization",
  },
  {
    title: "Modern DevOps & MLOps Planning",
    prompt:
      "Plan CI/CD pipelines (GitHub Actions), containerization (Docker/Kubernetes), cloud infrastructure (AWS/Vercel), monitoring (DataDog), ML model deployment, and automation for production systems",
    toolkitIds: [],
    description:
      "Complete DevOps and MLOps strategy with modern infrastructure",
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
      <div className="from-background absolute top-0 left-0 z-10 block h-full w-2 bg-gradient-to-r to-transparent md:w-4" />
      <div className="no-scrollbar flex max-w-full flex-row gap-2 overflow-x-auto px-2 md:px-4">
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
            className="hover:bg-muted/80 text-muted-foreground hover:text-foreground group relative cursor-pointer rounded-xl border px-2 py-1 text-left text-sm transition-colors md:p-2"
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
      <div className="from-background absolute top-0 right-0 z-10 h-full w-2 bg-gradient-to-l to-transparent md:w-4" />
    </div>
  );
};
