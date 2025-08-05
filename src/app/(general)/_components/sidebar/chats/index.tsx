"use client";

import { useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChatItem } from "./item";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useDeleteChat } from "@/app/(general)/_hooks/use-delete-chat";

export const NavChats = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [, type, resourceId] = pathname.split("/");
  const workbenchId =
    type === "workbench" && resourceId !== "new" ? resourceId : undefined;

  const { setOpenMobile, state } = useSidebar();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    data: chats,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = api.chats.getChats.useInfiniteQuery(
    {
      limit: 10,
      workbenchId: workbenchId ?? null,
    },
    {
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextCursor : undefined,
    },
  );

  const deleteChat = useDeleteChat();

  const handleDelete = () => {
    if (deleteId) {
      deleteChat.mutate(deleteId, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          router.push("/");
        },
      });
    }
  };

  const allChats = chats?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading || !chats || state === "collapsed") return null;

  const starredChats = allChats.filter((chat) => chat.starred);
  const regularChats = allChats.filter((chat) => !chat.starred);

  if (allChats.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Chats</SidebarGroupLabel>
        <SidebarMenu>
          <div className="text-muted-foreground px-3 py-2 text-xs">
            No chats yet.
          </div>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <>
      {starredChats.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Starred</SidebarGroupLabel>
          <SidebarMenu>
            {starredChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={pathname.endsWith(chat.id)}
                onDelete={(id) => {
                  setDeleteId(id);
                  setShowDeleteDialog(true);
                }}
                setOpenMobile={setOpenMobile}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}

      {regularChats.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarMenu>
            {regularChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={pathname.endsWith(chat.id)}
                onDelete={(id) => {
                  setDeleteId(id);
                  setShowDeleteDialog(true);
                }}
                setOpenMobile={setOpenMobile}
              />
            ))}
            {hasNextPage && (
              <Button
                onClick={() => void fetchNextPage()}
                variant="ghost"
                size="xs"
                className="text-accent-foreground/40 w-full justify-start"
              >
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </Button>
            )}
          </SidebarMenu>
        </SidebarGroup>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
