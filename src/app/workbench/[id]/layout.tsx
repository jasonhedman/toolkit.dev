import { api } from "@/trpc/server";
import { WorkbenchHeader } from "./_components/header";
import { notFound } from "next/navigation";

export default async function WorkbenchLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const workbench = await api.workbenches.getWorkbench(id);

  if (!workbench) {
    notFound();
  }

  return (
    <div className="flex h-0 flex-1 flex-col overflow-hidden">
      <WorkbenchHeader workbench={workbench} />
      <div className="flex h-0 flex-1 flex-col overflow-y-auto">{children}</div>
    </div>
  );
}
