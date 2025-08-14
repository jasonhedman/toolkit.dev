import * as React from "react";

import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";

import { NavMain } from "./main";
import { NavChats } from "./chats";
import { NavUser } from "./user";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { HStack, VStack } from "@/components/ui/stack";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { WorkbenchSelect } from "./workbench-select";
import { InstallPrompt } from "./install-prompt";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [session] = await Promise.all([auth()]);

  if (!session) {
    return null;
  }

  if (session?.user) {
    void api.workbenches.getWorkbenches.prefetchInfinite({
      limit: 10,
    });
  }

  return (
    <HydrateClient>
      <Sidebar collapsible="icon" className="relative" {...props}>
        <SidebarHeader className="border-sidebar-border border-b p-3 group-data-[collapsible=icon]:p-2">
          <Link
            href="/"
            className="hover:bg-sidebar-accent/50 rounded-lg p-2 transition-colors group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
          >
            <HStack className="items-center group-data-[collapsible=icon]:justify-center">
              <Logo className="size-6 group-data-[collapsible=icon]:mx-auto" />
              <h1 className="shimmer-text overflow-hidden text-xl font-bold whitespace-nowrap group-data-[collapsible=icon]:hidden">
                Toolkit.dev
              </h1>
            </HStack>
          </Link>
          <div className="mt-2 group-data-[collapsible=icon]:mt-1">
            <WorkbenchSelect />
          </div>
        </SidebarHeader>
        <SidebarContent className="gap-0 pt-2">
          <NavMain />
          <NavChats />
        </SidebarContent>
        <SidebarFooter className="flex flex-col gap-2 p-3 group-data-[collapsible=icon]:p-2">
          <div className="group-data-[collapsible=icon]:hidden">
            <InstallPrompt />
          </div>
          <SidebarMenuButton
            asChild
            className="hover:bg-sidebar-accent/50 h-fit w-full rounded-lg p-2 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
          >
            <Link
              href="https://github.com/jasonhedman/toolkit.dev"
              target="_blank"
              className="flex items-center gap-3 px-3 transition-all group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
            >
              <SiGithub className="text-sidebar-accent-foreground !size-6 group-data-[collapsible=icon]:mx-auto" />
              <VStack className="items-start gap-0 overflow-hidden transition-all group-data-[collapsible=icon]:w-0">
                <h3 className="shimmer-text text-sidebar-foreground truncate font-medium">
                  Contribute
                </h3>
                <p className="text-sidebar-muted-foreground truncate text-xs">
                  Join the toolkit developers!
                </p>
              </VStack>
            </Link>
          </SidebarMenuButton>
          <NavUser
            user={{
              name: session.user.name ?? "User",
              email: session.user.email ?? "",
              avatar: session.user.image ?? "",
            }}
          />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </HydrateClient>
  );
}
