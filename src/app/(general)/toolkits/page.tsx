import { Activity, KeyRound, Trophy, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToolkitIcon } from "@/components/toolkit/toolkit-icons";
import { HStack, VStack } from "@/components/ui/stack";

import { api } from "@/trpc/server";
import { clientToolkits } from "@/toolkits/toolkits/client";

import type { Toolkits } from "@/toolkits/toolkits/shared";

export const metadata = {
  title: "Toolkit Leaderboard | Toolkit.dev",
  description: "Most-used Toolkit.dev toolkits ranked by tool calls.",
};

const numberFormatter = new Intl.NumberFormat("en-US");

export default async function ToolkitLeaderboardPage() {
  const topToolkits = await api.tools.getTopToolkits();
  const rows = topToolkits.flatMap((toolkit) => {
    if (!toolkit.id || !(toolkit.id in clientToolkits)) {
      return [];
    }

    const id = toolkit.id as Toolkits;
    const clientToolkit = clientToolkits[id];

    return {
      id,
      name: clientToolkit.name,
      description: clientToolkit.description,
      group: clientToolkit.type,
      toolCount: Object.keys(clientToolkit.tools).length,
      envVarCount: getEnvVarCount(clientToolkit.envVars),
      totalUsage: toolkit.totalUsage,
    };
  });
  const maxUsage = Math.max(...rows.map((row) => row.totalUsage), 1);

  return (
    <main className="h-full overflow-y-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
        <VStack className="items-start gap-4">
          <Badge variant="glass" className="gap-1">
            <Trophy className="size-3" />
            Rankings
          </Badge>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-normal md:text-4xl">
              Toolkit leaderboard
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
              The most-used toolkits across Toolkit.dev, ranked by successful
              tool calls.
            </p>
          </div>
        </VStack>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Toolkit</TableHead>
                <TableHead>Group</TableHead>
                <TableHead className="min-w-44">Usage</TableHead>
                <TableHead>Tools</TableHead>
                <TableHead>Env</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground h-24 text-center"
                  >
                    No toolkit usage has been recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((toolkit, index) => {
                  const width = `${(toolkit.totalUsage / maxUsage) * 100}%`;

                  return (
                    <TableRow key={toolkit.id}>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <HStack className="gap-3">
                          <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full border">
                            <ToolkitIcon
                              toolkit={toolkit.id}
                              className="size-4"
                            />
                          </div>
                          <VStack className="items-start gap-0">
                            <span className="font-medium">{toolkit.name}</span>
                            <span className="text-muted-foreground max-w-96 truncate text-xs">
                              {toolkit.description}
                            </span>
                          </VStack>
                        </HStack>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {toolkit.group.replaceAll("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <VStack className="items-start gap-1">
                          <HStack className="text-sm">
                            <Activity className="size-3" />
                            <span>
                              {numberFormatter.format(toolkit.totalUsage)}
                            </span>
                          </HStack>
                          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                            <div
                              className="bg-primary h-full"
                              style={{ width }}
                            />
                          </div>
                        </VStack>
                      </TableCell>
                      <TableCell>
                        <HStack className="text-sm">
                          <Wrench className="size-3" />
                          <span>{toolkit.toolCount}</span>
                        </HStack>
                      </TableCell>
                      <TableCell>
                        <HStack className="text-sm">
                          <KeyRound className="size-3" />
                          <span>{toolkit.envVarCount}</span>
                        </HStack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}

function getEnvVarCount(envVars: (typeof clientToolkits)[Toolkits]["envVars"]) {
  return envVars.reduce((count, group) => count + group.keys.length, 0);
}
