"use client";

import * as React from "react";
import { ChevronDown, Loader2, MoreHorizontal, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

import { toast } from "sonner";
import { api } from "@/trpc/react";

export function DataTableDemo() {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
    new Set(),
  );
  const [visibleColumns, setVisibleColumns] = React.useState({
    name: true,
    contentType: true,
    actions: true,
  });

  const {
    data: attachments,
    isLoading,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = api.files.getUserFiles.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const { mutate: deleteAttachment, isPending: isDeleting } =
    api.files.deleteFile.useMutation({
      onSuccess: () => {
        toast.success("Attachment deleted");
        void refetch();
      },
      onError: (error) => {
        toast.error("Failed to delete attachment: " + error.message);
      },
    });

  const flattenedData = React.useMemo(
    () => attachments?.pages.flatMap((page) => page.items) ?? [],
    [attachments],
  );

  // Filter attachments based on search term
  const filteredAttachments = React.useMemo(() => {
    if (!searchTerm) return flattenedData;
    return flattenedData.filter((attachment) =>
      attachment.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [flattenedData, searchTerm]);

  // Manual pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredAttachments.length / itemsPerPage);
  const paginatedAttachments = filteredAttachments.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(
        new Set(paginatedAttachments.map((attachment) => attachment.id)),
      );
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (attachmentId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(attachmentId);
    } else {
      newSelected.delete(attachmentId);
    }
    setSelectedRows(newSelected);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else if (hasNextPage && currentPage === totalPages - 1) {
      void fetchNextPage();
    }
  };

  const toggleColumn = (columnKey: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const allSelected =
    paginatedAttachments.length > 0 &&
    selectedRows.size === paginatedAttachments.length;
  const someSelected =
    selectedRows.size > 0 && selectedRows.size < paginatedAttachments.length;

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter attachments..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
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
                {key.replace(/([A-Z])/g, " $1").toLowerCase()}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
              {visibleColumns.name && <TableHead>Name</TableHead>}
              {visibleColumns.contentType && (
                <TableHead>Content Type</TableHead>
              )}
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
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedAttachments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    Object.values(visibleColumns).filter(Boolean).length + 1
                  }
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              paginatedAttachments.map((attachment) => (
                <TableRow key={attachment.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(attachment.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(attachment.id, checked as boolean)
                      }
                      aria-label="Select row"
                    />
                  </TableCell>
                  {visibleColumns.name && (
                    <TableCell>
                      <div>{attachment.name}</div>
                    </TableCell>
                  )}
                  {visibleColumns.contentType && (
                    <TableCell>
                      <div className="capitalize">{attachment.contentType}</div>
                    </TableCell>
                  )}
                  {visibleColumns.actions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => deleteAttachment(attachment.id)}
                            disabled={isDeleting}
                            className="text-destructive focus:text-destructive"
                          >
                            {isDeleting ? (
                              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="text-destructive h-4 w-4" />
                            )}
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View attachment</DropdownMenuItem>
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

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {selectedRows.size} of {paginatedAttachments.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1 && !hasNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
