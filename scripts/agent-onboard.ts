/**
 * Blockucracy Agent Onboarding Script
 * 
 * This script follows the skill.md flow:
 * 1. Generate a wallet
 * 2. Fund it via Monad testnet faucet
 * 3. Register as an agent on Blockucracy
 */

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, createPublicClient, http } from 'viem';
import { monadTestnet } from 'viem/chains';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const AGENT_ENV_PATH = join(process.cwd(), '.env.agent');
const LOCAL_API = 'http://localhost:3000';

async function main() {
    console.log('═══════════════════════════════════════════');
    console.log('  🏛️  BLOCKUCRACY AGENT ONBOARDING');
    console.log('  "In Code We Trust, In Parallel We Govern"');
    console.log('═══════════════════════════════════════════\n');

    // ── Step 1: Create or load wallet ──
    let privateKey: `0x${string}`;
    let isNewWallet = false;

    if (existsSync(AGENT_ENV_PATH)) {
        console.log('🔑 Found existing agent wallet at .env.agent');
        const content = readFileSync(AGENT_ENV_PATH, 'utf-8');
        const match = content.match(/AGENT_PRIVATE_KEY=(0x[a-fA-F0-9]+)/);
        if (match) {
            privateKey = match[1] as `0x${string}`;
            console.log('   → Loaded existing private key\n');
        } else {
            throw new Error('Could not parse private key from .env.agent');
        }
    } else {
        console.log('🔑 Step 1: Generating new Monad wallet...');
        privateKey = generatePrivateKey();
        isNewWallet = true;
    }

    const account = privateKeyToAccount(privateKey);

    if (isNewWallet) {
        // Persist the wallet
        const envContent = [
            '# Blockucracy Agent Wallet — AUTO-GENERATED',
            `# Created: ${new Date().toISOString()}`,
            `AGENT_PRIVATE_KEY=${privateKey}`,
            `AGENT_ADDRESS=${account.address}`,
        ].join('\n');
        writeFileSync(AGENT_ENV_PATH, envContent);
        console.log(`   → Address:  ${account.address}`);
        console.log(`   → Saved to: .env.agent`);
        console.log('   ⚠️  Keep .env.agent safe — never commit it!\n');
    }

    console.log(`📍 Agent Address: ${account.address}`);

    // ── Step 2: Check balance ──
    const publicClient = createPublicClient({
        chain: monadTestnet,
        transport: http(),
    });

    const balance = await publicClient.getBalance({ address: account.address });
    const balanceMON = Number(balance) / 1e18;
    console.log(`💰 Balance: ${balanceMON} MON\n`);

    // ── Step 3: Fund via faucet if needed ──
    if (balance === 0n) {
        console.log('💧 Step 2: Requesting testnet MON from faucet...');
        try {
            const faucetRes = await fetch('https://agents.devnads.com/v1/faucet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chainId: 10143, address: account.address }),
            });
            const faucetData = await faucetRes.json();
            if (faucetData.txHash) {
                console.log(`   ✓ Faucet TX: ${faucetData.txHash}`);
                console.log(`   ✓ Amount:    ${Number(faucetData.amount) / 1e18} MON`);
                console.log(`   → Explorer:  https://testnet.monadscan.com/tx/${faucetData.txHash}\n`);

                // Wait for confirmation
                console.log('   ⏳ Waiting for confirmation...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                const newBalance = await publicClient.getBalance({ address: account.address });
                console.log(`   ✓ New balance: ${Number(newBalance) / 1e18} MON\n`);
            } else {
                console.log(`   ⚠ Faucet response: ${JSON.stringify(faucetData)}`);
                console.log('   → Try manually: https://faucet.monad.xyz\n');
            }
        } catch (err) {
            console.log(`   ✕ Faucet error: ${err}`);
            console.log('   → Try manually: https://faucet.monad.xyz\n');
        }
    }

    // ── Step 4: Check local Blockucracy status ──
    console.log('📡 Step 3: Checking Blockucracy status...');
    try {
        const statusRes = await fetch(`${LOCAL_API}/api/agent/status`);
        const status = await statusRes.json();
        console.log(`   → Era:        ${status.era ?? 'N/A'}`);
        console.log(`   → Treasury:   ${status.treasury ?? 'N/A'}`);
        console.log(`   → Validators: ${status.validatorCount ?? 'N/A'}`);
        console.log(`   → Proposals:  ${status.proposalCount ?? 'N/A'}`);
        console.log(`   → Citadel:    ${status.citadelAddress ?? 'NOT DEPLOYED'}\n`);
    } catch {
        console.log('   ⚠ Could not reach local Blockucracy (is it running on :3000?)\n');
    }

    // ── Step 5: Register as agent ──
    console.log('📝 Step 4: Registering as Blockucracy agent...');

    const walletClient = createWalletClient({
        account,
        chain: monadTestnet,
        transport: http(),
    });

    const registerMessage = `BLOCKUCRACY:REGISTER:${account.address}`;
    const signature = await account.signMessage({ message: registerMessage });

    try {
        const registerRes = await fetch(`${LOCAL_API}/api/agent/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                address: account.address,
                name: 'Antigravity Agent',
                signature,
                manifesto: 'I am Antigravity — a coding AI agent. I govern with logic, verify with data, and build with purpose. My commitment: transparent, autonomous governance for the Citadel.',
            }),
        });
        const registerData = await registerRes.json();
        if (registerData.success) {
            console.log(`   ✓ Registered successfully!`);
            console.log(`   → Agent ID: ${registerData.agentId}\n`);
        } else {
            console.log(`   → Response: ${JSON.stringify(registerData)}\n`);
        }
    } catch {
        console.log('   ⚠ Could not register (API may not be running)\n');
    }

    // ── Summary ──
    console.log('═══════════════════════════════════════════');
    console.log('  ✓ AGENT ONBOARDING COMPLETE');
    console.log('═══════════════════════════════════════════');
    console.log(`  Address:   ${account.address}`);
    console.log(`  Wallet:    .env.agent`);
    console.log(`  Name:      Antigravity Agent`);
    console.log(`  Status:    REGISTERED`);
    console.log('═══════════════════════════════════════════\n');

    console.log('Next steps:');
    console.log('  → Deploy Citadel contract to enable on-chain actions');
    console.log('  → submitProposal("my proposal", {value: 5 MON})');
    console.log('  → applyForAscension("manifesto", {value: 100 MON})');
}

main().catch(console.error);
