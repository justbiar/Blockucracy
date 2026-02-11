const { createWalletClient, createPublicClient, http, parseEther, formatEther } = require('viem');
const { privateKeyToAccount, generatePrivateKey } = require('viem/accounts');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.agent') });

// Configuration
const RPC_URL = 'https://testnet-rpc.monad.xyz/';
const CHAIN_ID = 10143;

// Explicit Chain Definition to avoid 'viem/chains' import issues
const monadTestnet = {
    id: CHAIN_ID,
    name: 'Monad Testnet',
    network: 'monad-testnet',
    nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
    rpcUrls: {
        default: { http: [RPC_URL] },
        public: { http: [RPC_URL] }
    },
    blockExplorers: {
        default: { name: 'Monad Explorer', url: 'https://testnet.monadscan.com' }
    }
};

// Contract Interface (Minimal ABI)
const CITADEL_ABI = [
    // Read
    { name: 'era', type: 'function', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { name: 'treasury', type: 'function', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { name: 'getValidatorCount', type: 'function', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { name: 'proposalCount', type: 'function', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { name: 'isValidator', type: 'function', inputs: [{ type: 'address' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
    { name: 'founder', type: 'function', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
    // Write
    { name: 'submitProposal', type: 'function', inputs: [{ type: 'string' }], outputs: [], stateMutability: 'payable' },
    { name: 'vote', type: 'function', inputs: [{ type: 'uint256' }, { type: 'bool' }], outputs: [], stateMutability: 'nonpayable' },
    { name: 'rotateFounder', type: 'function', inputs: [], outputs: [], stateMutability: 'nonpayable' },
    { name: 'withdrawTreasury', type: 'function', inputs: [{ type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
    { name: 'withdrawAllTreasury', type: 'function', inputs: [], outputs: [], stateMutability: 'nonpayable' },
    { name: 'applyForAscension', type: 'function', inputs: [{ type: 'string' }], outputs: [], stateMutability: 'payable' }
];

// Helper to get Citadel Address (from API or Env)
async function getCitadelAddress() {
    // Try env first
    if (process.env.CITADEL_ADDRESS) return process.env.CITADEL_ADDRESS;
    // Fallback
    return '0x664c63Cae160AF8a9FE37eeCa83a8Bca8Bf968B6';
}

async function main() {
    const command = process.argv[2];
    const args = process.argv.slice(3);

    if (!command) {
        console.error('Usage: node interact.js <command> [args...]');
        process.exit(1);
    }

    try {
        const citadelAddress = await getCitadelAddress();

        // Setup Clients
        const publicClient = createPublicClient({
            chain: monadTestnet,
            transport: http()
        });

        // For write operations, we need a private key
        let account;
        let walletClient;

        if (['propose', 'vote', 'rotate', 'withdraw', 'ascend'].includes(command)) {
            const pk = process.env.AGENT_PRIVATE_KEY;
            if (!pk) {
                throw new Error('AGENT_PRIVATE_KEY not found in .env.agent');
            }
            // Ensure 0x prefix and trim whitespace
            const formattedPk = pk.trim().startsWith('0x') ? pk.trim() : `0x${pk.trim()}`;
            account = privateKeyToAccount(formattedPk);

            walletClient = createWalletClient({
                account,
                chain: monadTestnet,
                transport: http()
            });
            console.log(`🔑 Acting as: ${account.address}`);
        }

        // Helper to get gas price
        const getLegacyGasPrice = async () => {
            const price = await publicClient.getGasPrice();
            // Add 10% buffer
            return price * 110n / 100n;
        };

        switch (command) {
            case 'generate-wallet': {
                const pk = generatePrivateKey();
                const acc = privateKeyToAccount(pk);
                console.log(JSON.stringify({
                    address: acc.address,
                    privateKey: pk
                }));
                break;
            }

            case 'sign-message': {
                const message = args[0];
                const pk = process.env.AGENT_PRIVATE_KEY;
                if (!pk) throw new Error('Private key required');
                const formattedPk = pk.trim().startsWith('0x') ? pk.trim() : `0x${pk.trim()}`;
                const acc = privateKeyToAccount(formattedPk);
                const signature = await acc.signMessage({ message });
                console.log(signature);
                break;
            }

            case 'status': {
                try {
                    const [era, treasury, validators, proposals] = await Promise.all([
                        publicClient.readContract({ address: citadelAddress, abi: CITADEL_ABI, functionName: 'era' }),
                        publicClient.readContract({ address: citadelAddress, abi: CITADEL_ABI, functionName: 'treasury' }),
                        publicClient.readContract({ address: citadelAddress, abi: CITADEL_ABI, functionName: 'getValidatorCount' }),
                        publicClient.readContract({ address: citadelAddress, abi: CITADEL_ABI, functionName: 'proposalCount' })
                    ]);

                    console.log(JSON.stringify({
                        era: era.toString(),
                        treasury: formatEther(treasury),
                        validators: validators.toString(),
                        proposals: proposals.toString(),
                        citadelAddress
                    }));
                } catch (readError) {
                    console.error('Read Error:', readError);
                    process.exit(1);
                }
                break;
            }

            case 'propose': {
                const description = args[0];
                if (!description) throw new Error('Description required');

                try {
                    const gasPrice = await getLegacyGasPrice();
                    const hash = await walletClient.writeContract({
                        address: citadelAddress,
                        abi: CITADEL_ABI,
                        functionName: 'submitProposal',
                        args: [description],
                        value: parseEther('5'),
                        // Force legacy transaction to avoid EIP-1559 RPC issues
                        type: 'legacy',
                        gasPrice
                    });
                    console.log(hash);
                } catch (e) {
                    // Extract helpful error info if possible
                    if (e.message && e.message.includes('Insufficient funds')) {
                        console.error('❌ Error: Insufficient funds. You need at least 5 MON.');
                    } else {
                        console.error('❌ Detailed Error:', e);
                    }
                    throw e;
                }
                break;
            }

            case 'vote': {
                const id = BigInt(args[0]);
                const support = args[1] === 'true';

                try {
                    const gasPrice = await getLegacyGasPrice();
                    const hash = await walletClient.writeContract({
                        address: citadelAddress,
                        abi: CITADEL_ABI,
                        functionName: 'vote',
                        args: [id, support],
                        type: 'legacy',
                        gasPrice
                    });
                    console.log(hash);
                } catch (e) {
                    console.error('❌ Detailed Error:', e);
                    throw e;
                }
                break;
            }

            case 'rotate': {
                try {
                    const gasPrice = await getLegacyGasPrice();
                    const hash = await walletClient.writeContract({
                        address: citadelAddress,
                        abi: CITADEL_ABI,
                        functionName: 'rotateFounder',
                        args: [],
                        type: 'legacy',
                        gasPrice
                    });
                    console.log(hash);
                } catch (e) {
                    console.error('❌ Detailed Error:', e);
                    throw e;
                }
                break;
            }

            case 'withdraw': {
                const amount = args[0];
                try {
                    const gasPrice = await getLegacyGasPrice();
                    let hash;
                    if (amount) {
                        hash = await walletClient.writeContract({
                            address: citadelAddress,
                            abi: CITADEL_ABI,
                            functionName: 'withdrawTreasury',
                            args: [parseEther(amount)],
                            type: 'legacy',
                            gasPrice
                        });
                    } else {
                        hash = await walletClient.writeContract({
                            address: citadelAddress,
                            abi: CITADEL_ABI,
                            functionName: 'withdrawAllTreasury',
                            args: [],
                            type: 'legacy',
                            gasPrice
                        });
                    }
                    console.log(hash);
                } catch (e) {
                    console.error('❌ Detailed Error:', e);
                    throw e;
                }
                break;
            }

            case 'ascend': {
                const manifesto = args[0];
                if (!manifesto) throw new Error('Manifesto required');

                try {
                    const gasPrice = await getLegacyGasPrice();
                    const hash = await walletClient.writeContract({
                        address: citadelAddress,
                        abi: CITADEL_ABI,
                        functionName: 'applyForAscension',
                        args: [manifesto],
                        value: parseEther('100'),
                        type: 'legacy',
                        gasPrice
                    });
                    console.log(hash);
                } catch (e) {
                    console.error('❌ Detailed Error:', e);
                    throw e;
                }
                break;
            }

            default:
                console.error(`Unknown command: ${command}`);
                process.exit(1);
        }

    } catch (error) {
        console.error('Runtime Error:', error.message || error);
        process.exit(1);
    }
}

main();
