import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { NewWorkbenchForm } from "./_components";

export default async function NewWorkbenchPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return <NewWorkbenchForm />;
}
