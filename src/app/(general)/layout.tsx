import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { Navbar } from "../_components/navbar";

import { AppSidebar } from "./_components/sidebar";
import { InstallPromptProvider } from "@/app/(general)/_contexts/install-prompt-context";

export default async function GeneralLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <InstallPromptProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex h-dvh flex-col">
          <Navbar />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </InstallPromptProvider>
  );
}
