import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

import {
  chatsRouter,
  filesRouter,
  messagesRouter,
  streamsRouter,
  usersRouter,
  accountsRouter,
  imagesRouter,
  memoriesRouter,
  featuresRouter,
  workbenchesRouter,
  toolkitsRouter,
  toolsRouter,
  creditsRouter,
  videosRouter,
} from "./routers";
import { IS_DEVELOPMENT } from "@/lib/constants";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  chats: chatsRouter,
  messages: messagesRouter,
  streams: streamsRouter,
  files: filesRouter,
  users: usersRouter,
  accounts: accountsRouter,
  images: imagesRouter,
  memories: memoriesRouter,
  features: featuresRouter,
  workbenches: workbenchesRouter,
  toolkits: toolkitsRouter,
  tools: toolsRouter,
  videos: videosRouter,
  ...(IS_DEVELOPMENT ? { credits: creditsRouter } : {}),
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

// Create server-side caller
export const createServerCaller = createCallerFactory(appRouter);

/**
 * Helper function to create a server caller with serverCall flag set to true
 * This ensures the caller can access server-only procedures
 */
export const createServerOnlyCaller = async () => {
  const session = await auth();
  return createServerCaller({
    headers: new Headers(),
    serverCall: true,
    db,
    session,
  });
};
