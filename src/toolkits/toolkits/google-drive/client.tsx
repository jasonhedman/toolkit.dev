import { GoogleDriveTools } from "./tools";
import { createClientToolkit } from "@/toolkits/create-toolkit";
import { baseGoogleDriveToolkitConfig } from "./base";
import {
  googleDriveSearchFilesToolConfigClient,
  googleDriveReadFileToolConfigClient,
} from "./tools/client";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { SiGoogledrive } from "@icons-pack/react-simple-icons";
import { ToolkitGroups } from "@/toolkits/types";

const driveScope = "https://www.googleapis.com/auth/drive.readonly";

export const googleDriveClientToolkit = createClientToolkit(
  baseGoogleDriveToolkitConfig,
  {
    name: "Google Drive",
    description: "Search and read files from your Google Drive.",
    icon: SiGoogledrive,
    form: null,
    addToolkitWrapper: ({ children }) => {
      const { data: account, isLoading: isLoadingAccount } =
        api.accounts.getAccountByProvider.useQuery("google");

      const { data: hasAccess, isLoading: isLoadingAccess } =
        api.features.hasFeature.useQuery({
          feature: "google-drive",
        });

      if (isLoadingAccount || isLoadingAccess) {
        return (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="bg-transparent"
          >
            <Loader2 className="size-4 animate-spin" />
          </Button>
        );
      }

      if (!hasAccess) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline">Private Beta</Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-center">
                We need to add you as a test user on Google Cloud for us to
                request sensitive OAuth scopes. <br />
                <br /> Please contact{" "}
                <Link
                  href="https://x.com/jsonhedman"
                  target="_blank"
                  className="underline"
                >
                  @jsonhedman
                </Link>{" "}
                on X to request access.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      if (!account) {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void signIn(
                "google",
                {
                  callbackUrl: window.location.href,
                },
                {
                  prompt: "consent",
                  access_type: "offline",
                  response_type: "code",
                  include_granted_scopes: true,
                  scope: `openid email profile ${driveScope}`,
                },
              );
            }}
            className="bg-transparent"
          >
            Connect
          </Button>
        );
      }

      if (!account?.scope?.includes(driveScope)) {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void signIn(
                "google",
                {
                  callbackUrl: window.location.href,
                },
                {
                  prompt: "consent",
                  access_type: "offline",
                  response_type: "code",
                  include_granted_scopes: true,
                  scope: `${account?.scope} ${driveScope}`,
                },
              );
            }}
            className="bg-transparent"
          >
            Grant Access
          </Button>
        );
      }

      return children;
    },
    type: ToolkitGroups.KnowledgeBase,
  },
  {
    [GoogleDriveTools.SearchFiles]: googleDriveSearchFilesToolConfigClient,
    [GoogleDriveTools.ReadFile]: googleDriveReadFileToolConfigClient,
  },
);
