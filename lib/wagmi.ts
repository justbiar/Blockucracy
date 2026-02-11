import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

/* ── Monad Testnet Chain Definition ── */
export const monadTestnet = defineChain({
    id: 10143,
    name: 'Monad Testnet',
    nativeCurrency: {
        name: 'MON',
        symbol: 'MON',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://testnet-rpc.monad.xyz/'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Monad Explorer',
            url: 'https://testnet.monadexplorer.com',
        },
    },
    testnet: true,
});

/* ── Wagmi Config ── */
export const config = createConfig({
    chains: [monadTestnet],
    connectors: [injected()],
    transports: {
        [monadTestnet.id]: http(),
    },
});
