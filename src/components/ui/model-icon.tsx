import { cn } from "@/lib/utils";
import type { Provider } from "@/ai/types";
import { modelIcons } from "@/app/_components/chat/input/model-select/utils";

interface Props {
  provider: Provider;
  className?: string;
}

export const ModelProviderIcon: React.FC<Props> = ({ provider, className }) => {
  const Icon = modelIcons[provider] ?? null;

  return Icon ? <Icon className={cn("size-4", className)} /> : null;
};
