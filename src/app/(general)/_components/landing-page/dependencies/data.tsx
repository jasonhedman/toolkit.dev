import Image from "next/image";

import type { Dependency } from "./types";

// Project dependencies from package.json
export const dependenciesData = [
  // Core Framework & Libraries
  {
    name: "Next.js",
    url: "next.png",
  },
  {
    name: "Create T3 App",
    url: "t3.png",
  },
  {
    name: "React",
    url: "react.png",
  },
  {
    name: "AI SDK",
    url: "vercel.png",
  },

  // Authentication & Database
  {
    name: "NextAuth.js",
    url: "nextauth.png",
  },
  {
    name: "Prisma",
    url: "prisma.png",
  },
  {
    name: "Redis",
    url: "redis.png",
  },
  {
    name: "Postgres",
    url: "postgres.png",
  },

  // API & State Management
  {
    name: "tRPC",
    url: "tRPC.png",
  },
  {
    name: "TanStack",
    url: "tanstack.png",
  },
  {
    name: "Zod",
    url: "zod.png",
  },

  // UI Components & Styling
  {
    name: "Radix UI",
    url: "radix.png",
  },
  {
    name: "Lucide React",
    url: "lucide.png",
  },
  {
    name: "Motion",
    url: "motion.png",
  },
  {
    name: "Shadcn/UI",
    url: "shadcn.png",
  },
  {
    name: "E2B",
    url: "e2b.png",
  },
  {
    name: "Mem0",
    url: "mem0.png",
  },
  {
    name: "Recharts",
  },
  {
    name: "Sonner",
  },
];

export const dependencies: Dependency[] = dependenciesData.map(
  (dependency) => ({
    name: dependency.name,
    icon: dependency.url ? (
      <Image
        src={`/icons/${dependency.url}`}
        alt={dependency.name}
        width={32}
        height={32}
        className="size-6 rounded-lg"
      />
    ) : null,
  }),
);
