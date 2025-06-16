"use client";

import { Suspense, useState } from "react";

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

import { api } from "@/trpc/react";
import { useDeleteChat } from "@/app/_hooks/use-delete-chat";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export const NavChats = () => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Chats</SidebarGroupLabel>
      <SidebarMenu>
        <Suspense fallback={<div>Loading...</div>}>
          <NavChatsBody />
        </Suspense>
      </SidebarMenu>
    </SidebarGroup>
  );
};

const NavChatsBody = () => {
  const pathname = usePathname();

  const [, type, resourceId] = pathname.split("/");

  const workbenchId =
    type === "workbench" && resourceId !== "new" ? resourceId : undefined;

  const { setOpenMobile } = useSidebar();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [chats, { fetchNextPage, hasNextPage, isFetchingNextPage }] =
    api.chats.getChats.useSuspenseInfiniteQuery(
      {
        limit: 10,
        workbenchId,
      },
      {
        getNextPageParam: (lastPage) =>
          lastPage.hasMore ? lastPage.nextCursor : undefined,
      },
    );

  const deleteChat = useDeleteChat();

  const handleDelete = () => {
    if (deleteId) {
      deleteChat.mutate(deleteId);
      setShowDeleteDialog(false);
    }
  };

  if (chats.pages.flatMap((page) => page.items).length === 0) {
    return (
      <div className="text-muted-foreground overflow-hidden px-2 text-sm whitespace-nowrap group-data-[collapsible=icon]:hidden">
        No chats yet.
      </div>
    );
  }

  return (
    <>
      {chats.pages.flatMap((page) =>
        page.items.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isActive={pathname.includes(chat.id)}
            onDelete={() => {
              setDeleteId(chat.id);
              setShowDeleteDialog(true);
            }}
            setOpenMobile={setOpenMobile}
          />
        )),
      )}
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
