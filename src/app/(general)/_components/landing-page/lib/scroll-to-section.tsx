"use client";

import { useCallback } from "react";

import type { SECTIONS } from "../sections";
import { cn } from "@/lib/utils";

export const useScrollToSection = () => {
  const scrollToSection = useCallback(
    (section: (typeof SECTIONS)[keyof typeof SECTIONS]) => {
      const element = document.getElementById(section);

      if (element) {
        const offset = 64;
        const currentScroll = window.scrollY;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + currentScroll - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    },
    [],
  );

  return { scrollToSection };
};

interface ScrollToSectionProps {
  section: (typeof SECTIONS)[keyof typeof SECTIONS];
  children: React.ReactNode;
  className?: string;
}

export const ScrollToSection = ({
  section,
  children,
  className,
}: ScrollToSectionProps) => {
  const { scrollToSection } = useScrollToSection();

  return (
    <span
      className={cn("cursor-pointer", className)}
      onClick={() => {
        scrollToSection(section);
      }}
    >
      {children}
    </span>
  );
};
