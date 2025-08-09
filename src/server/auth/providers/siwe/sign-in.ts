import { SiweMessage } from "siwe";
import { SIWE_PROVIDER_ID, SIWE_STATEMENT } from "./constants";
import { signIn } from "next-auth/react";

interface SignInWithEthereumOptions {
  address: string;
  csrfToken: () => Promise<string>;
  chainId: number;
  signMessage: (message: string) => Promise<string>;
  email: string;
}

export async function signInWithEthereum({
  address,
  csrfToken,
  chainId,
  signMessage,
  email,
}: SignInWithEthereumOptions) {
  const message = new SiweMessage({
    domain: window.location.host,
    uri: window.location.origin,
    version: "1",
    address,
    statement: SIWE_STATEMENT,
    nonce: await csrfToken(),
    chainId,
    expirationTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  });
  await signIn(SIWE_PROVIDER_ID, {
    message: JSON.stringify(message),
    signedMessage: await signMessage(message.prepareMessage()),
    email,
    redirect: true,
    redirectTo: "/",
  });
}
