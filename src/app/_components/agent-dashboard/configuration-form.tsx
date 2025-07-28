"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { allLanguageModels } from "@/ai/models/all";
import type { LanguageModel } from "@/ai/types";
import { clientToolkits } from "@/toolkits/toolkits/client";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import { Loader2, Play, Sparkles } from "lucide-react";
import { ToolkitIcons } from "@/components/toolkit/toolkit-icons";
import { useRunAgent } from "@/app/_hooks/use-run-agent";

interface AgentConfig {
  model: string;
  toolkits: Array<{ id: Toolkits; parameters: Record<string, any> }>;
  prompt: string;
  systemPrompt?: string;
  useNativeSearch: boolean;
}

const defaultSystemPrompt = `You are an AI assistant designed to help users with various tasks. Use the available tools when appropriate to provide comprehensive and accurate responses. Be helpful, accurate, and thorough in your responses.`;

interface Props {
  onRunStarted?: (taskId: string, handle: any) => void;
}

export const AgentConfigurationForm = ({ onRunStarted }: Props) => {
  const [config, setConfig] = useState<AgentConfig>({
    model: "openai/gpt-4",
    toolkits: [],
    prompt: "",
    systemPrompt: defaultSystemPrompt,
    useNativeSearch: false,
  });
  const [selectedToolkits, setSelectedToolkits] = useState<Set<string>>(new Set());
  const { runAgent, isLoading, data, reset } = useRunAgent();

  const handleToolkitToggle = (toolkitId: string) => {
    const newSelected = new Set(selectedToolkits);
    const toolkit = clientToolkits[toolkitId as keyof typeof clientToolkits];
    
    if (newSelected.has(toolkitId)) {
      newSelected.delete(toolkitId);
      setConfig(prev => ({
        ...prev,
        toolkits: prev.toolkits.filter(t => t.id !== toolkitId)
      }));
    } else {
      newSelected.add(toolkitId);
      setConfig(prev => ({
        ...prev,
        toolkits: [...prev.toolkits, { id: toolkitId as Toolkits, parameters: {} }]
      }));
    }
    setSelectedToolkits(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.prompt.trim()) {
      return;
    }

    runAgent({
      messages: [{ role: "user", content: config.prompt }],
      toolkits: config.toolkits,
      selectedChatModel: config.model,
      systemPrompt: config.systemPrompt,
      useNativeSearch: config.useNativeSearch,
    });
  };

  // Handle successful run start
  React.useEffect(() => {
    if (data) {
      // Notify parent component about the new run
      if (onRunStarted) {
        onRunStarted(data.taskId, data.handle);
      }
      
      // Clear the prompt but keep other settings
      setConfig(prev => ({ ...prev, prompt: "" }));
      
      // Reset the mutation state for next run
      reset();
    }
  }, [data, onRunStarted, reset]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Model Selection */}
      <div className="space-y-2">
        <Label htmlFor="model">AI Model</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                {(() => {
                  const selectedModel = allLanguageModels.find(
                    (model: LanguageModel) => `${model.provider}/${model.modelId}` === config.model
                  );
                  return selectedModel ? (
                    <>
                      <span>{selectedModel.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedModel.provider}
                      </Badge>
                    </>
                  ) : (
                    <span>Select an AI model</span>
                  );
                })()}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[400px]">
            {allLanguageModels.map((model: LanguageModel) => (
              <DropdownMenuItem 
                key={model.modelId} 
                onClick={() => setConfig(prev => ({ ...prev, model: `${model.provider}/${model.modelId}` }))}
              >
                <div className="flex items-center gap-2">
                  <span>{model.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {model.provider}
                  </Badge>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Toolkit Selection */}
      <div className="space-y-4">
        <Label>Available Toolkits</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(clientToolkits).map(([toolkitId, toolkit]) => (
            <Card key={toolkitId} className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={toolkitId}
                  checked={selectedToolkits.has(toolkitId)}
                  onCheckedChange={() => handleToolkitToggle(toolkitId)}
                />
                <div className="space-y-2 flex-1">
                                     <div className="flex items-center gap-2">
                     <ToolkitIcons toolkits={[toolkitId as Toolkits]} />
                     <Label htmlFor={toolkitId} className="text-sm font-medium cursor-pointer">
                       {toolkit.name}
                     </Label>
                   </div>
                  <p className="text-xs text-muted-foreground">
                    {toolkit.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {config.toolkits.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Selected:</span>
                         {config.toolkits.map((toolkit) => (
               <Badge key={toolkit.id} variant="secondary" className="flex items-center gap-1">
                 <ToolkitIcons toolkits={[toolkit.id]} />
                 {clientToolkits[toolkit.id]?.name}
               </Badge>
             ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useNativeSearch"
            checked={config.useNativeSearch}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, useNativeSearch: !!checked }))}
          />
          <Label htmlFor="useNativeSearch" className="text-sm">
            Use native search capabilities
          </Label>
        </div>
      </div>

      {/* System Prompt */}
      <div className="space-y-2">
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          placeholder="Enter system prompt..."
          value={config.systemPrompt}
          onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
          rows={4}
          className="resize-none"
        />
      </div>

      {/* User Prompt */}
      <div className="space-y-2">
        <Label htmlFor="prompt">User Prompt *</Label>
        <Textarea
          id="prompt"
          placeholder="Enter your prompt for the AI agent..."
          value={config.prompt}
          onChange={(e) => setConfig(prev => ({ ...prev, prompt: e.target.value }))}
          rows={6}
          className="resize-none"
          required
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || !config.prompt.trim()} className="flex items-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting Agent...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Agent
            </>
          )}
        </Button>
      </div>
    </form>
  );
}; 