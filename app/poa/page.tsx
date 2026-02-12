'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';

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

// SECTIONS dynamic generated inside component

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
    const { t, language, setLanguage } = useLanguage();
    const [headerRevealed, setHeaderRevealed] = useState(false);

    const SECTIONS: Section[] = t.poa.sections.map((s: any, i: number) => ({
        id: `poa-${i + 1}`,
        label: s.label,
        title: s.title,
        subtitle: s.subtitle,
        icon: ['⬡', '◈', '◆', '▲', '⚡', '◎'][i],
        accent: ['#00E5FF', '#836EF9', '#FFD700', '#C084FC', '#FF6B6B', '#00FF88'][i],
        lines: s.lines
    }));

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
                <Link href="/adao" style={{
                    fontFamily: mono,
                    fontSize: 10,
                    letterSpacing: 2,
                    color: 'rgba(240, 240, 240, 0.5)',
                    textDecoration: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '6px 14px',
                    borderRadius: 2,
                    marginLeft: 12,
                }}>
                    MOLTIVERSE
                </Link>
                <button
                    onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
                    style={{
                        fontFamily: mono, fontSize: 10, letterSpacing: 2,
                        color: 'rgba(240,240,240,0.5)', background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.08)', padding: '6px 14px',
                        borderRadius: 2, cursor: 'pointer', marginLeft: 12
                    }}
                >
                    [{language.toUpperCase()}]
                </button>
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
                        {t.poa.title}
                    </h1>

                    <div style={{
                        fontFamily: mono,
                        fontSize: 11,
                        letterSpacing: 4,
                        color: 'rgba(240, 240, 240, 0.3)',
                        marginBottom: 8,
                    }}>
                        {t.poa.subtitle}
                    </div>

                    <div style={{
                        fontFamily: display,
                        fontSize: 14,
                        color: 'rgba(240, 240, 240, 0.4)',
                        fontStyle: 'italic',
                    }}>
                        {t.poa.quote}
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
                        { label: t.poa.stats.validators, value: '100', sub: t.poa.stats.sub_validators },
                        { label: t.poa.stats.stake, value: '100 MON', sub: t.poa.stats.sub_stake },
                        { label: t.poa.stats.consensus, value: 'POA', sub: t.poa.stats.sub_consensus },
                        { label: t.poa.stats.slashing, value: '99/100', sub: t.poa.stats.sub_slashing },
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
                        {t.poa.exploration}
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
                            {t.poa.footer.diagram}
                        </div>
                    </div>

                    <div style={{
                        fontFamily: mono, fontSize: 10, letterSpacing: 3,
                        color: 'rgba(240, 240, 240, 0.15)', marginBottom: 8,
                    }}>
                        {t.poa.footer.title}
                    </div>
                    <div style={{
                        fontFamily: mono, fontSize: 9, letterSpacing: 2,
                        color: 'rgba(240, 240, 240, 0.1)',
                    }}>
                        {t.poa.footer.info}
                    </div>
                    <div style={{
                        fontFamily: display, fontSize: 12,
                        color: 'rgba(0, 229, 255, 0.3)',
                        marginTop: 16, fontStyle: 'italic',
                    }}>
                        {t.poa.footer.quote}
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
