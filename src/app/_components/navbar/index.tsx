import Link from "next/link";

import { AccountButton } from "./account-button";
import { ColorModeToggle } from "./color-mode-toggle";
import { HStack } from "@/components/ui/stack";
import { auth } from "@/server/auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme";
import { Menu } from "lucide-react";

export const Navbar = async () => {
  const session = await auth();

  if (!session) return null;

  return (
    <HStack className="bg-background sticky top-0 z-10 justify-between p-2 md:hidden">
      <HStack>
        <SidebarTrigger className="hover:bg-accent/50 rounded-lg p-2">
          <Menu className="size-4" />
        </SidebarTrigger>
        <Link href="/">
          <h1 className="overflow-hidden text-lg font-bold whitespace-nowrap">
            Toolkit.dev
          </h1>
        </Link>
      </HStack>
      <HStack>
        <AccountButton />
        <ThemeSwitcher />
        <ColorModeToggle />
      </HStack>
    </HStack>
  );
};
