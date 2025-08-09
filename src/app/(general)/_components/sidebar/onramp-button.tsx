"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { VStack } from "@/components/ui/stack";

const WALLET_ADDRESS = "0xF4c7C335cd03e6af19580AAEA1FFE55eF83C88E2";

interface OnrampResponse {
  url: string;
  sessionToken: string;
}

export function OnrampButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleOnrampClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/onramp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: WALLET_ADDRESS,
          amount: 100, // Default $100
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create onramp URL");
      }

      const { url } = (await response.json()) as OnrampResponse;

      // Open the onramp URL in a new tab
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error creating onramp URL:", error);
      alert("Failed to create onramp URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarMenuButton
      asChild
      className="hover:bg-sidebar-accent/50 h-fit w-full rounded-lg p-2 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
    >
      <Button
        onClick={handleOnrampClick}
        disabled={isLoading}
        variant="ghost"
        className="flex h-auto w-full items-center gap-3 px-3 transition-all group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
      >
        <div className="text-sidebar-accent-foreground flex !size-6 items-center justify-center rounded bg-green-500 font-bold text-white group-data-[collapsible=icon]:mx-auto">
          $
        </div>
        <VStack className="items-start gap-0 overflow-hidden transition-all group-data-[collapsible=icon]:w-0">
          <h3 className="shimmer-text text-sidebar-foreground truncate font-medium">
            {isLoading ? "Loading..." : "Try Onramp"}
          </h3>
          <p className="text-sidebar-muted-foreground truncate text-xs">
            Buy crypto with fiat
          </p>
        </VStack>
      </Button>
    </SidebarMenuButton>
  );
}
