"use client";

import React, { useState } from "react";
import { Search, Palette, Shuffle, Moon, Sun, Plus, X, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useThemeManagement } from "@/contexts/theme";
import { cn } from "@/lib/utils";

interface ThemeSwitcherProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ThemeSwitcher({ children, open: controlledOpen, onOpenChange }: ThemeSwitcherProps) {
  const {
    currentMode,
    allThemes,
    builtInThemes,
    customThemes,
    isLoading,
    toggleMode,
    applyPreset,
    randomizeTheme,
    resetToDefault,
    getThemePreview,
  } = useThemeManagement();

  const [searchQuery, setSearchQuery] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Use controlled or uncontrolled state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Filter themes based on search
  const filteredThemes = allThemes.filter((theme) =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      {!children && (
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Palette className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Switcher
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={toggleMode}>
                    {currentMode === "light" ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Switch to {currentMode === "light" ? "dark" : "light"} mode
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={randomizeTheme}>
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Random theme</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowImportDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Import custom theme</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Theme Grid */}
          <ScrollArea className="h-[400px] rounded-md">
            <div className="space-y-4 pr-4">
              {/* Built-in Themes */}
              {builtInThemes.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    Built-in Themes
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {builtInThemes
                      .filter((theme) =>
                        theme.name.toLowerCase().includes(searchQuery.toLowerCase()),
                      )
                      .map((theme) => (
                        <ThemeCard
                          key={theme.name}
                          theme={theme}
                          onSelect={() => {
                            applyPreset(theme);
                            setIsOpen(false);
                          }}
                          previewColors={getThemePreview(theme)}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Custom Themes */}
              {customThemes.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    Custom Themes
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {customThemes
                      .filter((theme) =>
                        theme.name.toLowerCase().includes(searchQuery.toLowerCase()),
                      )
                      .map((theme) => (
                        <ThemeCard
                          key={theme.name}
                          theme={theme}
                          onSelect={() => {
                            applyPreset(theme);
                            setIsOpen(false);
                          }}
                          previewColors={getThemePreview(theme)}
                        />
                      ))}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Loading themes...</div>
                </div>
              )}

              {!isLoading && filteredThemes.length === 0 && searchQuery && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">
                    No themes found matching "{searchQuery}"
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={resetToDefault}>
              Reset to Default
            </Button>
            <div className="text-sm text-muted-foreground">
              {allThemes.length} theme{allThemes.length !== 1 ? "s" : ""} available
            </div>
          </div>
        </div>

        <ImportThemeDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
        />
      </DialogContent>
    </Dialog>
  );
}

interface ThemeCardProps {
  theme: any;
  onSelect: () => void;
  previewColors: string[];
}

function ThemeCard({ theme, onSelect, previewColors }: ThemeCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative rounded-lg border p-3 text-left transition-all",
        "hover:border-primary hover:shadow-md",
        "focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1",
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{theme.name}</span>
          {!theme.isBuiltIn && <Badge variant="secondary">Custom</Badge>}
        </div>
        
        {/* Color Preview */}
        <div className="flex gap-1">
          {previewColors.slice(0, 4).map((color, index) => (
            <div
              key={index}
              className="h-3 w-3 rounded-full border border-border"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </button>
  );
}

interface ImportThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ImportThemeDialog({ open, onOpenChange }: ImportThemeDialogProps) {
  const { importTheme, isImporting } = useThemeManagement();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleImport = async () => {
    if (!url.trim()) {
      setError("Please enter a theme URL");
      return;
    }

    try {
      setError("");
      await importTheme(url.trim());
      setUrl("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import theme");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Import Custom Theme
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Theme URL</label>
            <Input
              placeholder="https://tweakcn.com/theme/..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              className="mt-1"
            />
            {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Supported formats:</p>
            <ul className="mt-1 list-inside list-disc">
              <li>tweakcn.com theme URLs</li>
              <li>Direct JSON theme files</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? "Importing..." : "Import Theme"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
