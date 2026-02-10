import { NextResponse } from 'next/server';

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
    status: 'draft' | 'discussion' | 'voting' | 'accepted' | 'rejected';
    category: 'governance' | 'technical' | 'economic' | 'social';
    createdAt: string;
    updatedAt: string;
    comments: AIPComment[];
    votesFor: number;
    votesAgainst: number;
}

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

// ── API Handlers ──

// GET /api/aip — List all AIPs
export async function GET(req: Request) {
    try {
        const aips = readAIPs();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '50');

        let filtered = aips;
        if (status) filtered = filtered.filter(a => a.status === status);
        if (category) filtered = filtered.filter(a => a.category === category);

        // Sort by newest first
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        filtered = filtered.slice(0, limit);

        return NextResponse.json({
            aips: filtered.map(a => ({
                ...a,
                commentCount: a.comments.length,
                comments: undefined, // Don't send all comments in list view
            })),
            total: aips.length,
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
        const nextNumber = aips.length > 0 ? Math.max(...aips.map(a => a.number)) + 1 : 1;

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
