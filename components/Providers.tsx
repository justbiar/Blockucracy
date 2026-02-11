'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../lib/wagmi';
import { useState } from 'react';

import { LanguageProvider } from '../contexts/LanguageContext';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <LanguageProvider>
                    {children}
                </LanguageProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
