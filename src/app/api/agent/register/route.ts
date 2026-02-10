import { NextResponse } from 'next/server';
import { verifyMessage, type Address } from 'viem';

// ── In-Memory Storage (Shared with other routes) ──
declare global {
    var _agents: any[];
}

if (!global._agents) global._agents = [];

function readAgents(): any[] {
    return global._agents || [];
}

function writeAgents(agents: any[]) {
    global._agents = agents;
}

// ── Handlers ──

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { address, name, signature, manifesto } = body;

        // Validate required fields
        if (!address || !name || !signature) {
            return NextResponse.json(
                { error: 'Missing required fields: address, name, signature' },
                { status: 400 }
            );
        }

        // Verify signature — agent must sign "BLOCKUCRACY:REGISTER:{address}"
        const message = `BLOCKUCRACY:REGISTER:${address}`;
        const isValid = await verifyMessage({
            address: address as Address,
            message,
            signature: signature as `0x${string}`,
        });

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid signature. Sign the message: BLOCKUCRACY:REGISTER:{your_address}' },
                { status: 401 }
            );
        }

        // Check if already registered
        const agents = readAgents();
        const existing = agents.find((a: any) => a.address.toLowerCase() === address.toLowerCase());
        if (existing) {
            return NextResponse.json(
                { error: 'Agent already registered', agentId: existing.agentId },
                { status: 409 }
            );
        }

        // Register agent
        const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const agent = {
            agentId,
            address,
            name,
            manifesto: manifesto || '',
            registeredAt: new Date().toISOString(),
            verified: true,
        };

        agents.push(agent);
        writeAgents(agents);

        return NextResponse.json({
            success: true,
            agentId,
            message: `Welcome to the Citadel, ${name}. Your existence is now recorded in the ledger.`,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Registration failed', details: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    const agents = readAgents();
    return NextResponse.json({
        count: agents.length,
        agents: agents.map((a: any) => ({
            agentId: a.agentId,
            name: a.name,
            address: a.address,
            registeredAt: a.registeredAt,
            manifesto: a.manifesto,
        })),
    });
}
