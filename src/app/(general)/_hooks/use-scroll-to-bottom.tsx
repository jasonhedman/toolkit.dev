import { useRef, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type ScrollFlag = ScrollBehavior | false;

export function useScrollToBottom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: isAtBottom = false } = useQuery({
    queryKey: ["messages", "is-at-bottom"],
    queryFn: () => false,
    initialData: false,
  });

  const { data: scrollBehavior = false } = useQuery({
    queryKey: ["messages", "should-scroll"],
    queryFn: () => false as ScrollFlag,
    initialData: false,
  });

  useEffect(() => {
    if (scrollBehavior) {
      endRef.current?.scrollIntoView({ behavior: scrollBehavior });
      queryClient.setQueryData(["messages", "should-scroll"], false);
    }
  }, [queryClient, scrollBehavior]);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      queryClient.setQueryData(["messages", "should-scroll"], behavior);
    },
    [queryClient],
  );

  function onViewportEnter() {
    queryClient.setQueryData(["messages", "is-at-bottom"], true);
  }

  function onViewportLeave() {
    queryClient.setQueryData(["messages", "is-at-bottom"], false);
  }

  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  };
}
