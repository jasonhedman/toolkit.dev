import { env } from "@/env";


export const MERIT_ABI = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "repoId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "instanceId",
          "type": "uint256"
        },
        {
          "internalType": "contract ERC20",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "fundRepo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

export const MERIT_CONTRACT_ADDRESS = env.MERIT_CONTRACT_ADDRESS as `0x${string}`;