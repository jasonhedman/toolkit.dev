import { notFound, redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { RunDetailsDashboard } from "@/app/_components/agent-dashboard/run-details-dialog";

export default async function RunDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  const session = await auth();

  if (!session) {
    redirect(`/login?redirect=/agents/run/${id}`);
  }

  // Basic validation that the ID looks like a valid task ID
  if (!id || id.length < 8) {
    notFound();
  }

  return <RunDetailsDashboard runId={id} />;
} 