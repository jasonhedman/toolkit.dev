import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

import {
  chatsRouter,
  filesRouter,
  messagesRouter,
  modelsRouter,
  streamsRouter,
  usersRouter,
  accountsRouter,
  imagesRouter,
  memoriesRouter,
  featuresRouter,
  workbenchesRouter,
} from "./routers";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  chats: chatsRouter,
  messages: messagesRouter,
  streams: streamsRouter,
  models: modelsRouter,
  files: filesRouter,
  users: usersRouter,
  accounts: accountsRouter,
  images: imagesRouter,
  memories: memoriesRouter,
  features: featuresRouter,
  workbenches: workbenchesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
