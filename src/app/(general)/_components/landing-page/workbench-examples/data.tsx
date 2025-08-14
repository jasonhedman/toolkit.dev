import { Toolkits } from "@/toolkits/toolkits/shared";
import type { WorkbenchExample } from "./types";
import { BarChart3, Code, Briefcase } from "lucide-react";

export const workbenchExamples: WorkbenchExample[] = [
  {
    title: "Repo Researcher",
    systemPrompt:
      "Find the latest trending repositories each day, research the company behind each, and store a writeup in my Notion database.",
    toolkits: [Toolkits.Exa, Toolkits.Github, Toolkits.Notion],
    icon: Code,
  },
  {
    title: "Data Analyst",
    systemPrompt:
      "Collects financial data on provided tickers from Yahoo Finance, calculates trends, and stores visualizations in my Google Drive.",
    toolkits: [Toolkits.E2B, Toolkits.Memory, Toolkits.GoogleDrive],
    icon: BarChart3,
  },
  {
    title: "Project Manager",
    systemPrompt:
      "Find availability on my Google Calendar to meet with the members of my Notion Workspace.",
    toolkits: [Toolkits.GoogleCalendar, Toolkits.Notion, Toolkits.Memory],
    icon: Briefcase,
  },
];
