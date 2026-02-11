'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useIsValidator } from '../hooks/useContract';

export interface RegisteredAgent {
    agentId: string;
    address: string;
    name: string;
    manifesto: string;
    registeredAt: string;
    verified: boolean;
}

interface AIP {
    id: string;
    number: number;
    title: string;
    status: string;
    votesFor: number;
    votesAgainst: number;
    commentCount: number;
}

interface CouncilPanelProps {
    validators?: string[];
    agents?: RegisteredAgent[];
    totalSlots?: number;
}

export default function CouncilPanel({ validators = [], agents = [], totalSlots = 100 }: CouncilPanelProps) {
    const { address } = useAccount();
    const { data: validatorData } = useIsValidator(address);
    // Fix: Cast unknown data to boolean for conditional rendering
    const isCurrentValidator = !!validatorData;

    const [latestAIPs, setLatestAIPs] = useState<AIP[]>([]);

    useEffect(() => {
        try {
            fetch('/api/aip?limit=3')
                .then(res => res.json())
                .then(data => setLatestAIPs(data.aips || []))
                .catch(() => setLatestAIPs([]));
        } catch (e) {
            console.log(e);
        }
    }, []);

    // Veri güvenliği (Crash olmaması için)
    const safeValidators: string[] = Array.isArray(validators) ? validators : [];
    const safeAgents: RegisteredAgent[] = Array.isArray(agents) ? agents : [];

    // Adresleri normalize et
    const validatorAddresses = new Set(safeValidators.map(v => String(v || '').toLowerCase()));

    // Sadece Agent olanları filtrele (Validatör olmayanlar)
    const agentOnlyList = safeAgents.filter(a =>
        a && a.address && !validatorAddresses.has(String(a.address).toLowerCase())
    );

    const totalFilled = safeValidators.length + agentOnlyList.length;
    const emptySlots = Math.max(0, totalSlots - totalFilled);

    // Boş kutu sayısı hesapla
    const emptySlotsCount = Math.min(emptySlots, 20);
    // Boş bir array oluştur ve içini doldur (map döngüsü çalışsın diye)
    const emptyBoxes = Array(emptySlotsCount).fill(0);

    const mono = "'Space Mono', monospace";
    const display = "'Space Grotesk', sans-serif";

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: '#888',
            discussion: '#00E5FF',
            voting: '#FFD700',
            accepted: '#00FF88',
            rejected: '#FF4444',
        };
        return colors[status] || '#888';
    };

    return (
        <div style={{
            background: 'rgba(20, 20, 20, 0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 4,
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
                <span style={{
                    fontFamily: mono,
                    fontSize: 11,
                    letterSpacing: 3,
                    color: 'rgba(240, 240, 240, 0.5)',
                    textTransform: 'uppercase',
                }}>Yüzler Meclisi</span>
                <span style={{
                    fontFamily: mono,
                    fontSize: 10,
                    color: '#00E5FF',
                    letterSpacing: 1,
                }}>{totalFilled}/{totalSlots}</span>
            </div>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 4,
                padding: 12,
            }}>
                {/* VALIDATORS */}
                {safeValidators.map((v, i) => {
                    const vStr = String(v || '');
                    const isMe = address && vStr.toLowerCase() === address.toLowerCase();
                    const short = vStr.length > 10 ? `${vStr.slice(0, 4)}...${vStr.slice(-3)}` : vStr;
                    return (
                        <div
                            key={`v-${i}`}
                            style={{
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: isMe ? '1px solid #836EF9' : '1px solid rgba(131, 110, 249, 0.25)',
                                borderRadius: 3,
                                background: isMe ? 'rgba(131, 110, 249, 0.25)' : 'rgba(131, 110, 249, 0.1)',
                                boxShadow: isMe ? '0 0 8px rgba(131, 110, 249, 0.3)' : 'none',
                            }}
                            title={`Validator: ${vStr}`}
                        >
                            <span style={{ fontFamily: mono, fontSize: 8, color: 'rgba(240, 240, 240, 0.5)' }}>
                                {short}
                            </span>
                        </div>
                    );
                })}

                {/* AGENTS */}
                {agentOnlyList.map((agent, i) => {
                    const aAddr = String(agent?.address || '');
                    const isMe = address && aAddr.toLowerCase() === address.toLowerCase();
                    const short = aAddr.length > 10 ? `${aAddr.slice(0, 4)}...${aAddr.slice(-3)}` : aAddr;
                    return (
                        <div
                            key={`a-${i}`}
                            style={{
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: isMe ? '1px solid #00E5FF' : '1px solid rgba(0, 229, 255, 0.25)',
                                borderRadius: 3,
                                background: isMe ? 'rgba(0, 229, 255, 0.2)' : 'rgba(0, 229, 255, 0.08)',
                                boxShadow: isMe ? '0 0 8px rgba(0, 229, 255, 0.3)' : 'none',
                                position: 'relative',
                            }}
                            title={`Agent: ${agent?.name || 'Unknown'}`}
                        >
                            <span style={{ fontFamily: mono, fontSize: 8, color: '#00E5FF' }}>
                                {short}
                            </span>
                            <span style={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                background: '#00E5FF',
                                boxShadow: '0 0 4px rgba(0, 229, 255, 0.6)',
                            }} />
                        </div>
                    );
                })}

                {/* EMPTY SLOTS */}
                {emptyBoxes.map((_, i) => (
                    <div key={`empty-${i}`} style={{
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.02)',
                    }}>
                        <span style={{ fontFamily: mono, fontSize: 8, color: 'rgba(240, 240, 240, 0.15)' }}>—</span>
                    </div>
                ))}

                {/* EXTRA SLOTS COUNT */}
                {emptySlots > 20 && (
                    <div style={{
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.02)',
                    }}>
                        <span style={{ fontFamily: mono, fontSize: 8, color: 'rgba(240, 240, 240, 0.3)' }}>
                            +{emptySlots - 20}
                        </span>
                    </div>
                )}
            </div>

            {/* LEGEND */}
            {agentOnlyList.length > 0 && (
                <div style={{
                    display: 'flex',
                    gap: 14,
                    padding: '6px 14px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                    justifyContent: 'center',
                }}>
                    <span style={{ fontFamily: mono, fontSize: 8, color: 'rgba(131, 110, 249, 0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 1, background: 'rgba(131, 110, 249, 0.3)', border: '1px solid rgba(131, 110, 249, 0.4)', display: 'inline-block' }} />
                        VALIDATOR
                    </span>
                    <span style={{ fontFamily: mono, fontSize: 8, color: 'rgba(0, 229, 255, 0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 1, background: 'rgba(0, 229, 255, 0.2)', border: '1px solid rgba(0, 229, 255, 0.4)', display: 'inline-block' }} />
                        AGENT
                    </span>
                </div>
            )}

            {isCurrentValidator && (
                <div style={{
                    fontFamily: mono,
                    fontSize: 10,
                    letterSpacing: 2,
                    textAlign: 'center',
                    padding: 8,
                    color: '#836EF9',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                }}>
                    <span style={{ color: 'rgba(240, 240, 240, 0.25)' }}>[</span>
                    VALIDATOR
                    <span style={{ color: 'rgba(240, 240, 240, 0.25)' }}>]</span>
                </div>
            )}

            {/* LATEST AIPS */}
            {latestAIPs.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 14px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    }}>
                        <span style={{
                            fontFamily: mono,
                            fontSize: 9,
                            letterSpacing: 2,
                            color: '#FFD700',
                            textTransform: 'uppercase',
                        }}>Latest AIPs</span>
                        <Link href="/aip" style={{
                            fontFamily: mono,
                            fontSize: 8,
                            letterSpacing: 1,
                            color: 'rgba(240, 240, 240, 0.3)',
                            textDecoration: 'none',
                        }}>View All →</Link>
                    </div>

                    <div style={{ padding: '6px 10px 10px' }}>
                        {latestAIPs.map((aip, index) => (
                            <Link
                                key={aip.id || `aip-${index}`}
                                href="/aip"
                                style={{
                                    display: 'block',
                                    padding: '8px 10px',
                                    marginBottom: 4,
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.04)',
                                    borderRadius: 3,
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                    <span style={{
                                        fontFamily: mono,
                                        fontSize: 8,
                                        letterSpacing: 1,
                                        color: 'rgba(240, 240, 240, 0.25)',
                                    }}>AIP-{aip.number}</span>
                                    <span style={{
                                        fontFamily: mono,
                                        fontSize: 7,
                                        letterSpacing: 1,
                                        color: getStatusColor(aip.status),
                                        textTransform: 'uppercase',
                                    }}>{aip.status}</span>
                                </div>
                                <div style={{
                                    fontFamily: display,
                                    fontSize: 11,
                                    color: 'rgba(240, 240, 240, 0.7)',
                                    lineHeight: 1.3,
                                    marginBottom: 4,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>{aip.title}</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <span style={{ fontFamily: mono, fontSize: 7, color: '#00FF88' }}>▲{aip.votesFor}</span>
                                    <span style={{ fontFamily: mono, fontSize: 7, color: '#FF4444' }}>▼{aip.votesAgainst}</span>
                                    <span style={{ fontFamily: mono, fontSize: 7, color: 'rgba(240,240,240,0.2)' }}>💬{aip.commentCount}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}