import { Activity, Bot, Database, Gauge, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HStack, VStack } from "@/components/ui/stack";
import { api } from "@/trpc/server";

export const metadata = {
  title: "Model Usage Leaderboard | Toolkit.dev",
  description:
    "Most-used language models across Toolkit.dev assistant messages.",
};

const numberFormatter = new Intl.NumberFormat("en-US");

export default async function ModelUsageLeaderboardPage() {
  const { models, totalMessages } = await api.messages.getTopModelUsage({
    limit: 50,
  });
  const maxCount = Math.max(...models.map((model) => model.count), 1);

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
              Model usage leaderboard
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
              The most-used assistant models, ranked by messages generated in
              Toolkit.dev.
            </p>
          </div>
          <HStack className="text-muted-foreground gap-2 text-sm">
            <Database className="size-4" />
            <span>
              {numberFormatter.format(totalMessages)} assistant messages
            </span>
          </HStack>
        </VStack>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="min-w-44">Usage</TableHead>
                <TableHead>Context</TableHead>
                <TableHead>Capabilities</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground h-24 text-center"
                  >
                    No model usage has been recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                models.map((model, index) => {
                  const width = `${(model.count / maxCount) * 100}%`;

                  return (
                    <TableRow key={model.modelId}>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <HStack className="gap-3">
                          <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full border">
                            <Bot className="size-4" />
                          </div>
                          <VStack className="items-start gap-0">
                            <span className="font-medium">{model.name}</span>
                            <span className="text-muted-foreground max-w-72 truncate text-xs">
                              {model.providerModelId}
                            </span>
                          </VStack>
                        </HStack>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {model.provider}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <VStack className="items-start gap-1">
                          <HStack className="text-sm">
                            <Activity className="size-3" />
                            <span>{numberFormatter.format(model.count)}</span>
                            <span className="text-muted-foreground">
                              {model.percentage}%
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
                        {model.contextLength ? (
                          <HStack className="text-sm">
                            <Gauge className="size-3" />
                            <span>
                              {numberFormatter.format(model.contextLength)}
                            </span>
                          </HStack>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Unknown
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <HStack className="max-w-72 flex-wrap justify-start gap-1">
                          {model.capabilities.length > 0 ? (
                            model.capabilities.map((capability) => (
                              <Badge
                                key={capability}
                                variant="capability"
                                className="capitalize"
                              >
                                {capability.replaceAll("-", " ")}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              None listed
                            </span>
                          )}
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
