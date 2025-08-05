import { FileIcon, LoaderIcon, X } from "lucide-react";

import type { Attachment } from "ai";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  attachment: Attachment;
  isUploading?: boolean;
  onRemove?: () => void;
  isError?: boolean;
}

export const PreviewAttachment: React.FC<Props> = ({
  attachment,
  isUploading = false,
  onRemove,
  isError = false,
}) => {
  const { name, url, contentType } = attachment;

  return (
    <div
      data-testid="input-attachment-preview"
      className="flex w-20 flex-col gap-1"
    >
      <div
        className={cn(
          "bg-muted relative flex aspect-video h-16 w-20 flex-col items-center justify-center rounded-md transition-colors",
          isError && "border border-yellow-600 bg-yellow-600/10",
        )}
      >
        {contentType ? (
          contentType.startsWith("image") ? (
            // NOTE: it is recommended to use next/image for images
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={name ?? "An image attachment"}
              className="size-full rounded-md object-cover"
            />
          ) : contentType.startsWith("application") ? (
            <div className="flex size-full items-center justify-center">
              <FileIcon className="size-4" />
            </div>
          ) : (
            <div className="" />
          )
        ) : (
          <div className="" />
        )}

        {isUploading && (
          <div
            data-testid="input-attachment-loader"
            className="absolute animate-spin text-zinc-500"
          >
            <LoaderIcon />
          </div>
        )}
      </div>
      <div className="relative flex w-full flex-row items-center justify-between gap-2">
        <div className="max-w-full flex-1 truncate text-xs text-zinc-500">
          {name}
        </div>
        {onRemove && !isUploading && (
          <Button
            onClick={onRemove}
            className="size-fit rounded-full p-1"
            aria-label="Remove attachment"
            data-testid="remove-attachment-button"
            size="icon"
          >
            <X className="size-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
