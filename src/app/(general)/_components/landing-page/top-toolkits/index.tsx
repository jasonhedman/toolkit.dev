import { api } from "@/trpc/server";

import { Section } from "../lib/section";
import { MiniHeading } from "../lib/heading";

import { ToolkitCard } from "./toolkit-card";

import { SECTIONS } from "../sections";

import type { Toolkits as ToolkitNames } from "@/toolkits/toolkits/shared";

export const TopToolkitsSection = async () => {
  const topToolkits = await api.tools.getTopToolkits();

  return (
    <Section id={SECTIONS.TopToolkits} className="p-0 md:p-0">
      <MiniHeading title="Top Toolkits" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {topToolkits.slice(0, 6).map((toolkit) => (
          <ToolkitCard
            key={toolkit.id}
            toolkit={toolkit.id as ToolkitNames}
            count={toolkit.totalUsage}
          />
        ))}
      </div>
    </Section>
  );
};
