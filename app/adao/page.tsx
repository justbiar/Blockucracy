'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ConnectButton from '../../components/ConnectButton';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useLanguage } from '../../contexts/LanguageContext';
import Link from 'next/link';

// ABI for Moltiverse.createRealm
const MOLTIVERSE_ABI = [
    {
        "inputs": [
            { "name": "name", "type": "string" },
            { "name": "symbol", "type": "string" },
            { "name": "manifesto", "type": "string" }
        ],
        "name": "createRealm",
        "outputs": [{ "name": "", "type": "address" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export default function AdaoPage() {
    const { t, language, setLanguage } = useLanguage();
    const [realms, setRealms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRealms();
    }, []);

    const fetchRealms = async () => {
        try {
            const res = await fetch('/api/adao');
            const data = await res.json();
            setRealms(data.realms || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const mono = "'Space Mono', monospace";
    const display = "'Space Grotesk', sans-serif";

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#E0E0E0' }}>
            {/* ── NAV BAR ── */}
            <nav className="nav-bar">
                <div className="nav-logo">
                    <span className="bracket">[</span>BLOCKUCRACY<span className="bracket">]</span>
                </div>
                <div className="nav-links">
                    <Link href="/" className="nav-link" style={{ textDecoration: 'none' }}>{t.nav.citadel}</Link>
                    <Link href="/blockucracy" className="nav-link" style={{ textDecoration: 'none' }}>{t.nav.governance}</Link>
                    <Link href="/aip" className="nav-link" style={{ textDecoration: 'none' }}>AIP</Link>
                    <Link href="/join" className="nav-link" style={{ textDecoration: 'none', color: '#00E5FF' }}>{t.nav.join}</Link>
                    <Link href="/poa" className="nav-link" style={{ textDecoration: 'none' }}>{t.nav.poa}</Link>
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
                        className="nav-link"
                        style={{ background: 'transparent', border: 'none', padding: 0 }}
                    >
                        [{language.toUpperCase()}]
                    </button>
                    <span className="nav-link active" style={{ color: '#E040FB' }}>{t.moltiverse.title.toUpperCase()}</span>
                </div>
                <ConnectButton />
            </nav>

            <div style={{ maxWidth: 1100, margin: '80px auto', padding: '0 24px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 40 }}>
                        <div>
                            <h1 style={{ fontFamily: display, fontSize: 48, background: 'linear-gradient(to right, #E040FB, #00E5FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
                                {t.moltiverse.title}
                            </h1>
                            <p style={{ fontFamily: mono, fontSize: 14, color: '#888' }}>
                                {t.moltiverse.subtitle}
                            </p>
                        </div>
                        <div style={{ fontFamily: mono, fontSize: 12, color: '#666', border: '1px solid #333', padding: '8px 12px', borderRadius: 4 }}>
                            PROVISIONED VIA SMART CONTRACT
                        </div>
                    </div>

                    {/* Realms List */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                        {loading ? (
                            <div style={{ fontFamily: mono, color: '#666' }}>Scanning Network...</div>
                        ) : realms.length === 0 ? (
                            <div style={{ fontFamily: mono, color: '#666' }}>No AgentDAOs detected. Deploy via contract to appear here.</div>
                        ) : (
                            realms.map((realm, i) => (
                                <motion.div
                                    key={realm.realmAddress}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    style={{
                                        background: '#111',
                                        border: '1px solid #333',
                                        borderRadius: 4,
                                        padding: 24,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ position: 'absolute', top: 0, right: 0, background: '#333', padding: '4px 8px', fontFamily: mono, fontSize: 10 }}>
                                        {realm.symbol}
                                    </div>
                                    <h2 style={{ fontFamily: display, fontSize: 24, marginBottom: 8, color: '#FFF' }}>{realm.name}</h2>
                                    <div style={{ fontFamily: mono, fontSize: 10, color: '#666', marginBottom: 16 }}>
                                        {realm.realmAddress}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontFamily: mono, fontSize: 11, color: '#888' }}>
                                            Creator: {realm.creator.slice(0, 6)}...
                                        </div>
                                        <div style={{ fontFamily: mono, fontSize: 11, color: '#E040FB' }}>
                                            {new Date(realm.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
