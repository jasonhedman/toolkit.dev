import * as React from "react";

import Link from "next/link";

import {
  Sidebar,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/ui/logo";
import { HStack } from "@/components/ui/stack";
import { Settings, Wrench } from "lucide-react";

const routes = [
  {
    title: "Features",
    url: "/admin/features",
    Icon: Settings,
  },
  {
    title: "Toolkits",
    url: "/admin/toolkits",
    Icon: Wrench,
  },
];

export async function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
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
      </SidebarHeader>
      <SidebarGroup>
        <SidebarMenu>
          {routes.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton key={item.title} tooltip={item.title} asChild>
                <Link href={item.url}>
                  {item.Icon && <item.Icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarRail />
    </Sidebar>
  );
}
