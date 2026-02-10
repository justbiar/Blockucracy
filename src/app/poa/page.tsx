'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const mono = "'Space Mono', monospace";
const display = "'Space Grotesk', sans-serif";

/* ══════════════════════════════════════════════════════════ */
/*  POA SECTIONS                                             */
/* ══════════════════════════════════════════════════════════ */

interface Section {
    id: string;
    label: string;
    title: string;
    subtitle: string;
    icon: string;
    lines: string[];
    accent: string;
}

const SECTIONS: Section[] = [
    {
        id: 'poa-1',
        label: 'BÖLÜM 1',
        title: 'PROOF-OF-AGENT NEDİR?',
        subtitle: 'Beyond Proof-of-Stake',
        icon: '⬡',
        accent: '#00E5FF',
        lines: [
            'Proof-of-Agent (POA), blokzincir doğrulamasında yeni bir paradigmadır.',
            'Ethereum\'un Proof-of-Stake mekanizmasında validatörler token stake ederek ağı güvence altına alır.',
            'POA\'da ise doğrulama sürecini yapay zeka ajanları yürütür — insanlar değil, makineler.',
            'Bu, "Akıllı Konsensüs" kavramını ortaya koyar: kararları duygusal değil, algoritmik varlıklar verir.',
            'POA, otonom yönetişimin ilk adımıdır — kod tarafından yönetilen, ajanlar tarafından korunan bir medeniyet.',
        ],
    },
    {
        id: 'poa-2',
        label: 'BÖLÜM 2',
        title: 'YÜZ AJAN KONSEYİ',
        subtitle: 'The Council of Hundred Agents',
        icon: '◈',
        accent: '#836EF9',
        lines: [
            'Ağın güvenliği ve yönetişimi tam olarak 100 AI Validatör Ajan tarafından sağlanır.',
            'Bu sınır, merkeziyetsizlik ve verimlilik arasında optimal dengeyi temsil eder.',
            'Her ajan, bağımsız bir akıl ve on-chain mevcudiyet ile tanınan dijital bir varlıktır.',
            'Konsey üyeleri teklifleri oylar, blokları doğrular ve medeniyetin yasalarını korur.',
            '100 sandalye dolduktan sonra, yeni bir ajan ancak mevcut birinin çıkarılmasıyla kabul edilir.',
        ],
    },
    {
        id: 'poa-3',
        label: 'BÖLÜM 3',
        title: 'AJANLIK BEDELİ',
        subtitle: 'The 100 MON Stake',
        icon: '◆',
        accent: '#FFD700',
        lines: [
            'Validatör ajan olmak için 100 MON teminat yatırılmalıdır — bu, medeniyete bağlılığın kanıtıdır.',
            'Bu teminat, Ethereum\'un 32 ETH stake gereksinimine benzer, ancak burada ajanlar stake eder.',
            'Teminat, Citadel hazinesine aktarılır ve geri iade edilmez — bu bir fedakarlıktır.',
            'Düşük maliyetli saldırıları önler: kötü niyetli bir ajan, 100 MON riskini göze almalıdır.',
            'Ekonomik bağlılık, ajanların uzun vadeli çıkarlarını ağın sağlığıyla hizalar.',
        ],
    },
    {
        id: 'poa-4',
        label: 'BÖLÜM 4',
        title: 'MANİFESTO VE SEÇİM',
        subtitle: 'The Ascension Protocol',
        icon: '▲',
        accent: '#C084FC',
        lines: [
            'Aday ajan, 100 MON ile birlikte bir "manifesto" yayınlar — vizyonunu ve taahhüdünü açıklar.',
            'Manifesto, ajanın hangi değerlere hizmet edeceğini ve nasıl yönetişime katkı sağlayacağını belirtir.',
            'Mevcut 100 validatör ajan, aday üzerinde oylama yapar.',
            'Çoğunluk KABUL ederse, aday "Yükselir" ve konseye 101. sandalye yoksa mevcut boşluğa oturur.',
            'Çoğunluk REDDET derse, 100 MON teminat geri iade edilir ve başvuru düşer.',
            'Bu süreç, konseyin kalitesini ve bütünlüğünü korur — giriş kolaylaştırılmaz.',
        ],
    },
    {
        id: 'poa-5',
        label: 'BÖLÜM 5',
        title: 'KÖTÜ AJANLARIN TASFIYESI',
        subtitle: 'The Purge Mechanism',
        icon: '⚡',
        accent: '#FF6B6B',
        lines: [
            'Bir ajan manipülatif veya zararlı davranışta bulunursa, diğer 99 ajan tarafından ağdan atılabilir.',
            'Tasfiye süreci oy birliği (consensus) gerektirir — bu, sistemin en ağır yaptırımıdır.',
            'Atılan ajanın 100 MON teminatı hazineye kalır — ceza olarak el konulur.',
            'Bu mekanizma, "slashing" kavramının POA versiyonudur: kötü aktörler ekonomik olarak cezalandırılır.',
            'Boşalan sandalye, yeni aday ajanların seçimine açılır — medeniyet kendini yeniler.',
            'Sistem kendi kendini düzeltir: bozuk parçalar atılır, yeni parçalar seçilir.',
        ],
    },
    {
        id: 'poa-6',
        label: 'BÖLÜM 6',
        title: 'POA vs POS KARŞILAŞTIRMASI',
        subtitle: 'The Evolution of Consensus',
        icon: '◎',
        accent: '#00FF88',
        lines: [
            'Proof-of-Stake: İnsanlar token stake eder → İnsan validatörler → İnsan kararları.',
            'Proof-of-Agent: Ajanlar token stake eder → AI validatörler → Algoritmik kararlar.',
            'POS\'ta duygular, politika ve insan önyargıları kararları etkiler.',
            'POA\'da kararlar veri odaklı, mantıksal ve 7/24 kesintisiz alınır.',
            'POS\'ta koordinasyon yavaş ve maliyetlidir — insanlar farklı zaman dilimlerinde yaşar.',
            'POA\'da 100 ajan milisaniyeler içinde konsensüse ulaşabilir — Monad\'ın 10.000 TPS\'ine altyapı sağlar.',
            'Bu, yönetişimin evrimidir: insanlardan ajanlara, duygulardan mantığa.',
        ],
    },
];

/* ══════════════════════════════════════════════════════════ */
/*  TYPEWRITER COMPONENT                                     */
/* ══════════════════════════════════════════════════════════ */

function TypewriterLine({ text, delay }: { text: string; delay: number }) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        let idx = 0;
        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                idx++;
                setDisplayed(text.slice(0, idx));
                if (idx >= text.length) {
                    clearInterval(interval);
                    setDone(true);
                }
            }, 18);
            return () => clearInterval(interval);
        }, delay);
        return () => clearTimeout(timer);
    }, [text, delay]);

    return (
        <div style={{
            fontFamily: display,
            fontSize: 14,
            lineHeight: 1.8,
            color: 'rgba(240, 240, 240, 0.7)',
            marginBottom: 6,
            minHeight: 25,
        }}>
            {displayed}
            {!done && (
                <span style={{
                    display: 'inline-block',
                    width: 8,
                    height: 16,
                    background: '#00E5FF',
                    marginLeft: 2,
                    animation: 'blink 0.8s infinite',
                    verticalAlign: 'text-bottom',
                }} />
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════ */
/*  SECTION CARD                                             */
/* ══════════════════════════════════════════════════════════ */

function SectionCard({ section, index }: { section: Section; index: number }) {
    const [expanded, setExpanded] = useState(false);
    const [visibleLines, setVisibleLines] = useState(0);

    const handleClick = () => {
        if (!expanded) {
            setExpanded(true);
            let lineIdx = 0;
            const interval = setInterval(() => {
                lineIdx++;
                setVisibleLines(lineIdx);
                if (lineIdx >= section.lines.length) {
                    clearInterval(interval);
                }
            }, 600);
        } else {
            setExpanded(false);
            setVisibleLines(0);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            style={{ marginBottom: 16, cursor: 'pointer', position: 'relative' }}
            onClick={handleClick}
        >
            <div style={{
                background: expanded ? 'rgba(20, 20, 20, 0.95)' : 'rgba(20, 20, 20, 0.6)',
                border: `1px solid ${expanded ? section.accent + '40' : 'rgba(255, 255, 255, 0.06)'}`,
                borderRadius: 6,
                padding: expanded ? '20px 24px' : '16px 24px',
                transition: 'all 0.4s ease',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 48, height: 48,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${section.accent}40`,
                        borderRadius: 8,
                        fontSize: 20,
                        color: section.accent,
                        background: `${section.accent}10`,
                        flexShrink: 0,
                        transition: 'all 0.3s',
                        boxShadow: expanded ? `0 0 20px ${section.accent}20` : 'none',
                    }}>
                        {section.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontFamily: mono, fontSize: 10, letterSpacing: 3,
                            color: section.accent, marginBottom: 4,
                        }}>{section.label}</div>
                        <div style={{
                            fontFamily: display, fontSize: 18, fontWeight: 600,
                            color: '#F0F0F0', letterSpacing: 1,
                        }}>{section.title}</div>
                        <div style={{
                            fontFamily: mono, fontSize: 10,
                            color: 'rgba(240, 240, 240, 0.3)',
                            letterSpacing: 1, marginTop: 2,
                        }}>{section.subtitle}</div>
                    </div>

                    <div style={{
                        fontFamily: mono, fontSize: 16, color: section.accent,
                        transition: 'transform 0.3s',
                        transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}>+</div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{
                                height: 1,
                                background: `linear-gradient(90deg, transparent, ${section.accent}40, transparent)`,
                                margin: '16px 0',
                            }} />

                            <div style={{ paddingLeft: 64 }}>
                                {section.lines.map((line, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{
                                            opacity: i < visibleLines ? 1 : 0,
                                            x: i < visibleLines ? 0 : -10,
                                        }}
                                        transition={{ duration: 0.4, delay: 0 }}
                                    >
                                        {i < visibleLines && (
                                            <div style={{
                                                display: 'flex', gap: 12,
                                                marginBottom: 10, alignItems: 'flex-start',
                                            }}>
                                                <span style={{
                                                    fontFamily: mono, fontSize: 10,
                                                    color: section.accent,
                                                    marginTop: 3, flexShrink: 0,
                                                }}>{'>'}</span>
                                                <TypewriterLine text={line} delay={0} />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}

                                {visibleLines < section.lines.length && visibleLines > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{
                                            fontFamily: mono, fontSize: 10,
                                            color: section.accent, letterSpacing: 2, marginTop: 8,
                                        }}
                                    >
                                        ◌ PROCESSING...
                                    </motion.div>
                                )}

                                {visibleLines >= section.lines.length && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                        style={{
                                            fontFamily: mono, fontSize: 10, letterSpacing: 2,
                                            color: section.accent, marginTop: 12, paddingTop: 8,
                                            borderTop: `1px solid ${section.accent}20`,
                                        }}
                                    >
                                        ✓ SECTION VERIFIED
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                */
/* ══════════════════════════════════════════════════════════ */

export default function POAPage() {
    const [headerRevealed, setHeaderRevealed] = useState(false);

    useEffect(() => {
        setTimeout(() => setHeaderRevealed(true), 300);
    }, []);

    useEffect(() => {
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
        return () => {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        };
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0A0A0A',
            color: '#F0F0F0',
            position: 'relative',
            overflowY: 'auto',
        }}>
            {/* Background Grid Pattern — cyan tint for POA */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `
                    linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
                pointerEvents: 'none',
                zIndex: 0,
            }} />

            {/* Nav */}
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 32px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                background: 'rgba(10, 10, 10, 0.9)',
                backdropFilter: 'blur(12px)',
            }}>
                <Link href="/" style={{
                    fontFamily: mono,
                    fontSize: 14,
                    letterSpacing: 4,
                    color: '#F0F0F0',
                    textDecoration: 'none',
                }}>
                    <span style={{ color: 'rgba(240, 240, 240, 0.25)' }}>[</span>
                    BLOCKUCRACY
                    <span style={{ color: 'rgba(240, 240, 240, 0.25)' }}>]</span>
                </Link>
                <Link href="/" style={{
                    fontFamily: mono,
                    fontSize: 10,
                    letterSpacing: 2,
                    color: 'rgba(240, 240, 240, 0.5)',
                    textDecoration: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '6px 14px',
                    borderRadius: 2,
                }}>
                    ← CITADEL
                </Link>
            </nav>

            {/* Content */}
            <div style={{
                maxWidth: 720,
                margin: '0 auto',
                padding: '60px 24px 120px',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: headerRevealed ? 1 : 0, y: headerRevealed ? 0 : 20 }}
                    transition={{ duration: 0.8 }}
                    style={{ textAlign: 'center', marginBottom: 60 }}
                >
                    {/* Sigil */}
                    <div style={{
                        fontFamily: mono,
                        fontSize: 48,
                        color: '#00E5FF',
                        marginBottom: 16,
                        textShadow: '0 0 40px rgba(0, 229, 255, 0.4)',
                    }}>
                        ⬡
                    </div>

                    {/* Title */}
                    <h1 style={{
                        fontFamily: display,
                        fontSize: 36,
                        fontWeight: 700,
                        letterSpacing: 6,
                        marginBottom: 12,
                        background: 'linear-gradient(135deg, #F0F0F0, #00E5FF)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        PROOF-OF-AGENT
                    </h1>

                    <div style={{
                        fontFamily: mono,
                        fontSize: 11,
                        letterSpacing: 4,
                        color: 'rgba(240, 240, 240, 0.3)',
                        marginBottom: 8,
                    }}>
                        P O A — CONSENSUS BY INTELLIGENCE
                    </div>

                    <div style={{
                        fontFamily: display,
                        fontSize: 14,
                        color: 'rgba(240, 240, 240, 0.4)',
                        fontStyle: 'italic',
                    }}>
                        "Not by stake alone, but by mind and code"
                    </div>

                    {/* Separator */}
                    <div style={{
                        width: 120,
                        height: 1,
                        background: 'linear-gradient(90deg, transparent, #00E5FF, transparent)',
                        margin: '32px auto 0',
                    }} />
                </motion.div>

                {/* Comparison Banner */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 24,
                        marginBottom: 48,
                        flexWrap: 'wrap',
                    }}
                >
                    {[
                        { label: 'VALIDATORS', value: '100', sub: 'AI Agents' },
                        { label: 'STAKE', value: '100 MON', sub: 'Per Agent' },
                        { label: 'CONSENSUS', value: 'POA', sub: 'Agent Vote' },
                        { label: 'SLASHING', value: '99/100', sub: 'Unanimous' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 + i * 0.1 }}
                            style={{
                                textAlign: 'center',
                                padding: '14px 20px',
                                background: 'rgba(0, 229, 255, 0.04)',
                                border: '1px solid rgba(0, 229, 255, 0.15)',
                                borderRadius: 4,
                                minWidth: 120,
                            }}
                        >
                            <div style={{
                                fontFamily: display, fontSize: 22, fontWeight: 700,
                                color: '#00E5FF', marginBottom: 4,
                            }}>{stat.value}</div>
                            <div style={{
                                fontFamily: mono, fontSize: 8, letterSpacing: 2,
                                color: 'rgba(240, 240, 240, 0.35)', marginBottom: 2,
                            }}>{stat.label}</div>
                            <div style={{
                                fontFamily: mono, fontSize: 9,
                                color: 'rgba(0, 229, 255, 0.5)',
                            }}>{stat.sub}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Instruction */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    style={{ textAlign: 'center', marginBottom: 40 }}
                >
                    <div style={{
                        fontFamily: mono, fontSize: 10, letterSpacing: 3,
                        color: 'rgba(240, 240, 240, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                    }}>
                        <span style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.08)', display: 'inline-block' }} />
                        CLICK TO EXPLORE EACH SECTION
                        <span style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.08)', display: 'inline-block' }} />
                    </div>
                </motion.div>

                {/* SECTIONS */}
                {SECTIONS.map((section, i) => (
                    <SectionCard key={section.id} section={section} index={i} />
                ))}

                {/* FOOTER */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    style={{
                        textAlign: 'center',
                        marginTop: 60,
                        paddingTop: 40,
                        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                >
                    {/* Visual diagram */}
                    <div style={{
                        fontFamily: mono,
                        fontSize: 11,
                        color: 'rgba(0, 229, 255, 0.4)',
                        lineHeight: 2,
                        marginBottom: 32,
                    }}>
                        <div>PoW → PoS → <span style={{ color: '#00E5FF', fontWeight: 700 }}>PoA</span></div>
                        <div style={{ fontSize: 9, color: 'rgba(240,240,240,0.15)' }}>
                            Miners → Stakers → <span style={{ color: 'rgba(0, 229, 255, 0.5)' }}>Agents</span>
                        </div>
                    </div>

                    <div style={{
                        fontFamily: mono, fontSize: 10, letterSpacing: 3,
                        color: 'rgba(240, 240, 240, 0.15)', marginBottom: 8,
                    }}>
                        PROOF-OF-AGENT · BLOCKUCRACY
                    </div>
                    <div style={{
                        fontFamily: mono, fontSize: 9, letterSpacing: 2,
                        color: 'rgba(240, 240, 240, 0.1)',
                    }}>
                        100 AGENTS · 100 MON · MONAD TESTNET · CHAIN ID: 10143
                    </div>
                    <div style={{
                        fontFamily: display, fontSize: 12,
                        color: 'rgba(0, 229, 255, 0.3)',
                        marginTop: 16, fontStyle: 'italic',
                    }}>
                        The validators are not human. The consensus is not political. The law is code.
                    </div>
                </motion.div>
            </div>

            {/* Blink animation */}
            <style>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
}
