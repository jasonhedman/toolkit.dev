import React from "react";

import {
  File,
  User,
  Brain,
  Image as ImageIcon,
  Video as VideoIcon,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ConnectedAccounts } from "./connected-accounts";
import { Attachments } from "./attachments";
import { Memories } from "./memories";
import { Images } from "./images";
import { Videos } from "./videos";
import { HStack } from "@/components/ui/stack";

const tabs = [
  {
    label: "Connected Accounts",
    value: "connected-accounts",
    component: <ConnectedAccounts />,
    icon: <User />,
  },
  {
    label: "Attachments",
    value: "attachments",
    component: <Attachments />,
    icon: <File />,
  },
  {
    label: "Memories",
    value: "memories",
    component: <Memories />,
    icon: <Brain />,
  },
  {
    label: "Images Generated",
    value: "images",
    component: <Images />,
    icon: <ImageIcon />,
  },
  {
    label: "Videos Generated",
    value: "videos",
    component: <Videos />,
    icon: <VideoIcon />,
  },
];

interface Props {
  defaultTab?: string;
}

export const AccountTabs: React.FC<Props> = ({ defaultTab }) => {
  return (
    <Tabs defaultValue={defaultTab ?? "connected-accounts"}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            <HStack className="gap-2">
              {tab.icon}
              {tab.label}
            </HStack>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-2">
          {tab.component}
        </TabsContent>
      ))}
    </Tabs>
  );
};
