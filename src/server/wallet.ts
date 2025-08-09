import { CdpClient } from "@coinbase/cdp-sdk";
import type { EvmServerAccount } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";

dotenv.config();

let walletAccount: EvmServerAccount | null = null;

const getWalletAccount = async () => {
    if (!walletAccount) {
        const cdp = new CdpClient();
        const account = await cdp.evm.getOrCreateAccount({
            name: "toolkit-wallet"
        });
        walletAccount = account;
    }
    console.log(`Wallet account: ${walletAccount?.address}`);
    return walletAccount;
}