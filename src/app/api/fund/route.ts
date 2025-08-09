import { MERIT_ABI, MERIT_CONTRACT_ADDRESS, USDC_ADDRESS, GITHUB_REPO_ID } from "@/lib/on-chain";
import { CdpClient } from "@coinbase/cdp-sdk";
import { encodeFunctionData } from "viem";

export async function POST(request: Request) {
    try {
        const { amount } = await request.json() as { amount: number };
        
        if (!amount || typeof amount !== "number") {
            return new Response(JSON.stringify({ error: "Invalid amount provided" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const repoId = GITHUB_REPO_ID;
        const tokenAddress = USDC_ADDRESS;
        const repoInstanceId = 0;
        const cdp = new CdpClient();

        // Convert amount to wei (assuming amount is in USDC - 6 decimals)
        const amountBigInt = BigInt(amount * 10 ** 6);

        

        // Get or create owner account with a specific name
        const owner = await cdp.evm.getOrCreateAccount({
            name: "toolkit-fund-owner"
        });
        
        // Get or create smart account with a specific name
        const smartAccount = await cdp.evm.getOrCreateSmartAccount({
            name: "toolkit-fund-smart-account",
            owner
        });

        // Send user operation
        const result = await cdp.evm.sendUserOperation({
            smartAccount,
            network: "base-sepolia", // or "base-mainnet" for production
            calls: [
                {
                    to: MERIT_CONTRACT_ADDRESS,
                    value: 0n,
                    data: encodeFunctionData({
                        abi: MERIT_ABI,
                        functionName: "fundRepo",
                        args: [
                            BigInt(repoId),
                            BigInt(repoInstanceId),
                            tokenAddress,
                            amountBigInt,
                            "0x" // empty bytes data
                        ],
                    })
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
            repoId: repoId,
            tokenAddress: tokenAddress
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