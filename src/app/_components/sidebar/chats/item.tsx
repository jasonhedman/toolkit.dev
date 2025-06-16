import { memo } from "react";

import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  Globe,
  Lock,
  MoreHorizontal,
  Share,
  Trash,
  GitBranch,
} from "lucide-react";
import { useUpdateChatVisibility } from "@/app/_hooks/use-chat-visibility";

import type { Chat } from "@prisma/client";

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  const updateChatVisibility = useUpdateChatVisibility();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={`/${chat.id}`} onClick={() => setOpenMobile(false)}>
          <div className="flex min-w-0 items-center gap-2">
            {chat.parentChatId && (
              <GitBranch className="text-muted-foreground size-3 shrink-0" />
            )}
            <span className="truncate">{chat.title}</span>
          </div>
        </Link>
      </SidebarMenuButton>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
            showOnHover={!isActive}
          >
            <MoreHorizontal />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex cursor-pointer items-center gap-2">
              <Share className="size-4" />
              <span>Share</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent sideOffset={8}>
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between"
                  onClick={() => {
                    updateChatVisibility.mutate({
                      id: chat.id,
                      visibility: "private",
                    });
                  }}
                >
                  <div className="flex flex-row items-center gap-2">
                    <Lock size={12} />
                    <span>Private</span>
                  </div>
                  {chat.visibility === "private" ? (
                    <Check className="size-4" />
                  ) : null}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between"
                  onClick={() => {
                    updateChatVisibility.mutate({
                      id: chat.id,
                      visibility: "public",
                    });
                  }}
                >
                  <div className="flex flex-row items-center gap-2">
                    <Globe />
                    <span>Public</span>
                  </div>
                  {chat.visibility === "public" ? (
                    <Check className="size-4" />
                  ) : null}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/15 focus:text-destructive cursor-pointer"
            onSelect={() => onDelete(chat.id)}
          >
            <Trash className="text-destructive size-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  return true;
});
