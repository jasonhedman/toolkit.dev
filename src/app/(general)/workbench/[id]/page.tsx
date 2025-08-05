import { notFound } from "next/navigation";

import { Chat } from "@/app/(general)/_components/chat";
import { api } from "@/trpc/server";
import { generateUUID } from "@/lib/utils";

export default async function WorkbenchPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  try {
    const workbench = await api.workbenches.getWorkbench(id);

    if (!workbench) {
      notFound();
    }

    const chatId = generateUUID();

    return (
      <Chat
        id={chatId}
        isReadonly={false}
        isNew={true}
        initialVisibilityType="private"
        workbench={workbench}
      />
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
