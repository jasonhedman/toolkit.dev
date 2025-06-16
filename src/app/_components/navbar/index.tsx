import { Logo } from "@/components/ui/logo";

import { AccountButton } from "./account-button";
import { ColorModeToggle } from "./color-mode-toggle";
import { HStack } from "@/components/ui/stack";

export const Navbar = () => {
  return (
    <HStack className="bg-background sticky top-0 z-10 justify-between p-2 md:hidden">
      <HStack>
        <Logo className="size-6" />
        <h1 className="text-primary overflow-hidden text-lg font-bold whitespace-nowrap">
          Toolkit.dev
        </h1>
      </HStack>
      <HStack>
        <AccountButton />
        <ColorModeToggle />
      </HStack>
    </HStack>
  );
};
