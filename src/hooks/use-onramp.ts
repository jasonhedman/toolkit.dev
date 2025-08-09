import { useState } from "react";

interface OnrampResponse {
  url: string;
  sessionToken: string;
}

interface UseOnrampOptions {
  amount: number;
  address: string;
}

export function useOnramp() {
  const [isLoading, setIsLoading] = useState(false);

  const openOnramp = async (options: UseOnrampOptions) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/onramp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: options.address,
          amount: options.amount,
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
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    openOnramp,
    isLoading,
  };
}
