"use client";

import * as React from "react";
import {
  ChevronDown,
  Loader2,
  MoreHorizontal,
  Trash,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

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
import Image from "next/image";

export function ImagesTable() {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
    new Set(),
  );
  const [visibleColumns, setVisibleColumns] = React.useState({
    preview: true,
    url: true,
    contentType: true,
    createdAt: true,
    actions: true,
  });

  const {
    data: imagesData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = api.images.getUserImages.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const { mutate: deleteImage, isPending: isDeleting } =
    api.images.deleteImage.useMutation({
      onSuccess: () => {
        toast.success("Image deleted");
        void refetch();
      },
      onError: (error) => {
        toast.error("Failed to delete image: " + error.message);
      },
    });

  const flattenedData = React.useMemo(
    () => imagesData?.pages.flatMap((page) => page.items) ?? [],
    [imagesData],
  );

  // Filter images based on search term
  const filteredImages = React.useMemo(() => {
    if (!searchTerm) return flattenedData;
    return flattenedData.filter((image) =>
      image.url.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [flattenedData, searchTerm]);

  // Manual pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const paginatedImages = filteredImages.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedImages.map((image) => image.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (imageId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(imageId);
    } else {
      newSelected.delete(imageId);
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
    paginatedImages.length > 0 && selectedRows.size === paginatedImages.length;
  const someSelected =
    selectedRows.size > 0 && selectedRows.size < paginatedImages.length;

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="text-muted-foreground h-5 w-5" />
          <h3 className="text-lg font-medium">Generated Images</h3>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Filter by URL..."
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
                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}
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
              {visibleColumns.preview && <TableHead>Preview</TableHead>}
              {visibleColumns.url && <TableHead>URL</TableHead>}
              {visibleColumns.contentType && <TableHead>Type</TableHead>}
              {visibleColumns.createdAt && <TableHead>Created</TableHead>}
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
                    Loading images...
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedImages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    Object.values(visibleColumns).filter(Boolean).length + 1
                  }
                  className="h-24 text-center"
                >
                  No images found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedImages.map((image) => (
                <TableRow key={image.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(image.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(image.id, checked as boolean)
                      }
                      aria-label="Select row"
                    />
                  </TableCell>
                  {visibleColumns.preview && (
                    <TableCell>
                      <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-md border">
                        <Image
                          src={image.url}
                          alt="Generated image"
                          width={64}
                          height={64}
                          className="h-full w-full rounded-md object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML =
                                '<div class="flex h-full w-full items-center justify-center"><svg class="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                            }
                          }}
                        />
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.url && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted max-w-xs truncate rounded px-2 py-1 text-xs">
                          {image.url}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(image.url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.contentType && (
                    <TableCell>
                      <div className="font-mono text-sm">
                        {image.contentType}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.createdAt && (
                    <TableCell>
                      <div className="text-sm">
                        {new Date(image.createdAt).toLocaleDateString()}
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
                            onClick={() => window.open(image.url, "_blank")}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Full Size
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteImage(image.id)}
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
          {selectedRows.size} of {paginatedImages.length} row(s) selected.
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
