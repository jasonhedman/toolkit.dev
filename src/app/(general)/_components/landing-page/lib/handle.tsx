import React from "react";

import { cn } from "@/lib/utils";

interface Props {
  side: "left" | "right" | "top" | "bottom";
  className?: string;
}

export const Handle = React.forwardRef<HTMLDivElement, Props>(
  ({ side, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "border-primary bg-card absolute z-[11] size-1 rounded-full border md:size-2",
          {
            "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2": side === "left",
            "top-1/2 right-0 translate-x-1/2 -translate-y-1/2":
              side === "right",
            "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2": side === "top",
            "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2":
              side === "bottom",
          },
          className,
        )}
      />
    );
  },
);
Handle.displayName = "Handle";
