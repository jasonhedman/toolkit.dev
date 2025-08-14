import { api } from "@/trpc/server";
import { WorkbenchHeader } from "./_components/header";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/server/auth";

export default async function WorkbenchLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();

  if (!session) {
    redirect(`/login?redirect=/workbench/${id}`);
  }

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
