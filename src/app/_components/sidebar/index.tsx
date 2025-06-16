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
import { getCurrentPath } from "@/lib/current-path";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [session, currentPath] = await Promise.all([auth(), getCurrentPath()]);

  if (!session || currentPath === "/onboarding") {
    return null;
  }

  const workbenchId =
    currentPath.split("/")[2] === "new" ? undefined : currentPath.split("/")[2];

  if (session?.user) {
    void api.chats.getChats.prefetchInfinite({
      limit: 10,
      workbenchId,
    });
    void api.workbenches.getWorkbenches.prefetchInfinite({
      limit: 10,
    });
  }

  return (
    <HydrateClient>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="border-b">
          <Link href="/">
            <HStack className="p-2">
              <Logo className="size-6" />
              <h1 className="overflow-hidden text-xl font-bold whitespace-nowrap group-data-[collapsible=icon]:hidden">
                <span className="text-primary">Toolkit.dev</span>
              </h1>
            </HStack>
          </Link>
          <WorkbenchSelect />
        </SidebarHeader>
        <SidebarContent className="gap-0 pt-2">
          <NavMain />
          <NavChats />
        </SidebarContent>
        <SidebarFooter className="flex flex-col gap-0">
          <NavUser
            user={{
              name: session.user.name ?? "User",
              email: session.user.email ?? "",
              avatar: session.user.image ?? "",
            }}
          />
          <SidebarMenuButton asChild className="h-fit w-full">
            <Link
              href="https://github.com/jasonhedman/open-chat"
              target="_blank"
            >
              <HStack>
                <SiGithub className="size-8" />
                <VStack className="items-start gap-0">
                  <h3 className="font-medium">Contribute</h3>
                  <p className="text-[10px]">
                    Looking for more toolkit developers!
                  </p>
                </VStack>
              </HStack>
            </Link>
          </SidebarMenuButton>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </HydrateClient>
  );
}
