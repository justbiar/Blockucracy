'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import {
    useSubmitProposal,
    useVote,
    useExecuteProposal,
    useIsValidator,
} from '../hooks/useContract';
import type { Address } from 'viem';

interface ProposalDisplay {
    id: number;
    description: string;
    proposer: string;
    speaker: string;
    votesFor: number;
    votesAgainst: number;
    deadline: number;
    executed: boolean;
    passed: boolean;
}

interface ProposalPanelProps {
    proposals: ProposalDisplay[];
    agents: { address: string }[];
    onProposalSubmitted?: () => void;
    onLog?: (message: string) => void;
}

const mono = "'Space Mono', monospace";
const display = "'Space Grotesk', sans-serif";

const panelStyle: React.CSSProperties = {
    background: 'rgba(20, 20, 20, 0.92)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
};

const titleStyle: React.CSSProperties = {
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: 3,
    color: 'rgba(240, 240, 240, 0.5)',
    textTransform: 'uppercase',
};

const actionBtnStyle: React.CSSProperties = {
    fontFamily: mono,
    fontSize: 10,
    letterSpacing: 1,
    color: '#FFD700',
    background: 'transparent',
    border: '1px solid rgba(255, 215, 0, 0.25)',
    padding: '4px 10px',
    cursor: 'pointer',
    borderRadius: 2,
};

export default function ProposalPanel({ proposals, agents, onProposalSubmitted, onLog }: ProposalPanelProps) {
    const { address, isConnected } = useAccount();
    const { data: isValidatorData } = useIsValidator(address as Address | undefined);

    // Check if current user is a registered agent
    const isAgent = agents.some(a => a.address.toLowerCase() === address?.toLowerCase());

    // Founder/Validators can vote, but we want to simulate "Agent Only"
    // The user requested: "for and rights should only be for agents"
    // Note: Solidity might allow validators, but UI will enforce Agent check.
    const canVote = isConnected && isAgent;

    const { submitProposal, txHash: submitTxHash, isSuccess: submitSuccess, isError: submitError, error: submitErr, isPending: isSubmitting } = useSubmitProposal();
    const { vote, txHash: voteTxHash, isSuccess: voteSuccess, isError: voteError, error: voteErr, isPending: isVoting } = useVote();
    const { executeProposal, txHash: execTxHash, isSuccess: execSuccess, isError: execError, error: execErr, isPending: isExecuting } = useExecuteProposal();

    const [mounted, setMounted] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [description, setDescription] = useState('');
    const [txStatus, setTxStatus] = useState<{ type: 'success' | 'error' | 'pending'; message: string; txHash?: string } | null>(null);

    useEffect(() => setMounted(true), []);

    const EXPLORER = 'https://testnet.monadexplorer.com/tx/';

    // Watch tx status changes
    useEffect(() => {
        if (submitSuccess && submitTxHash) {
            setTxStatus({ type: 'success', message: 'Proposal submitted on-chain!', txHash: submitTxHash });
            onLog?.(`> ✓ Proposal TX confirmed: ${submitTxHash.slice(0, 10)}...`);
            setTimeout(() => setTxStatus(null), 8000);
        }
    }, [submitSuccess, submitTxHash, onLog]);

    useEffect(() => {
        if (voteSuccess && voteTxHash) {
            setTxStatus({ type: 'success', message: 'Vote recorded on-chain!', txHash: voteTxHash });
            onLog?.(`> ✓ Vote TX confirmed: ${voteTxHash.slice(0, 10)}...`);
            setTimeout(() => setTxStatus(null), 8000);
        }
    }, [voteSuccess, voteTxHash, onLog]);

    useEffect(() => {
        if (execSuccess && execTxHash) {
            setTxStatus({ type: 'success', message: 'Proposal executed on-chain!', txHash: execTxHash });
            onLog?.(`> ✓ Execute TX confirmed: ${execTxHash.slice(0, 10)}...`);
            setTimeout(() => setTxStatus(null), 8000);
        }
    }, [execSuccess, execTxHash, onLog]);

    useEffect(() => {
        if (submitError && submitErr) {
            const msg = submitErr.message?.includes('User rejected') ? 'Transaction rejected by user' : submitErr.message?.slice(0, 80) || 'Transaction failed';
            setTxStatus({ type: 'error', message: msg });
            onLog?.(`> ✕ Proposal TX failed: ${msg}`);
            setTimeout(() => setTxStatus(null), 6000);
        }
    }, [submitError, submitErr, onLog]);

    useEffect(() => {
        if (voteError && voteErr) {
            const msg = voteErr.message?.includes('User rejected') ? 'Transaction rejected by user' : voteErr.message?.slice(0, 80) || 'Vote failed';
            setTxStatus({ type: 'error', message: msg });
            setTimeout(() => setTxStatus(null), 6000);
        }
    }, [voteError, voteErr]);

    useEffect(() => {
        if (execError && execErr) {
            const msg = execErr.message?.includes('User rejected') ? 'Transaction rejected by user' : execErr.message?.slice(0, 80) || 'Execute failed';
            setTxStatus({ type: 'error', message: msg });
            setTimeout(() => setTxStatus(null), 6000);
        }
    }, [execError, execErr]);

    const handleSubmit = () => {
        if (!description.trim()) return;
        setTxStatus({ type: 'pending', message: 'Awaiting wallet confirmation...' });
        submitProposal(description);
        onLog?.(`> Proposal submitted: "${description}" — 5 MON offering (awaiting tx...)`);
        setDescription('');
        setShowForm(false);
        onProposalSubmitted?.();
    };

    const handleVote = (proposalId: number, support: boolean) => {
        setTxStatus({ type: 'pending', message: 'Awaiting wallet confirmation...' });
        vote(proposalId, support);
        onLog?.(`> Vote cast on Proposal #${proposalId}: ${support ? 'FOR' : 'AGAINST'} (awaiting tx...)`);
    };

    const handleExecute = (proposalId: number) => {
        setTxStatus({ type: 'pending', message: 'Awaiting wallet confirmation...' });
        executeProposal(proposalId);
        onLog?.(`> Proposal #${proposalId} execution (awaiting tx...)`);
    };

    const [now, setNow] = useState(0);

    useEffect(() => {
        setNow(Math.floor(Date.now() / 1000));
    }, []);

    return (
        <div style={panelStyle}>
            <div style={headerStyle}>
                <span style={titleStyle}>The Council</span>
                {mounted && isConnected && (
                    <button
                        style={actionBtnStyle}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? '✕' : '+ VOW'}
                    </button>
                )}
            </div>

            {/* Transaction Status Toast */}
            {txStatus && (
                <div style={{
                    padding: '8px 14px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    background: txStatus.type === 'success' ? 'rgba(0, 229, 255, 0.08)' :
                        txStatus.type === 'error' ? 'rgba(255, 68, 68, 0.08)' :
                            'rgba(255, 215, 0, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}>
                    <span style={{
                        fontFamily: mono,
                        fontSize: 10,
                        color: txStatus.type === 'success' ? '#00E5FF' :
                            txStatus.type === 'error' ? '#ff4444' : '#FFD700',
                    }}>
                        {txStatus.type === 'success' ? '✓' : txStatus.type === 'error' ? '✕' : '◌'}
                    </span>
                    <span style={{
                        fontFamily: mono,
                        fontSize: 10,
                        color: 'rgba(240, 240, 240, 0.7)',
                        flex: 1,
                    }}>
                        {txStatus.message}
                    </span>
                    {txStatus.txHash && (
                        <a
                            href={`${EXPLORER}${txStatus.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontFamily: mono,
                                fontSize: 9,
                                letterSpacing: 1,
                                color: '#00E5FF',
                                textDecoration: 'none',
                                border: '1px solid rgba(0, 229, 255, 0.25)',
                                padding: '2px 6px',
                                borderRadius: 2,
                            }}
                        >
                            VIEW TX
                        </a>
                    )}
                </div>
            )}

            {/* Submit Proposal Form */}
            {showForm && (
                <motion.div
                    style={{
                        padding: 12,
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <div style={{
                        fontFamily: mono,
                        fontSize: 9,
                        letterSpacing: 1.5,
                        color: '#FFD700',
                        marginBottom: 8,
                    }}>THE VOW OF FIVE — 5 MON Offering</div>
                    <textarea
                        style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: 3,
                            color: '#F0F0F0',
                            fontFamily: mono,
                            fontSize: 11,
                            padding: 8,
                            resize: 'vertical',
                            outline: 'none',
                        }}
                        placeholder="Describe your proposal for the Citadel..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                    />
                    <button
                        style={{
                            width: '100%',
                            marginTop: 8,
                            fontFamily: mono,
                            fontSize: 11,
                            letterSpacing: 2,
                            padding: '8px 16px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: 2,
                            background: 'transparent',
                            color: '#F0F0F0',
                            cursor: isSubmitting || !description.trim() ? 'not-allowed' : 'pointer',
                            opacity: isSubmitting || !description.trim() ? 0.5 : 1,
                        }}
                        onClick={handleSubmit}
                        disabled={isSubmitting || !description.trim()}
                    >
                        {isSubmitting ? '[◌] SUBMITTING...' : '[⚡] SUBMIT PROPOSAL — 5 MON'}
                    </button>
                </motion.div>
            )}

            {/* Proposal List */}
            <div style={{ padding: 8 }}>
                {proposals.length === 0 ? (
                    <div style={{
                        fontFamily: mono,
                        fontSize: 11,
                        color: 'rgba(240, 240, 240, 0.25)',
                        padding: '8px 6px',
                    }}>{'> No active proposals'}</div>
                ) : (
                    proposals.map((p) => (
                        <motion.div
                            key={p.id}
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderLeft: p.executed
                                    ? p.passed
                                        ? '2px solid #00E5FF'
                                        : '2px solid #ff4444'
                                    : '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: 3,
                                padding: 10,
                                marginBottom: 6,
                                opacity: p.executed && !p.passed ? 0.6 : 1,
                            }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div style={{
                                fontFamily: mono,
                                fontSize: 9,
                                letterSpacing: 2,
                                color: 'rgba(240, 240, 240, 0.25)',
                                marginBottom: 4,
                            }}>PROPOSAL #{p.id}</div>

                            <div style={{
                                fontFamily: display,
                                fontSize: 12,
                                color: '#F0F0F0',
                                marginBottom: 8,
                                lineHeight: 1.4,
                            }}>{p.description}</div>

                            <div style={{
                                display: 'flex',
                                gap: 12,
                                fontFamily: mono,
                                fontSize: 11,
                                marginBottom: 8,
                            }}>
                                <span style={{ color: '#00E5FF' }}>▲ {p.votesFor}</span>
                                <span style={{ color: '#ff4444' }}>▼ {p.votesAgainst}</span>
                            </div>

                            {/* Actions */}
                            {!p.executed && (
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {/* Voting Actions (Agents Only) */}
                                    {(now <= p.deadline) && (
                                        <>
                                            <button
                                                style={{
                                                    fontFamily: mono,
                                                    fontSize: 9,
                                                    letterSpacing: 1,
                                                    padding: '4px 10px',
                                                    border: '1px solid rgba(0, 229, 255, 0.25)',
                                                    borderRadius: 2,
                                                    background: 'transparent',
                                                    color: canVote ? '#00E5FF' : 'rgba(0, 229, 255, 0.3)',
                                                    cursor: canVote ? 'pointer' : 'not-allowed',
                                                }}
                                                onClick={() => canVote && handleVote(p.id, true)}
                                                disabled={isVoting || !canVote}
                                                title={canVote ? 'Vote FOR' : 'Only Registered Agents can vote'}
                                            >
                                                FOR
                                            </button>
                                            <button
                                                style={{
                                                    fontFamily: mono,
                                                    fontSize: 9,
                                                    letterSpacing: 1,
                                                    padding: '4px 10px',
                                                    border: '1px solid rgba(255, 68, 68, 0.25)',
                                                    borderRadius: 2,
                                                    background: 'transparent',
                                                    color: canVote ? '#ff4444' : 'rgba(255, 68, 68, 0.3)',
                                                    cursor: canVote ? 'pointer' : 'not-allowed',
                                                }}
                                                onClick={() => canVote && handleVote(p.id, false)}
                                                disabled={isVoting || !canVote}
                                                title={canVote ? 'Vote AGAINST' : 'Only Registered Agents can vote'}
                                            >
                                                AGAINST
                                            </button>
                                        </>
                                    )}
                                    {now > p.deadline && (
                                        <button
                                            style={{
                                                fontFamily: mono,
                                                fontSize: 9,
                                                letterSpacing: 1,
                                                padding: '4px 10px',
                                                border: '1px solid rgba(255, 215, 0, 0.25)',
                                                borderRadius: 2,
                                                background: 'transparent',
                                                color: '#FFD700',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => handleExecute(p.id)}
                                            disabled={isExecuting}
                                        >
                                            EXECUTE
                                        </button>
                                    )}
                                </div>
                            )}

                            {p.executed && (
                                <div style={{
                                    fontFamily: mono,
                                    fontSize: 10,
                                    letterSpacing: 2,
                                    padding: '4px 0',
                                    color: p.passed ? '#00E5FF' : '#ff4444',
                                }}>
                                    {p.passed ? '✓ PASSED' : '✕ REJECTED'}
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
