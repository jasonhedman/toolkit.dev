import { env } from "@/env";
import { MERIT_ABI, MERIT_CONTRACT_ADDRESS } from "@/lib/on-chain";
import { CdpClient } from "@coinbase/cdp-sdk";
import { encodeFunctionData } from "viem";

export async function POST(request: Request) {
    try {
        const { amount, tokenAddress = "0x0000000000000000000000000000000000000000" } = await request.json() as { amount: number; tokenAddress?: string };
        
        if (!amount || typeof amount !== "number") {
            return new Response(JSON.stringify({ error: "Invalid amount provided" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (!env.GITHUB_REPO_ID) {
            return new Response(JSON.stringify({ error: "GitHub repo ID not configured" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const repoId = env.GITHUB_REPO_ID;
        const repoInstanceId = 0;
        const cdp = new CdpClient();

        // Convert amount to wei (assuming amount is in ETH)
        const amountInWei = BigInt(amount * 10 ** 18);

        // Encode the function call data
        const encodedData = encodeFunctionData({
            abi: MERIT_ABI,
            functionName: "fundRepo",
            args: [
                BigInt(repoId),
                BigInt(repoInstanceId),
                tokenAddress as `0x${string}`,
                amountInWei,
                "0x" // empty bytes data
            ]
        });

        // Create owner account
        const owner = await cdp.evm.createAccount();
        
        // Create smart account
        const smartAccount = await cdp.evm.createSmartAccount({ owner });

        // Send user operation
        const result = await cdp.evm.sendUserOperation({
            smartAccount,
            network: "base-sepolia", // or "base-mainnet" for production
            calls: [
                {
                    to: MERIT_CONTRACT_ADDRESS,
                    value: 0n,
                    data: encodedData
                }
            ]
        });

        // Wait for the user operation to be processed
        await cdp.evm.waitForUserOperation({
            smartAccountAddress: smartAccount.address,
            userOpHash: result.userOpHash
        });

        return new Response(JSON.stringify({ 
            success: true, 
            userOpHash: result.userOpHash,
            smartAccountAddress: smartAccount.address,
            amount: amount,
            repoId: repoId
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error in fund route:", error);
        return new Response(JSON.stringify({ 
            error: error instanceof Error ? error.message : "An error occurred while funding the repo" 
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}