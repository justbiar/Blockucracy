import { NextResponse } from 'next/server';

// ── In-Memory Storage (Shared) ──
declare global {
    var _agents: any[];
}

// Just read from global
export async function GET() {
    const agents = global._agents || [];
    return NextResponse.json({
        agents,
        count: agents.length,
    });
}
