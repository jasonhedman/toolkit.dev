import { AgentDashboard } from "@/app/_components/agent-dashboard";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function AgentsPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return <AgentDashboard />;
} 