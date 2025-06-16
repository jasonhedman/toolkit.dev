import React from "react";
import { HStack, VStack } from "@/components/ui/stack";
import { Search } from "lucide-react";

interface ToolCallComponentProps {
  action: string;
  primaryText: string;
  secondaryText?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const ToolCallComponent: React.FC<ToolCallComponentProps> = ({
  action,
  primaryText,
  secondaryText,
  icon: Icon = Search,
}) => {
  return (
    <HStack className="gap-2">
      <Icon className="text-muted-foreground size-4" />
      <VStack className="items-start gap-0">
        <span className="text-muted-foreground text-xs font-medium">
          {action}
        </span>
        <span className="text-sm">{primaryText}</span>
        {secondaryText && (
          <span className="text-muted-foreground text-xs">{secondaryText}</span>
        )}
      </VStack>
    </HStack>
  );
};
