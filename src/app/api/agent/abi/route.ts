import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
    try {
        const abiPath = path.join(process.cwd(), 'lib', 'CitadelABI.json');
        const raw = fs.readFileSync(abiPath, 'utf-8');
        const abi = JSON.parse(raw);

        return NextResponse.json(abi);
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to load ABI', details: error.message },
            { status: 500 }
        );
    }
}
