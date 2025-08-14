"use client";

import { api } from "@/trpc/react";

export const useUpdateChatVisibility = () => {
  const utils = api.useUtils();

  return api.chats.updateChatVisibility.useMutation({
    onSuccess: async () => {
      await utils.chats.getChats.invalidate();
    },
  });
};
