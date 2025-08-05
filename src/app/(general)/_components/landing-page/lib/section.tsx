import { cn } from "@/lib/utils";
import React from "react";
import type { SECTIONS } from "../sections";

interface Props {
  id: (typeof SECTIONS)[keyof typeof SECTIONS];
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<Props> = ({ id, className, children }) => {
  return (
    <section id={id} className={cn("px-2 py-16 md:px-16 md:py-16", className)}>
      {children}
    </section>
  );
};
