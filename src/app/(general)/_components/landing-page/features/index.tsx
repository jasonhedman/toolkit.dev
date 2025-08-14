import React from "react";

import { Section } from "../lib/section";
import { MiniHeading } from "../lib/heading";

import {
  FeatureCard,
  FeatureCardDescription,
  FeatureCardTitle,
  FeatureCardFooter,
  FeatureCardComponent,
} from "./feature-card";

import { AnyModel } from "./features/any-model";
import { ToggleTools } from "./features/toggle-tools";
import { GenerativeUI } from "./features/generative-ui";
import { Workbenches } from "./features/workbenches";

import { cn } from "@/lib/utils";

import { SECTIONS } from "../sections";

export const FeaturesSection: React.FC = () => {
  return (
    <div>
      <MiniHeading title="The Product" className="border-b" />
      <Section id={SECTIONS.Features} className="p-0 md:p-0">
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4")}>
          {/* Toggle Tools */}
          <FeatureCard>
            <FeatureCardComponent>
              <ToggleTools />
            </FeatureCardComponent>
            <FeatureCardFooter>
              <FeatureCardTitle>Mix-and-Match Tools</FeatureCardTitle>
              <FeatureCardDescription>
                Mix and match toolkits to create your own custom agent
              </FeatureCardDescription>
            </FeatureCardFooter>
          </FeatureCard>
          {/* Get Paid */}
          <FeatureCard>
            <FeatureCardComponent>
              <Workbenches />
            </FeatureCardComponent>
            <FeatureCardFooter>
              <FeatureCardTitle>Custom Workbenches</FeatureCardTitle>
              <FeatureCardDescription>
                Reusable toolkit + system prompt configurations
              </FeatureCardDescription>
            </FeatureCardFooter>
          </FeatureCard>
          {/* Generative UI */}
          <FeatureCard>
            <FeatureCardComponent>
              <GenerativeUI />
            </FeatureCardComponent>
            <FeatureCardFooter>
              <FeatureCardTitle>Generative UI</FeatureCardTitle>
              <FeatureCardDescription>
                Every tool has a content-rich display for observability
              </FeatureCardDescription>
            </FeatureCardFooter>
          </FeatureCard>
          {/* Any Model */}
          <FeatureCard>
            <FeatureCardComponent>
              <AnyModel />
            </FeatureCardComponent>
            <FeatureCardFooter>
              <FeatureCardTitle>Any Model</FeatureCardTitle>
              <FeatureCardDescription>
                Test your Toolkit configuration with the latest LLMs
              </FeatureCardDescription>
            </FeatureCardFooter>
          </FeatureCard>
        </div>
      </Section>
    </div>
  );
};
