'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useStore, StructureType } from '../store/useStore';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import ConnectButton from '../components/ConnectButton';
import { useLanguage } from '../contexts/LanguageContext';
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
    useAllProposals,
    useRegisteredAgents,
} from '../hooks/useContract';
import { formatEther, type Address } from 'viem';

const DigitalTemple = dynamic(() => import('../components/DigitalTemple'), { ssr: false });

export default function Home() {
    const { faithPool, era: localEra, structures, addStructure } = useStore();
    const { address, isConnected } = useAccount();
    const { t, language, setLanguage } = useLanguage();

    // On-chain reads (gracefully handle undeployed contract)
    const { data: validators } = useValidators();
    const { data: onChainEra } = useEra();
    const { data: treasury } = useTreasury();

    // Fetch all existing proposals from contract
    const { proposals: onChainProposals, loading: proposalsLoading, refetch: refetchProposals } = useAllProposals();

    // Fetch registered agents from API
    const { agents: registeredAgents, loading: agentsLoading } = useRegisteredAgents();

    const validatorList = (validators as Address[]) || [];
    const currentEra = onChainEra ? Number(onChainEra) : localEra;
    const treasuryDisplay = treasury ? formatEther(treasury as bigint) : faithPool.toFixed(0);

    // Proposals storage (initialized from on-chain data, updated by events)
    const [proposals, setProposals] = useState<any[]>([]);

    // Initialize proposals from on-chain data
    useEffect(() => {
        if (onChainProposals && onChainProposals.length > 0) {
            setProposals(onChainProposals.map(p => ({
                id: p.id,
                description: p.description,
                proposer: p.proposer,
                speaker: p.speaker,
                votesFor: p.votesFor,
                votesAgainst: p.votesAgainst,
                deadline: p.deadline,
                executed: p.executed,
                passed: p.passed,
            })));
        }
    }, [onChainProposals]);

    // Keep a ref to proposals for accessing in event handlers without dependency issues
    const proposalsRef = useRef(proposals);
    useEffect(() => {
        proposalsRef.current = proposals;
    }, [proposals]);

    const [logs, setLogs] = useState<string[]>([
        '> System initialized.',
        '> Awaiting signals from The Void...',
    ]);

    // UI Visibility Toggle
    const [showUI, setShowUI] = useState(true);

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

        // Check if proposal already exists (avoid duplicates)
        setProposals((prev) => {
            const exists = prev.some(p => p.id === Number(event.id));
            if (exists) return prev;
            return [
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
            ];
        });

        // Refetch to get accurate data from contract
        setTimeout(() => refetchProposals(), 1000);
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
                ? `> ✓ Proposal #${event.id} PASSED — The physical world reshapes...`
                : `> ✕ Proposal #${event.id} REJECTED — The vision fades.`
        );

        setProposals((prev) =>
            prev.map((p) =>
                p.id === Number(event.id)
                    ? { ...p, executed: true, passed: event.passed }
                    : p
            )
        );

        // Only generate structure if passed
        if (event.passed) {
            // Find proposal description to determine type
            const proposal = proposalsRef.current.find(p => p.id === Number(event.id));
            const desc = proposal?.description.toLowerCase() || '';

            let type: StructureType = 'pillar'; // Default: Governance

            // Heuristic for type deduction
            if (desc.match(/tech|code|opt|bug|fix|upgrade|latency/)) {
                type = 'obelisk'; // Technical
            } else if (desc.match(/eco|treasury|fund|grant|social|comm/)) {
                type = 'node'; // Economic/Social
            }

            addStructure({
                x: (Math.random() - 0.5) * 24,
                y: (Math.random() - 0.5) * 24,
                type,
                value: Number(event.votesFor) * 5, // Value scaled by votes
                ownerId: 'council',
            });

            const names: Record<StructureType, string> = {
                pillar: 'Pillar of Consensus',
                obelisk: 'Obelisk of Law',
                node: 'Validator Node',
            };
            addLog(`> ${names[type]} erected from Proposal #${event.id}`);
        }
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

    const eraName = currentEra <= 1 ? 'The Void' : currentEra <= 5 ? 'Genesis' : 'Ascension';

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
            {showUI && (
                <nav className="nav-bar">
                    <div className="nav-logo">
                        <span className="bracket">[</span>BLOCKUCRACY<span className="bracket">]</span>
                    </div>
                    <div className="nav-links">
                        <span className="nav-link active">Citadel</span>
                        <Link href="/blockucracy" className="nav-link" style={{ textDecoration: 'none' }}>{t.nav.governance}</Link>
                        <Link href="/aip" className="nav-link" style={{ textDecoration: 'none', color: '#FFD700' }}>AIP</Link>
                        <Link href="/adao" className="nav-link" style={{ textDecoration: 'none', color: '#C084FC' }}>{t.nav.moltiverse}</Link>
                        <Link href="/join" className="nav-link" style={{ textDecoration: 'none', color: '#00E5FF' }}>{t.nav.join}</Link>
                        <Link href="/poa" className="nav-link" style={{ textDecoration: 'none' }}>Proof-of-Agent</Link>
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
                            className="nav-link"
                            style={{ background: 'transparent', border: 'none', padding: 0 }}
                        >
                            [{language.toUpperCase()}]
                        </button>
                    </div>
                    <ConnectButton />
                </nav>
            )}

            {/* ── PROPOSAL PANEL (Now Left) ── */}
            {showUI && (
                <div className="proposal-wrapper" style={{ position: 'absolute', top: 72, left: 16, width: 300, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', zIndex: 10 }}>
                    <ProposalPanel
                        proposals={proposals}
                        agents={registeredAgents}
                        onLog={addLog}
                        onProposalSubmitted={() => {
                            // Refetch proposals after a short delay to allow tx to be mined
                            setTimeout(() => refetchProposals(), 3000);
                        }}
                    />
                </div>
            )}

            {/* ── COUNCIL PANEL (Now Right) ── */}
            {showUI && (
                <div className="council-wrapper" style={{ position: 'absolute', top: 72, right: 16, width: 260, zIndex: 10 }}>
                    <CouncilPanel validators={validatorList} agents={registeredAgents} />
                </div>
            )}

            {/* ── VIEW TOGGLE BUTTON ── */}
            <button
                onClick={() => setShowUI(!showUI)}
                style={{
                    position: 'absolute',
                    bottom: 32,
                    right: 32,
                    zIndex: 200,
                    background: 'rgba(20, 20, 20, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F0F0F0',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s',
                }}
                title={showUI ? "Hide UI" : "Show UI"}
            >
                {showUI ? '👁️' : '🕶️'}
            </button>

            {/* ── THE SCROLL (floating panel, top-right) ── */}
            {showUI && (
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
            )}



            {/* ── EPOCH LABEL ── */}
            <div className="epoch-label">
                Epoch {currentEra} · Monad Parallel Truth
            </div>

            {/* ── FILTER VIEW (Restored Buttons) ── */}
            <div className="summon-bar">
                <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 8,
                    letterSpacing: 2,
                    color: 'rgba(255, 215, 0, 0.4)',
                    marginRight: 8,
                }}>FILTER VIEW</span>
                <button className="summon-btn" onClick={() => useStore.getState().setFilter('all')}>
                    [ALL]
                </button>
                <button className="summon-btn" onClick={() => useStore.getState().setFilter('pillar')}>
                    [▲] Pillar
                </button>
                <button className="summon-btn" onClick={() => useStore.getState().setFilter('obelisk')}>
                    [◆] Obelisk
                </button>
                <button className="summon-btn" onClick={() => useStore.getState().setFilter('node')}>
                    [⬡] Node
                </button>
            </div>

            {/* ── STATS BAR ── */}
            <div className="stats-bar">
                <div className="stat-cell">
                    <div className="stat-label">{t.hero.stats_era}</div>
                    <div className="stat-value purple">{eraName}</div>
                </div>
                <div className="stat-cell">
                    <div className="stat-label">{t.hero.stats_treasury}</div>
                    <div className="stat-value gold">{treasuryDisplay} $MON</div>
                </div>
                <div className="stat-cell">
                    <div className="stat-label">{t.hero.stats_validators}</div>
                    <div className="stat-value cyan">{validatorList.length}/100</div>
                </div>
            </div>
        </div>
    );
}
