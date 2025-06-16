import { headers } from "next/headers";

export const getCurrentPath = async (): Promise<string> => {
  const headersList = await headers();
  return headersList.get("x-current-path") ?? "/";
};
