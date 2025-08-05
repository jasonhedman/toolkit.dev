import React from "react";

import { Section } from "../lib/section";
import { MiniHeading } from "../lib/heading";

import { WorkbenchCard } from "./card";

import { SECTIONS } from "../sections";

import { workbenchExamples } from "./data";

export const WorkbenchExamplesSection: React.FC = () => {
  return (
    <Section id={SECTIONS.WorkbenchExamples} className="p-0 md:p-0">
      <MiniHeading title="Workbench Examples" />
      <div className="container mx-auto border-t">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {workbenchExamples.map((workbench) => (
            <WorkbenchCard key={workbench.title} workbench={workbench} />
          ))}
        </div>
      </div>
    </Section>
  );
};
