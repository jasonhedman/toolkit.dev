import { VStack } from "@/components/ui/stack";
import { cn } from "@/lib/utils";

export interface FeatureCardProps {
  children: React.ReactNode;
}

export const FeatureCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <VStack
      className={cn(
        "h-full gap-4 p-4 pt-8 md:pt-4",
        "border-b last:border-b-0",
        "md:odd:border-r md:nth-last-2:border-b-0",
        "xl:border-r xl:border-b-0 xl:last:border-r-0",
      )}
    >
      {children}
    </VStack>
  );
};

export const FeatureCardComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className={cn("flex w-full flex-1 items-center justify-start")}>
      {children}
    </div>
  );
};

export const FeatureCardFooter = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <VStack className="w-full items-start gap-0">{children}</VStack>;
};

export const FeatureCardTitle = ({ children }: { children: string }) => {
  return <h2 className="text-lg font-bold">{children}</h2>;
};

export const FeatureCardDescription = ({ children }: { children: string }) => {
  return <p className="text-muted-foreground/80 text-sm">{children}</p>;
};
