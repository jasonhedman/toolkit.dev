import type { ClientToolkitWrapper } from "@/toolkits/types";

export const TwitterWrapper: ClientToolkitWrapper = ({ Item }) => {
  return <Item isLoading={false} />;
};
