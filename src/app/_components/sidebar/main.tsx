"use client";

import Link from "next/link";

import { Edit } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export const NavMain = () => {
  const pathname = usePathname();

  const workbenchId =
    pathname.split("/")[2] === "new" ? undefined : pathname.split("/")[2];

  const items = [
    {
      title: "New Chat",
      url: workbenchId ? `/workbench/${workbenchId}` : "/",
      icon: Edit,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton key={item.title} tooltip={item.title} asChild>
              <Link href={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
