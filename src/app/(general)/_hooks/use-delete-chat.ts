"use client";

import { api } from "@/trpc/react";

export const useDeleteChat = () => {
  const utils = api.useUtils();

  return api.chats.deleteChat.useMutation({
    onSuccess: async () => {
      await utils.chats.getChats.invalidate();
    },
  });
};
