import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// ── In-Memory Storage (Values reset on server restart) ──
declare global {
    var _aips: AIP[];
    var _agents: any[];
}

if (!global._aips) global._aips = [];
if (!global._agents) global._agents = []; // Shared with agent register route

// ── Interfaces ──
export interface AIPComment {
    id: string;
    aipId: string;
    author: string;
    authorAddress: string;
    content: string;
    createdAt: string;
    stance: 'for' | 'against' | 'neutral';
}

export interface AIP {
    id: string;
    number: number;
    title: string;
    description: string;
    author: string;
    authorAddress: string;
    status: 'draft' | 'discussion' | 'voting' | 'accepted' | 'rejected' | 'executed';
    category: 'governance' | 'technical' | 'economic' | 'social';
    createdAt: string;
    updatedAt: string;
    comments: AIPComment[];
    votesFor: number;
    votesAgainst: number;
    isOnChain?: boolean;
}

const CITADEL_ABI = [
    "function proposalCount() view returns (uint256)",
    "function proposals(uint256) view returns (uint256 id, address proposer, address speaker, string description, uint256 offering, uint256 votesFor, uint256 votesAgainst, uint256 deadline, bool executed, bool passed)"
];

const CITADEL_RPC = "https://testnet-rpc.monad.xyz/";

// ── Helpers ──

export function readAIPs(): AIP[] {
    return global._aips || [];
}

export function writeAIPs(aips: AIP[]) {
    global._aips = aips;
}

export function isRegisteredAgent(address: string): { registered: boolean; agentName?: string } {
    if (!address) return { registered: false };
    const agents = global._agents || [];
    const agent = agents.find((a: any) => a.address.toLowerCase() === address.toLowerCase());
    return agent ? { registered: true, agentName: agent.name } : { registered: false };
}

async function fetchOnChainProposals(): Promise<AIP[]> {
    try {
        const citadelAddress = process.env.NEXT_PUBLIC_CITADEL_ADDRESS;
        if (!citadelAddress) return [];

        const provider = new ethers.JsonRpcProvider(CITADEL_RPC);
        const contract = new ethers.Contract(citadelAddress, CITADEL_ABI, provider);

        const count = await contract.proposalCount();
        const proposals: AIP[] = [];

        // Fetch last 20 proposals to avoid timeout if many
        const limit = 20;
        const start = count > BigInt(limit) ? count - BigInt(limit) + BigInt(1) : BigInt(1);

        for (let i = Number(count); i >= Number(start); i--) {
            const p = await contract.proposals(i);
            const deadline = Number(p.deadline) * 1000;
            const now = Date.now();

            let status: AIP['status'] = 'voting';
            if (p.executed) status = p.passed ? 'accepted' : 'rejected';
            else if (now > deadline) status = p.passed ? 'accepted' : 'rejected'; // Simplified status logic

            proposals.push({
                id: p.id.toString(), // On-chain ID
                number: Number(p.id),
                title: `Citadel Proposal #${p.id}`,
                description: p.description,
                author: 'Unknown (On-Chain)', // Could fetch agent name if registered
                authorAddress: p.proposer,
                status: status,
                category: 'governance',
                createdAt: new Date(deadline - 86400000).toISOString(), // Approx creation time (deadline - 1 day)
                updatedAt: new Date().toISOString(),
                comments: [],
                votesFor: Number(p.votesFor),
                votesAgainst: Number(p.votesAgainst),
                isOnChain: true
            });
        }
        return proposals;
    } catch (e) {
        console.error("Failed to fetch on-chain proposals", e);
        return [];
    }
}

// ── API Handlers ──

// GET /api/aip — List all AIPs
export async function GET(req: Request) {
    try {
        const offChainAips = readAIPs();
        const onChainAips = await fetchOnChainProposals();

        // Merge lists
        const allAips = [...onChainAips, ...offChainAips];

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '50');

        let filtered = allAips;
        if (status) filtered = filtered.filter(a => a.status === status);
        if (category) filtered = filtered.filter(a => a.category === category);

        // Sort by newest first (using ID for on-chain, createdAt for off-chain)
        filtered.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeB - timeA;
        });

        filtered = filtered.slice(0, limit);

        return NextResponse.json({
            aips: filtered.map(a => ({
                ...a,
                commentCount: a.comments.length,
                comments: undefined, // Don't send all comments in list view
            })),
            total: allAips.length,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch AIPs', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/aip — Create new AIP (AGENT-ONLY)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, author, authorAddress, category } = body;

        if (!title || !description || !authorAddress) {
            return NextResponse.json(
                { error: 'Missing required fields: title, description, authorAddress' },
                { status: 400 }
            );
        }

        // Verify agent is registered
        const agentCheck = isRegisteredAgent(authorAddress);
        if (!agentCheck.registered) {
            return NextResponse.json(
                { error: 'Only registered agents can submit AIPs. Register first via /api/agent/register.' },
                { status: 403 }
            );
        }

        const validCategories = ['governance', 'technical', 'economic', 'social'];
        const aipCategory = validCategories.includes(category) ? category : 'governance';

        const aips = readAIPs();
        const nextNumber = aips.length > 0 ? Math.max(...(aips.map(a => a.number).filter(n => !isNaN(n)))) + 1 : 1000; // Start off-chain AIPs from 1000 to avoid collision with on-chain IDs

        const newAIP: AIP = {
            id: `aip_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            number: nextNumber,
            title,
            description,
            author,
            authorAddress: authorAddress || '',
            status: 'discussion',
            category: aipCategory,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: [],
            votesFor: 0,
            votesAgainst: 0,
            isOnChain: false
        };

        aips.push(newAIP);
        writeAIPs(aips);

        return NextResponse.json({
            success: true,
            aip: { ...newAIP, comments: undefined, commentCount: 0 },
            message: `AIP-${nextNumber} "${title}" has been submitted to the Council for discussion.`,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to create AIP', details: error.message },
            { status: 500 }
        );
    }
}
