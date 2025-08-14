import type { Toolkits } from "@/toolkits/toolkits/shared";
import type { LucideIcon } from "lucide-react";

export interface WorkbenchExample {
  title: string;
  systemPrompt: string;
  toolkits: Toolkits[];
  icon: LucideIcon;
}
