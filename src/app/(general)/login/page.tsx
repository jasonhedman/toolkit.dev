import { EmbeddedWallet } from "../_components/auth/embedded-wallet";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <EmbeddedWallet />
      </div>
    </div>
  );
}
