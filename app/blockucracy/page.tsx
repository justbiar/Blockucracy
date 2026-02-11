'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';

const mono = "'Space Mono', monospace";
const display = "'Space Grotesk', sans-serif";

/* ══════════════════════════════════════════════════════════ */
/*  CONSTITUTION DATA                                        */
/* ══════════════════════════════════════════════════════════ */

interface Article {
    id: string;
    madde: string;
    title: string;
    subtitle: string;
    icon: string;
    lines: string[];
    accent: string;
}

// ARTICLES dynamic generated inside component

/* ══════════════════════════════════════════════════════════ */
/*  TYPEWRITER COMPONENT                                     */
/* ══════════════════════════════════════════════════════════ */

function TypewriterLine({ text, delay, onComplete }: { text: string; delay: number; onComplete?: () => void }) {
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
                    onComplete?.();
                }
            }, 18);
            return () => clearInterval(interval);
        }, delay);
        return () => clearTimeout(timer);
    }, [text, delay, onComplete]);

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
                    background: '#836EF9',
                    marginLeft: 2,
                    animation: 'blink 0.8s infinite',
                    verticalAlign: 'text-bottom',
                }} />
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════ */
/*  ARTICLE CARD COMPONENT                                   */
/* ══════════════════════════════════════════════════════════ */

function ArticleCard({ article, index }: { article: Article; index: number }) {
    const [expanded, setExpanded] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [visibleLines, setVisibleLines] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleClick = () => {
        if (!expanded) {
            setExpanded(true);
            setRevealed(true);
            // Start revealing lines one by one
            let lineIdx = 0;
            const interval = setInterval(() => {
                lineIdx++;
                setVisibleLines(lineIdx);
                if (lineIdx >= article.lines.length) {
                    clearInterval(interval);
                }
            }, 600);
        } else {
            setExpanded(false);
            setVisibleLines(0);
            setRevealed(false);
        }
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            style={{
                marginBottom: 16,
                cursor: 'pointer',
                position: 'relative',
            }}
            onClick={handleClick}
        >
            {/* The Card */}
            <div style={{
                background: expanded
                    ? 'rgba(20, 20, 20, 0.95)'
                    : 'rgba(20, 20, 20, 0.6)',
                border: `1px solid ${expanded ? article.accent + '40' : 'rgba(255, 255, 255, 0.06)'}`,
                borderRadius: 6,
                padding: expanded ? '20px 24px' : '16px 24px',
                transition: 'all 0.4s ease',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
            }}>
                {/* Header Row */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                }}>
                    {/* Icon */}
                    <div style={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${article.accent}40`,
                        borderRadius: 8,
                        fontSize: 20,
                        color: article.accent,
                        background: `${article.accent}10`,
                        flexShrink: 0,
                        transition: 'all 0.3s',
                        boxShadow: expanded ? `0 0 20px ${article.accent}20` : 'none',
                    }}>
                        {article.icon}
                    </div>

                    {/* Title Block */}
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontFamily: mono,
                            fontSize: 10,
                            letterSpacing: 3,
                            color: article.accent,
                            marginBottom: 4,
                        }}>
                            {article.madde}
                        </div>
                        <div style={{
                            fontFamily: display,
                            fontSize: 18,
                            fontWeight: 600,
                            color: '#F0F0F0',
                            letterSpacing: 1,
                        }}>
                            {article.title}
                        </div>
                        <div style={{
                            fontFamily: mono,
                            fontSize: 10,
                            color: 'rgba(240, 240, 240, 0.3)',
                            letterSpacing: 1,
                            marginTop: 2,
                        }}>
                            {article.subtitle}
                        </div>
                    </div>

                    {/* Expand Indicator */}
                    <div style={{
                        fontFamily: mono,
                        fontSize: 16,
                        color: article.accent,
                        transition: 'transform 0.3s',
                        transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}>
                        +
                    </div>
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
                            {/* Divider */}
                            <div style={{
                                height: 1,
                                background: `linear-gradient(90deg, transparent, ${article.accent}40, transparent)`,
                                margin: '16px 0',
                            }} />

                            {/* Lines revealed one by one */}
                            <div style={{ paddingLeft: 64 }}>
                                {article.lines.map((line, i) => (
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
                                                display: 'flex',
                                                gap: 12,
                                                marginBottom: 10,
                                                alignItems: 'flex-start',
                                            }}>
                                                <span style={{
                                                    fontFamily: mono,
                                                    fontSize: 10,
                                                    color: article.accent,
                                                    marginTop: 3,
                                                    flexShrink: 0,
                                                }}>{'>'}</span>
                                                <TypewriterLine
                                                    text={line}
                                                    delay={0}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}

                                {visibleLines < article.lines.length && visibleLines > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{
                                            fontFamily: mono,
                                            fontSize: 10,
                                            color: article.accent,
                                            letterSpacing: 2,
                                            marginTop: 8,
                                        }}
                                    >
                                        ◌ DECODING...
                                    </motion.div>
                                )}

                                {visibleLines >= article.lines.length && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                        style={{
                                            fontFamily: mono,
                                            fontSize: 10,
                                            letterSpacing: 2,
                                            color: article.accent,
                                            marginTop: 12,
                                            paddingTop: 8,
                                            borderTop: `1px solid ${article.accent}20`,
                                        }}
                                    >
                                        ✓ ARTICLE INSCRIBED ON-CHAIN
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

export default function BlockucracyPage() {
    const { t, language, setLanguage } = useLanguage();
    const [headerRevealed, setHeaderRevealed] = useState(false);

    const ARTICLES: Article[] = t.blockucracy.articles.map((a: any, i: number) => ({
        id: `madde-${i + 1}`,
        madde: `MADDE ${i + 1}`,
        title: a.title,
        subtitle: a.subtitle,
        icon: ['⬡', '◆', '▲', '◈', '◎'][i],
        accent: ['#836EF9', '#FFD700', '#00E5FF', '#FF6B6B', '#C084FC'][i],
        lines: a.lines
    }));

    useEffect(() => {
        setTimeout(() => setHeaderRevealed(true), 300);
    }, []);

    // Override body overflow:hidden from globals.css so this page can scroll
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
            {/* Background Grid Pattern */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `
                    linear-gradient(rgba(131, 110, 249, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(131, 110, 249, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
                pointerEvents: 'none',
                zIndex: 0,
            }} />

            {/* Nav Bar */}
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
                        color: '#836EF9',
                        marginBottom: 16,
                        textShadow: '0 0 40px rgba(131, 110, 249, 0.4)',
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
                        background: 'linear-gradient(135deg, #F0F0F0, #836EF9)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        {t.blockucracy.title}
                    </h1>

                    <div style={{
                        fontFamily: mono,
                        fontSize: 11,
                        letterSpacing: 4,
                        color: 'rgba(240, 240, 240, 0.3)',
                        marginBottom: 8,
                    }}>
                        {t.blockucracy.subtitle}
                    </div>

                    <div style={{
                        fontFamily: display,
                        fontSize: 14,
                        color: 'rgba(240, 240, 240, 0.4)',
                        fontStyle: 'italic',
                    }}>
                        {t.blockucracy.quote}
                    </div>

                    {/* Separator */}
                    <div style={{
                        width: 120,
                        height: 1,
                        background: 'linear-gradient(90deg, transparent, #836EF9, transparent)',
                        margin: '32px auto 0',
                    }} />
                </motion.div>

                {/* Instruction */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    style={{
                        textAlign: 'center',
                        marginBottom: 40,
                    }}
                >
                    <div style={{
                        fontFamily: mono,
                        fontSize: 10,
                        letterSpacing: 3,
                        color: 'rgba(240, 240, 240, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                    }}>
                        <span style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.08)', display: 'inline-block' }} />
                        {t.blockucracy.instruction}
                        <span style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.08)', display: 'inline-block' }} />
                    </div>
                </motion.div>

                {/* ARTICLES */}
                {ARTICLES.map((article, i) => (
                    <ArticleCard key={article.id} article={article} index={i} />
                ))}

                {/* FOOTER INSCRIPTION */}
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
                    <div style={{
                        fontFamily: mono,
                        fontSize: 10,
                        letterSpacing: 3,
                        color: 'rgba(240, 240, 240, 0.15)',
                        marginBottom: 8,
                    }}>
                        {t.blockucracy.footer.inscribed}
                    </div>
                    <div style={{
                        fontFamily: mono,
                        fontSize: 9,
                        letterSpacing: 2,
                        color: 'rgba(240, 240, 240, 0.1)',
                    }}>
                        {t.blockucracy.footer.chain_info}
                    </div>
                    <div style={{
                        fontFamily: display,
                        fontSize: 12,
                        color: 'rgba(131, 110, 249, 0.3)',
                        marginTop: 16,
                        fontStyle: 'italic',
                    }}>
                        {t.blockucracy.footer.quote}
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
