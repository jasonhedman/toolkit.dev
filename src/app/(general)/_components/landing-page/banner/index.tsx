import React from "react";

import { HStack } from "@/components/ui/stack";
import { ScrollToSection } from "../lib/scroll-to-section";
import { SECTIONS } from "../sections";

export const Banner: React.FC = () => {
  return (
    <div className="bg-primary/10 border-primary/60 w-full border-y py-2 text-center text-xs md:text-sm">
      <HStack className="mx-auto w-fit">
        <span className="text-primary font-bold">
          $6,000 available for contributors
        </span>
        <ScrollToSection section={SECTIONS.Merit}>
          <span className="decoration-primary/60 decoration-1.5 hover:decoration-primary underline underline-offset-3 transition-all hover:cursor-pointer">
            Learn More
          </span>
        </ScrollToSection>
      </HStack>
    </div>
  );
};
