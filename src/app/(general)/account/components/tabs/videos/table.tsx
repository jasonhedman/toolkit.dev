"use client";

import * as React from "react";
import {
  ChevronDown,
  Loader2,
  MoreHorizontal,
  Trash,
  Video as VideoIcon,
  ExternalLink,
  Play,
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

export function VideosTable() {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
    new Set(),
  );
  const [visibleColumns, setVisibleColumns] = React.useState({
    preview: true,
    url: true,
    modelId: true,
    createdAt: true,
    actions: true,
  });

  const {
    data: videosData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = api.videos.getUserVideos.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const { mutate: deleteVideo, isPending: isDeleting } =
    api.videos.deleteVideo.useMutation({
      onSuccess: () => {
        toast.success("Video deleted");
        void refetch();
      },
      onError: (error) => {
        toast.error("Failed to delete video: " + error.message);
      },
    });

  const flattenedData = React.useMemo(
    () => videosData?.pages.flatMap((page) => page.items) ?? [],
    [videosData],
  );

  // Filter videos based on search term
  const filteredVideos = React.useMemo(() => {
    if (!searchTerm) return flattenedData;
    return flattenedData.filter(
      (video) =>
        video.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.modelId.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [flattenedData, searchTerm]);

  // Manual pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const paginatedVideos = filteredVideos.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedVideos.map((video) => video.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (videoId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(videoId);
    } else {
      newSelected.delete(videoId);
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
    paginatedVideos.length > 0 && selectedRows.size === paginatedVideos.length;
  const someSelected =
    selectedRows.size > 0 && selectedRows.size < paginatedVideos.length;

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="flex items-center gap-2">
          <VideoIcon className="text-muted-foreground h-5 w-5" />
          <h3 className="text-lg font-medium">Generated Videos</h3>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Filter by URL or model..."
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
              {visibleColumns.modelId && <TableHead>Model</TableHead>}
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
                    Loading videos...
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedVideos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    Object.values(visibleColumns).filter(Boolean).length + 1
                  }
                  className="h-24 text-center"
                >
                  No videos found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedVideos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(video.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(video.id, checked as boolean)
                      }
                      aria-label="Select row"
                    />
                  </TableCell>
                  {visibleColumns.preview && (
                    <TableCell>
                      <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-md border">
                        <div className="relative h-full w-full">
                          <video
                            src={video.url}
                            className="h-full w-full rounded-md object-cover"
                            muted
                            onError={(e) => {
                              const target = e.target as HTMLVideoElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML =
                                  '<div class="flex h-full w-full items-center justify-center"><svg class="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 6h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"></path></svg></div>';
                              }
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="h-6 w-6 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.url && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted max-w-xs truncate rounded px-2 py-1 text-xs">
                          {video.url}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(video.url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.modelId && (
                    <TableCell>
                      <div className="font-mono text-sm">{video.modelId}</div>
                    </TableCell>
                  )}
                  {visibleColumns.createdAt && (
                    <TableCell>
                      <div className="text-sm">
                        {new Date(video.createdAt).toLocaleDateString()}
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
                            onClick={() => window.open(video.url, "_blank")}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Video
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteVideo({ videoId: video.id })}
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
          {selectedRows.size} of {paginatedVideos.length} row(s) selected.
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
