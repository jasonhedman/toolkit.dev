import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AdminSidebar } from "@/app/admin/_components/admin-sidebar";
import { Navbar } from "@/app/_components/navbar";
import { auth } from "@/server/auth";
import { forbidden, unauthorized } from "next/navigation";
import { IS_DEVELOPMENT } from "@/lib/constants";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session) {
    return unauthorized();
  }

  if (session.user.role !== "ADMIN" && !IS_DEVELOPMENT) {
    return forbidden();
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="flex h-dvh flex-col">
        <Navbar />
        <div className="mx-auto w-full max-w-screen-lg flex-1 pt-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
