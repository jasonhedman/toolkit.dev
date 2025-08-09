"use client";

import { CDPHooksProvider as CDPHooksProviderBase } from "@coinbase/cdp-hooks";
import { createCDPEmbeddedWalletConnector } from "@coinbase/cdp-wagmi";
import { createConfig, WagmiProvider } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { http } from "wagmi";

import { env } from "@/env";

interface Props {
  children: React.ReactNode;
}

const cdpConfig = {
  projectId: env.NEXT_PUBLIC_CDP_PROJECT_ID,
};

const connector = createCDPEmbeddedWalletConnector({
  cdpConfig: cdpConfig,
  providerConfig: {
    chains: [base, baseSepolia],
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http(),
    },
  },
});

const wagmiConfig = createConfig({
  connectors: [connector],
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

export const CDPHooksProvider = ({ children }: Props) => {
  return (
    <CDPHooksProviderBase
      config={{
        projectId: env.NEXT_PUBLIC_CDP_PROJECT_ID,
      }}
    >
      <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
    </CDPHooksProviderBase>
  );
};
