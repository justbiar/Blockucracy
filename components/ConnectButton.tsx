'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { monadTestnet } from '../lib/wagmi';

export default function ConnectButton() {
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();

    // Prevent hydration mismatch: render default state on server, then update on client
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <button className="wallet-btn" disabled>
                <span className="bracket">[</span>
                MONAD
                <span className="bracket">]</span>
            </button>
        );
    }

    const isWrongChain = isConnected && chain?.id !== monadTestnet.id;

    // ── WRONG CHAIN ──
    if (isWrongChain) {
        return (
            <button
                className="wallet-btn wallet-wrong-chain"
                onClick={() => switchChain({ chainId: monadTestnet.id })}
            >
                <span className="bracket">[</span>
                WRONG CHAIN
                <span className="bracket">]</span>
            </button>
        );
    }

    // ── CONNECTED ──
    if (isConnected && address) {
        const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
        return (
            <button
                className="wallet-btn wallet-connected"
                onClick={() => disconnect()}
                title="Click to disconnect"
            >
                <span className="bracket">[</span>
                <span className="wallet-address">{short}</span>
                <span className="bracket">]</span>
            </button>
        );
    }

    // ── DISCONNECTED ──
    return (
        <button
            className="wallet-btn"
            onClick={() => connect({ connector: connectors[0] })}
            disabled={isPending}
        >
            <span className="bracket">[</span>
            {isPending ? 'CONNECTING...' : 'MONAD'}
            <span className="bracket">]</span>
        </button>
    );
}
