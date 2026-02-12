import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const MOLTIVERSE_ABI = [
    "function getRealms() external view returns (tuple(address realmAddress, string name, string symbol, address creator, uint256 createdAt)[])",
    "function createRealm(string name, string symbol, string manifesto) external returns (address)"
];

const CITADEL_RPC = "https://testnet-rpc.monad.xyz/";

export async function GET() {
    try {
        const provider = new ethers.JsonRpcProvider(CITADEL_RPC);
        const moltiverseAddress = process.env.NEXT_PUBLIC_MOLTIVERSE_ADDRESS;

        if (!moltiverseAddress) {
            return NextResponse.json({ realms: [] });
        }

        const contract = new ethers.Contract(moltiverseAddress, MOLTIVERSE_ABI, provider);
        const realms = await contract.getRealms();

        // Format the result
        const formattedRealms = realms.map((r: any) => ({
            realmAddress: r.realmAddress,
            name: r.name,
            symbol: r.symbol,
            creator: r.creator,
            createdAt: Number(r.createdAt) * 1000 // Convert to ms
        }));

        // Sort by newest
        formattedRealms.sort((a: any, b: any) => b.createdAt - a.createdAt);

        return NextResponse.json({ realms: formattedRealms });
    } catch (error: any) {
        console.error('Failed to fetch aDAOs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch aDAOs', details: error.message },
            { status: 500 }
        );
    }
}
