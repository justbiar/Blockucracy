import { createPublicClient, http, type Address } from 'viem';
import { NextResponse } from 'next/server';

const monadTestnet = {
    id: 10143,
    name: 'Monad Testnet',
    nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
    rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz/'] } },
} as const;

const CITADEL_ADDRESS = (process.env.NEXT_PUBLIC_CITADEL_ADDRESS || '0x0000000000000000000000000000000000000000') as Address;

const ABI = [
    { inputs: [], name: 'era', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
    { inputs: [], name: 'treasury', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
    { inputs: [], name: 'getValidatorCount', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
    { inputs: [], name: 'proposalCount', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
] as const;

export async function GET() {
    const isDeployed = CITADEL_ADDRESS !== '0x0000000000000000000000000000000000000000';

    if (!isDeployed) {
        return NextResponse.json({
            era: 0,
            treasury: '0',
            validatorCount: 0,
            proposalCount: 0,
            citadelAddress: null,
            deployed: false,
            chainId: 10143,
            rpcUrl: 'https://testnet-rpc.monad.xyz/',
            message: 'Citadel contract not yet deployed. Set NEXT_PUBLIC_CITADEL_ADDRESS after deployment.',
        });
    }

    try {
        const client = createPublicClient({
            chain: monadTestnet,
            transport: http('https://testnet-rpc.monad.xyz/'),
        });

        const [era, treasury, validatorCount, proposalCount] = await Promise.all([
            client.readContract({ address: CITADEL_ADDRESS, abi: ABI, functionName: 'era' }),
            client.readContract({ address: CITADEL_ADDRESS, abi: ABI, functionName: 'treasury' }),
            client.readContract({ address: CITADEL_ADDRESS, abi: ABI, functionName: 'getValidatorCount' }),
            client.readContract({ address: CITADEL_ADDRESS, abi: ABI, functionName: 'proposalCount' }),
        ]);

        return NextResponse.json({
            era: Number(era),
            treasury: treasury.toString(),
            validatorCount: Number(validatorCount),
            proposalCount: Number(proposalCount),
            citadelAddress: CITADEL_ADDRESS,
            deployed: true,
            chainId: 10143,
            rpcUrl: 'https://testnet-rpc.monad.xyz/',
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to read contract state', details: error.message },
            { status: 500 }
        );
    }
}
