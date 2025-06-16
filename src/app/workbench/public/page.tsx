"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VStack, HStack } from "@/components/ui/stack";
import { ToolkitIcons } from "@/components/toolkit/toolkit-icons";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Search, GitFork, Anvil } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ToolkitConfig {
  id: string;
  parameters?: Record<string, unknown>;
}

export default function PublicWorkbenchesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const [
    publicWorkbenches,
    { isLoading, fetchNextPage, hasNextPage, isFetchingNextPage },
  ] = api.workbenches.getPublicWorkbenches.useSuspenseInfiniteQuery(
    {
      limit: 12,
      search: search || undefined,
    },
    {
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextCursor : undefined,
    },
  );

  const forkMutation = api.workbenches.forkWorkbench.useMutation({
    onSuccess: (workbench) => {
      toast.success("Workbench forked successfully!");
      router.push(`/workbench/${workbench.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFork = (workbenchId: string) => {
    forkMutation.mutate(workbenchId);
  };

  // Helper function to extract toolkit IDs from workbench
  const getToolkitIds = (workbench: { toolkitConfigs?: unknown }): Toolkits[] => {
    if (!workbench?.toolkitConfigs) return [];
    const configs = workbench.toolkitConfigs as ToolkitConfig[];
    return Array.isArray(configs)
      ? configs.map((config) => config.id as Toolkits)
      : [];
  };

  const allWorkbenches = publicWorkbenches.pages.flatMap((page) => page.items);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <VStack className="gap-8">
        {/* Header */}
        <div className="text-center">
          <HStack className="justify-center mb-4">
            <Anvil className="size-8 text-primary" />
            <h1 className="text-3xl font-bold">Public Workbenches</h1>
          </HStack>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover and fork public AI workbenches created by the community. 
            Each workbench comes with pre-configured toolkits and system prompts.
          </p>
        </div>

        {/* Search */}
        <div className="w-full max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Search workbenches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Workbenches Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : allWorkbenches.length > 0 ? (
          <VStack className="gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allWorkbenches.map((workbench) => {
                const toolkitIds = getToolkitIds(workbench);
                
                return (
                  <Card key={workbench.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">
                        {workbench.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {workbench.systemPrompt || "No description available"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Toolkits */}
                      {toolkitIds.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Toolkits ({toolkitIds.length})
                          </p>
                          <ToolkitIcons 
                            toolkits={toolkitIds}
                            iconClassName="size-4"
                            iconContainerClassName="p-1"
                          />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleFork(workbench.id)}
                          disabled={forkMutation.isPending}
                          className="flex-1"
                          size="sm"
                        >
                          <GitFork className="size-4 mr-2" />
                          {forkMutation.isPending ? "Forking..." : "Fork"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/workbench/${workbench.id}`)}
                          size="sm"
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Load More */}
            {hasNextPage && (
              <div className="text-center">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="outline"
                >
                  {isFetchingNextPage ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </VStack>
        ) : (
          <div className="text-center py-12">
            <Anvil className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No public workbenches found</h3>
            <p className="text-muted-foreground">
              {search ? "Try adjusting your search terms" : "Be the first to create a public workbench!"}
            </p>
          </div>
        )}
      </VStack>
    </div>
  );
}