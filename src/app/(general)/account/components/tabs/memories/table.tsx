"use client";

import * as React from "react";
import {
  ChevronDown,
  Loader2,
  MoreHorizontal,
  Trash,
  Brain,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/trpc/react";

export function MemoriesTable() {
  const [page, setPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
    new Set(),
  );
  const [visibleColumns, setVisibleColumns] = React.useState({
    memory: true,
    categories: true,
    created_at: true,
    actions: true,
  });

  const {
    data: memoriesData,
    isLoading,
    refetch,
  } = api.memories.getUserMemories.useQuery({
    limit: 10,
    page,
  });

  const { mutate: deleteMemory, isPending: isDeleting } =
    api.memories.deleteMemory.useMutation({
      onSuccess: () => {
        toast.success("Memory deleted");
        void refetch();
      },
      onError: (error) => {
        toast.error("Failed to delete memory: " + error.message);
      },
    });

  // Filter memories based on search term
  const filteredMemories = React.useMemo(() => {
    const memories = memoriesData?.items ?? [];
    if (!searchTerm) return memories;
    return memories.filter((memory) =>
      memory.memory?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [memoriesData?.items, searchTerm]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(filteredMemories.map((memory) => memory.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (memoryId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(memoryId);
    } else {
      newSelected.delete(memoryId);
    }
    setSelectedRows(newSelected);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (memoriesData?.hasMore) {
      setPage(page + 1);
    }
  };

  const toggleColumn = (columnKey: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const allSelected =
    filteredMemories.length > 0 &&
    selectedRows.size === filteredMemories.length;
  const someSelected =
    selectedRows.size > 0 && selectedRows.size < filteredMemories.length;

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="flex items-center gap-2">
          <Brain className="text-muted-foreground h-5 w-5" />
          <h3 className="text-lg font-medium">Your Memories</h3>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Filter memories..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(visibleColumns).map(([key, visible]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  className="capitalize"
                  checked={visible}
                  onCheckedChange={() =>
                    toggleColumn(key as keyof typeof visibleColumns)
                  }
                >
                  {key.replace("_", " ")}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el)
                      (el as HTMLInputElement).indeterminate = someSelected;
                  }}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              {visibleColumns.memory && <TableHead>Memory</TableHead>}
              {visibleColumns.categories && <TableHead>Categories</TableHead>}
              {visibleColumns.created_at && <TableHead>Created</TableHead>}
              {visibleColumns.actions && (
                <TableHead className="w-12"></TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={
                    Object.values(visibleColumns).filter(Boolean).length + 1
                  }
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading memories...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMemories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    Object.values(visibleColumns).filter(Boolean).length + 1
                  }
                  className="h-24 text-center"
                >
                  No memories found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMemories.map((memory) => (
                <TableRow key={memory.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(memory.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(memory.id, checked as boolean)
                      }
                      aria-label="Select row"
                    />
                  </TableCell>
                  {visibleColumns.memory && (
                    <TableCell>
                      <div className="max-w-lg truncate text-sm">
                        {memory.memory}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.categories && (
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {memory.categories?.map((category) => (
                          <Badge
                            key={category}
                            variant="secondary"
                            className="text-xs"
                          >
                            {category}
                          </Badge>
                        )) ?? (
                          <span className="text-muted-foreground text-xs">
                            No categories
                          </span>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.created_at && (
                    <TableCell>
                      <div className="text-sm">
                        {memory.created_at
                          ? new Date(memory.created_at).toLocaleDateString()
                          : "Unknown"}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.actions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => deleteMemory(memory.id)}
                            disabled={isDeleting}
                            className="text-destructive focus:text-destructive"
                          >
                            {isDeleting ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="mr-2 h-4 w-4" />
                            )}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {selectedRows.size} of {filteredMemories.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground text-sm">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!memoriesData?.hasMore}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
