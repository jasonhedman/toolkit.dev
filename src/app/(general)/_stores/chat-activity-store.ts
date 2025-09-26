"use client";

import { useSyncExternalStore } from "react";

const subscribers = new Set<() => void>();
const activeChats = new Map<string, boolean>();

const subscribe = (listener: () => void) => {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
};

const emit = () => {
  subscribers.forEach((listener) => listener());
};

export const setChatActivityStatus = (chatId: string, isActive: boolean) => {
  const previous = activeChats.get(chatId) ?? false;

  if (isActive) {
    activeChats.set(chatId, true);
  } else {
    activeChats.delete(chatId);
  }

  if (previous !== isActive) {
    emit();
  }
};

export const clearChatActivity = (chatId: string) => {
  if (!activeChats.has(chatId)) return;
  activeChats.delete(chatId);
  emit();
};

export const useChatActivity = (chatId: string) =>
  useSyncExternalStore(
    subscribe,
    () => activeChats.get(chatId) ?? false,
    () => false,
  );
