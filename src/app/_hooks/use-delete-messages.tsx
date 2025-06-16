"use client";

import { api } from "@/trpc/react";

export const useDeleteMessagesAfterTimestamp = () => {
  const utils = api.useUtils();

  return api.messages.deleteMessagesAfterTimestamp.useMutation({
    onSuccess: async (_, { chatId }) => {
      await utils.messages.getMessagesForChat.invalidate({ chatId });
    },
  });
};
