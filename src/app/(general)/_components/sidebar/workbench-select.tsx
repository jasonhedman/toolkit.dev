"use client";

import * as React from "react";
import { Anvil, ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { api } from "@/trpc/react";
import { usePathname } from "next/navigation";
import { ToolkitIcons } from "@/components/toolkit/toolkit-icons";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/stack";
import { cn } from "@/lib/utils";

export function WorkbenchSelect() {
  const { isMobile, open } = useSidebar();

  const pathname = usePathname();

  const workbenchId = pathname.split("/")[2];

  const [
    workbenches,
    { isLoading, fetchNextPage, hasNextPage, isFetchingNextPage },
  ] = api.workbenches.getWorkbenches.useSuspenseInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextCursor : undefined,
    },
  );

  const isWorkbench =
    pathname.startsWith("/workbench/") && workbenchId !== "new";
  const workbench = workbenches.pages[0]?.items.find(
    (workbench) => workbench.id === workbenchId,
  );

  return (
    <SidebarGroup className="p-0">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className={cn(
                  "bg-sidebar-accent text-sidebar-accent-foreground cursor-pointer transition-all duration-200 ease-in-out",
                  open
                    ? "justify-between"
                    : "min-h-[2.5rem] justify-center px-2",
                )}
              >
                {open ? (
                  <>
                    <HStack className="min-w-0 flex-1 gap-2">
                      <Anvil className="size-4 flex-shrink-0" />
                      <span className="truncate">
                        {isWorkbench
                          ? isLoading
                            ? "Loading..."
                            : workbench?.name
                          : "Default Workbench"}
                      </span>
                    </HStack>
                    <ChevronsUpDown className="ml-auto size-4 flex-shrink-0" />
                  </>
                ) : (
                  <Anvil className="size-4" />
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Workbenches
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2" asChild>
                <Link href="/">
                  <span className="truncate font-medium">
                    Default Workbench
                  </span>
                </Link>
              </DropdownMenuItem>
              {workbenches.pages
                .flatMap((page) => page.items)
                .map((workbench) => (
                  <DropdownMenuItem
                    key={workbench.id}
                    className="justify-between gap-2 p-2"
                    asChild
                  >
                    <Link
                      href={`/workbench/${workbench.id}`}
                      key={workbench.id}
                    >
                      <span className="truncate font-medium">
                        {workbench.name}
                      </span>
                      <ToolkitIcons
                        toolkits={workbench.toolkitIds as Toolkits[]}
                        iconClassName="size-3"
                        iconContainerClassName="p-1"
                      />
                    </Link>
                  </DropdownMenuItem>
                ))}
              {hasNextPage && (
                <DropdownMenuItem className="gap-2 p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? "Loading..." : "Load more"}
                  </Button>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <Link href="/workbench/new">
                <DropdownMenuItem className="gap-2 p-2">
                  <Plus className="size-4" />
                  <div className="text-muted-foreground font-medium">
                    New Workbench
                  </div>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
