"use client";

import { api } from "@/trpc/react";

export const useStarChat = () => {
  const utils = api.useUtils();

  return api.chats.starChat.useMutation({
    onSuccess: async () => {
      await utils.chats.getChats.invalidate();
    },
  });
};
