'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useStore, StructureType } from '../store/useStore';
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import ConnectButton from '../components/ConnectButton';
import ProposalPanel from '../components/ProposalPanel';
import CouncilPanel from '../components/CouncilPanel';
import {
    useValidators,
    useEra,
    useTreasury,
    useWatchProposalCreated,
    useWatchVoteCast,
    useWatchProposalExecuted,
    useWatchValidatorAscended,
} from '../hooks/useContract';
import { formatEther, type Address } from 'viem';

const DigitalTemple = dynamic(() => import('../components/DigitalTemple'), { ssr: false });

export default function Home() {
    const { faithPool, era: localEra, structures, addStructure } = useStore();
    const { address, isConnected } = useAccount();

    // On-chain reads (gracefully handle undeployed contract)
    const { data: validators } = useValidators();
    const { data: onChainEra } = useEra();
    const { data: treasury } = useTreasury();

    const validatorList = (validators as Address[]) || [];
    const currentEra = onChainEra ? Number(onChainEra) : localEra;
    const treasuryDisplay = treasury ? formatEther(treasury as bigint) : faithPool.toFixed(0);

    // Proposals storage (populated from events)
    const [proposals, setProposals] = useState<any[]>([]);

    const [logs, setLogs] = useState<string[]>([
        '> System initialized.',
        '> Awaiting signals from The Void...',
    ]);

    const addLog = useCallback((msg: string) => {
        setLogs((prev) => [...prev, msg]);
    }, []);

    // Log wallet connection
    useEffect(() => {
        if (isConnected && address) {
            const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
            addLog(`> Citizen ${short} entered the Citadel`);
        }
    }, [isConnected, address, addLog]);

    // ── ON-CHAIN EVENT WATCHERS ──
    useWatchProposalCreated((event) => {
        const short = `${event.proposer.slice(0, 6)}...${event.proposer.slice(-4)}`;
        addLog(`> Proposal #${event.id} by ${short}: "${event.description}"`);

        setProposals((prev) => [
            ...prev,
            {
                id: Number(event.id),
                description: event.description,
                proposer: event.proposer,
                speaker: event.speaker,
                votesFor: 0,
                votesAgainst: 0,
                deadline: Number(event.deadline),
                executed: false,
                passed: false,
            },
        ]);

        // Add a pillar placeholder in the 3D scene
        addStructure({
            x: (Math.random() - 0.5) * 24,
            y: (Math.random() - 0.5) * 24,
            type: 'pillar',
            value: 5,
            ownerId: event.proposer,
        });
    });

    useWatchVoteCast((event) => {
        const short = `${event.voter.slice(0, 6)}...${event.voter.slice(-4)}`;
        addLog(`> Vote on #${event.proposalId}: ${event.support ? '▲ FOR' : '▼ AGAINST'} by ${short}`);

        setProposals((prev) =>
            prev.map((p) =>
                p.id === Number(event.proposalId)
                    ? {
                        ...p,
                        votesFor: p.votesFor + (event.support ? 1 : 0),
                        votesAgainst: p.votesAgainst + (event.support ? 0 : 1),
                    }
                    : p
            )
        );
    });

    useWatchProposalExecuted((event) => {
        addLog(
            event.passed
                ? `> ✓ Proposal #${event.id} PASSED — Pillar of Consensus erected`
                : `> ✕ Proposal #${event.id} REJECTED — Fallen Obelisk crumbles`
        );

        setProposals((prev) =>
            prev.map((p) =>
                p.id === Number(event.id)
                    ? { ...p, executed: true, passed: event.passed }
                    : p
            )
        );

        // 3D construction based on result
        const type: StructureType = event.passed ? 'obelisk' : 'node';
        addStructure({
            x: (Math.random() - 0.5) * 24,
            y: (Math.random() - 0.5) * 24,
            type,
            value: Number(event.votesFor),
            ownerId: 'council',
        });
    });

    useWatchValidatorAscended((event) => {
        const short = `${event.newValidator.slice(0, 6)}...${event.newValidator.slice(-4)}`;
        addLog(`> ⚡ ${short} ASCENDED — Validator #${event.totalValidators}`);

        addStructure({
            x: (Math.random() - 0.5) * 24,
            y: (Math.random() - 0.5) * 24,
            type: 'obelisk',
            value: 100,
            ownerId: event.newValidator,
        });
    });

    // ── LOCAL SUMMON (for demo without contract) ──
    const handleAddStructure = useCallback(
        (type: StructureType) => {
            const x = (Math.random() - 0.5) * 24;
            const y = (Math.random() - 0.5) * 24;
            const value = Math.floor(Math.random() * 10) + 2;

            addStructure({
                x, y, type, value,
                ownerId: address || 'anon-' + Math.random().toString(36).substr(2, 4),
            });

            const names: Record<StructureType, string> = {
                pillar: 'Pillar of Consensus',
                obelisk: 'Obelisk of Law',
                node: 'Validator Node',
            };
            addLog(`> ${names[type]} erected — ${value} $MON`);
        },
        [addStructure, address, addLog]
    );

    const eraName = currentEra <= 2 ? 'The Void' : currentEra <= 5 ? 'Genesis' : 'Ascension';

    return (
        <div
            style={{
                position: 'relative',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                background: '#141414',
            }}
        >
            {/* ── 3D SCENE ── */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                <DigitalTemple />
            </div>

            {/* ── STICKY NAV BAR ── */}
            <nav className="nav-bar">
                <div className="nav-logo">
                    <span className="bracket">[</span>BLOCKUCRACY<span className="bracket">]</span>
                </div>
                <div className="nav-links">
                    <span className="nav-link active">Citadel</span>
                    <Link href="/blockucracy" className="nav-link" style={{ textDecoration: 'none' }}>Blockucracy</Link>
                    <Link href="/aip" className="nav-link" style={{ textDecoration: 'none', color: '#FFD700' }}>AIP</Link>
                    <Link href="/join" className="nav-link" style={{ textDecoration: 'none', color: '#00E5FF' }}>Join</Link>
                    <Link href="/poa" className="nav-link" style={{ textDecoration: 'none' }}>Proof-of-Agent</Link>
                </div>
                <ConnectButton />
            </nav>

            {/* ── COUNCIL PANEL (top-left) ── */}
            <div className="council-wrapper" style={{ position: 'absolute', top: 72, left: 16, width: 260, zIndex: 10 }}>
                <CouncilPanel validators={validatorList} />
            </div>

            {/* ── THE SCROLL (floating panel, top-right) ── */}
            <div className="scroll-panel">
                <div className="scroll-header">
                    <span className="scroll-title">The Scroll</span>
                </div>
                <div className="scroll-body">
                    {logs.map((log, i) => (
                        <motion.div
                            key={i}
                            className={`scroll-entry ${i === 0 ? 'system' : i >= 2 ? 'highlight' : ''}`}
                            initial={{ opacity: 0, x: 6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {log}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── PROPOSAL PANEL (left side, below council) ── */}
            <div className="proposal-wrapper" style={{ position: 'absolute', top: 72, left: 290, width: 300, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', zIndex: 10 }}>
                <ProposalPanel
                    proposals={proposals}
                    onLog={addLog}
                />
            </div>

            {/* ── EPOCH LABEL ── */}
            <div className="epoch-label">
                Epoch {currentEra} · Monad Parallel Truth
            </div>

            {/* ── SUMMON CONTROLS (LOCAL DEMO) ── */}
            <div className="summon-bar">
                <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 8,
                    letterSpacing: 2,
                    color: 'rgba(255, 215, 0, 0.4)',
                    marginRight: 8,
                }}>DEMO</span>
                <button className="summon-btn" onClick={() => handleAddStructure('pillar')}>
                    [▲] Pillar
                </button>
                <button className="summon-btn" onClick={() => handleAddStructure('obelisk')}>
                    [◆] Obelisk
                </button>
                <button className="summon-btn" onClick={() => handleAddStructure('node')}>
                    [⬡] Node
                </button>
            </div>

            {/* ── STATS BAR ── */}
            <div className="stats-bar">
                <div className="stat-cell">
                    <div className="stat-label">Current Era</div>
                    <div className="stat-value purple">{eraName}</div>
                </div>
                <div className="stat-cell">
                    <div className="stat-label">Treasury</div>
                    <div className="stat-value gold">{treasuryDisplay} $MON</div>
                </div>
                <div className="stat-cell">
                    <div className="stat-label">Validators</div>
                    <div className="stat-value cyan">{validatorList.length}/100</div>
                </div>
            </div>
        </div>
    );
}
