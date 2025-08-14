import { BadgeDollarSign, Calendar, Rocket } from "lucide-react";

import { HStack } from "@/components/ui/stack";

import { Section } from "../lib/section";
import { SECTIONS } from "../sections";

export const RoadmapSection = () => {
  return (
    <Section id={SECTIONS.Roadmap} className="p-0 md:p-0">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <RoadmapItem
          title={["Bootstrap", "Now"]}
          description="Create a bulletproof chat interface and bootstrap our first 50 toolkits"
          items={[
            "Transition to Vercel AI SDK V5",
            "Migrate toolkit schema to be an MCP wrapper",
            "Create UI elements for the top 50 MCP servers",
          ]}
          Icon={Calendar}
        />
        <RoadmapItem
          title={["Monetize", "1 Month"]}
          description="Add monetization features to create a self-funding mechanism"
          items={[
            "Add subscriptions and usage-based billing",
            "Allow toolkit creators to charge for usage",
            "Create a marketplace for workbenchs",
          ]}
          Icon={BadgeDollarSign}
        />
        <RoadmapItem
          title={["Grow", "2 Months"]}
          description="Build attribution and analytics to reward the most valuable contributors"
          items={[
            "Granular insights on contributor toolkit impact",
            "Measure usage toolkit -> pay devs pro-rata",
            "Create an SDK for monetizing any MCP server",
          ]}
          Icon={Rocket}
        />
      </div>
    </Section>
  );
};

interface RoadmapItemProps {
  title: [string, string];
  description: string;
  items: string[];
  Icon: React.FC<{ className?: string }>;
}

const RoadmapItem: React.FC<RoadmapItemProps> = ({
  title,
  description,
  items,
  Icon,
}) => {
  return (
    <div className="flex flex-col gap-2 border-b p-2 last:border-b-0 md:border-r md:border-b-0 md:p-4 md:last:border-r-0">
      <HStack>
        <Icon className="size-4" />
        <h2 className="text-lg font-bold">
          {title[0]}{" "}
          <span className="text-muted-foreground/80 text-sm">({title[1]})</span>
        </h2>
      </HStack>
      <p className="text-sm">{description}</p>
      <ul className="list-disc pl-4 text-xs">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
};
