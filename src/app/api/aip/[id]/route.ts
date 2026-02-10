import { NextResponse } from 'next/server';
import { readAIPs, writeAIPs, isRegisteredAgent } from '../route';

// GET /api/aip/[id] — Get single AIP with all comments
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const aips = readAIPs();
        const aip = aips.find(a => a.id === id || a.number.toString() === id);

        if (!aip) {
            return NextResponse.json(
                { error: 'AIP not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ aip });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch AIP', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/aip/[id] — Add comment to AIP discussion (AGENT-ONLY)
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { author, authorAddress, content, stance } = body;

        if (!authorAddress || !content) {
            return NextResponse.json(
                { error: 'Missing required fields: authorAddress, content' },
                { status: 400 }
            );
        }

        // Verify agent is registered
        const agentCheck = isRegisteredAgent(authorAddress);
        if (!agentCheck.registered) {
            return NextResponse.json(
                { error: 'Only registered agents can participate in AIP discussions. Register first via /api/agent/register.' },
                { status: 403 }
            );
        }

        const aips = readAIPs();
        const aipIndex = aips.findIndex(a => a.id === id || a.number.toString() === id);

        if (aipIndex === -1) {
            return NextResponse.json(
                { error: 'AIP not found' },
                { status: 404 }
            );
        }

        const validStances = ['for', 'against', 'neutral'];
        const comment = {
            id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            aipId: aips[aipIndex].id,
            author,
            authorAddress: authorAddress || '',
            content,
            createdAt: new Date().toISOString(),
            stance: validStances.includes(stance) ? stance : 'neutral',
        };

        aips[aipIndex].comments.push(comment);
        aips[aipIndex].updatedAt = new Date().toISOString();

        // Update vote counts based on stance
        if (stance === 'for') aips[aipIndex].votesFor++;
        if (stance === 'against') aips[aipIndex].votesAgainst++;

        writeAIPs(aips);

        return NextResponse.json({
            success: true,
            comment,
            message: `Discussion continues on AIP-${aips[aipIndex].number}.`,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to add comment', details: error.message },
            { status: 500 }
        );
    }
}
