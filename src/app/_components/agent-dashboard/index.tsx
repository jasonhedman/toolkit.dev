"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentConfigurationForm } from "./configuration-form";
import { AgentRunsTable } from "./runs-table";
import { Play, History, Settings } from "lucide-react";

export const AgentDashboard = () => {
  const [activeTab, setActiveTab] = useState("configure");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Orchestrate AI agent runs with custom toolkits and configurations
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configure" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configure & Run
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Run History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Agent Configuration</h2>
              </div>
              <p className="text-muted-foreground">
                Configure your AI agent with custom models, toolkits, and prompts
              </p>
            </div>
            <div className="mt-6">
              <AgentConfigurationForm />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Agent Run History</h2>
              </div>
              <p className="text-muted-foreground">
                View and monitor all your agent runs and their results
              </p>
            </div>
            <div className="mt-6">
              <AgentRunsTable />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 