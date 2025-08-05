import React from "react";

import { Section } from "../lib/section";
import { Heading } from "../lib/heading";

import { WorkbenchForm } from "./workbench-form";

import { SECTIONS } from "../sections";

export const WorkbenchSection: React.FC = () => {
  return (
    <Section id={SECTIONS.Workbench}>
      <Heading
        title={["Configure Custom", "Workbenches"]}
        description="Combine multiple toolkits with specialized system prompts to create a tailored AI assistant."
      />
      <WorkbenchForm />
    </Section>
  );
};
