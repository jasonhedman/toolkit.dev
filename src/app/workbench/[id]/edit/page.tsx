import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { EditWorkbenchForm } from "./_components/edit-workbench-form";

interface EditWorkbenchPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWorkbenchPage({
  params,
}: EditWorkbenchPageProps) {
  const { id } = await params;

  try {
    const workbench = await api.workbenches.getWorkbench(id);

    if (!workbench) {
      notFound();
    }

    return <EditWorkbenchForm workbench={workbench} />;
  } catch (error) {
    console.error(error);
    notFound();
  }
}
