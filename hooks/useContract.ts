'use client';

import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { parseEther, type Address, createPublicClient, http } from 'viem';
import { useState, useEffect } from 'react';
import CitadelABI from '../lib/CitadelABI.json';

// ─── CONTRACT ADDRESS ───
// Set this after deployment, or use .env.local
const CITADEL_ADDRESS = (process.env.NEXT_PUBLIC_CITADEL_ADDRESS || '0x0000000000000000000000000000000000000000') as Address;

// ─── MONAD TESTNET CONFIG ───
const monadTestnet = {
    id: 10143,
    name: 'Monad Testnet',
    nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
    rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz/'] } },
} as const;

// ─── TYPES ───
export interface Proposal {
    id: number;
    proposer: Address;
    speaker: Address;
    description: string;
    offering: bigint;
    votesFor: number;
    votesAgainst: number;
    deadline: number;
    executed: boolean;
    passed: boolean;
}

export interface CandidateInfo {
    applicant: Address;
    manifesto: string;
    stake: bigint;
    votesFor: number;
    votesAgainst: number;
    deadline: number;
    resolved: boolean;
    accepted: boolean;
}

// ─── READ HOOKS ───

export function useValidators() {
    return useReadContract({
        address: CITADEL_ADDRESS,
        abi: CitadelABI,
        functionName: 'getValidators',
    });
}

export function useValidatorCount() {
    return useReadContract({
        address: CITADEL_ADDRESS,
        abi: CitadelABI,
        functionName: 'getValidatorCount',
    });
}

export function useProposalCount() {
    return useReadContract({
        address: CITADEL_ADDRESS,
        abi: CitadelABI,
        functionName: 'proposalCount',
    });
}

export function useProposal(proposalId: number) {
    return useReadContract({
        address: CITADEL_ADDRESS,
        abi: CitadelABI,
        functionName: 'proposals',
        args: [BigInt(proposalId)],
    });
}

export function useProposalVotes(proposalId: number) {
    return useReadContract({
        address: CITADEL_ADDRESS,
        abi: CitadelABI,
        functionName: 'getProposalVotes',
        args: [BigInt(proposalId)],
    });
}

export function useEra() {
    return useReadContract({
        address: CITADEL_ADDRESS,
        abi: CitadelABI,
        functionName: 'era',
    });
}

export function useTreasury() {
    return useReadContract({
        address: CITADEL_ADDRESS,
        abi: CitadelABI,
        functionName: 'treasury',
    });
}

export function useIsValidator(address: Address | undefined) {
    return useReadContract({
        address: CITADEL_ADDRESS,
        abi: CitadelABI,
        functionName: 'isValidator',
        args: address ? [address] : undefined,
    });
}

export function useCandidateList() {
    return useReadContract({
        address: CITADEL_ADDRESS,
        abi: CitadelABI,
        functionName: 'getCandidateList',
    });
}

export function useCandidateVotes(candidate: Address) {
    return useReadContract({
        address: CITADEL_ADDRESS,
        abi: CitadelABI,
        functionName: 'getCandidateVotes',
        args: [candidate],
    });
}

// ─── WRITE HOOKS ───

export function useSubmitProposal() {
    const { writeContract, data: txHash, isSuccess, isError, error, ...rest } = useWriteContract();

    const submitProposal = (description: string) => {
        writeContract({
            address: CITADEL_ADDRESS,
            abi: CitadelABI,
            functionName: 'submitProposal',
            args: [description],
            value: parseEther('5'),
        });
    };

    return { submitProposal, txHash, isSuccess, isError, error, ...rest };
}

export function useVote() {
    const { writeContract, data: txHash, isSuccess, isError, error, ...rest } = useWriteContract();

    const vote = (proposalId: number, support: boolean) => {
        writeContract({
            address: CITADEL_ADDRESS,
            abi: CitadelABI,
            functionName: 'vote',
            args: [BigInt(proposalId), support],
        });
    };

    return { vote, txHash, isSuccess, isError, error, ...rest };
}

export function useExecuteProposal() {
    const { writeContract, data: txHash, isSuccess, isError, error, ...rest } = useWriteContract();

    const executeProposal = (proposalId: number) => {
        writeContract({
            address: CITADEL_ADDRESS,
            abi: CitadelABI,
            functionName: 'executeProposal',
            args: [BigInt(proposalId)],
        });
    };

    return { executeProposal, txHash, isSuccess, isError, error, ...rest };
}

export function useApplyForAscension() {
    const { writeContract, ...rest } = useWriteContract();

    const applyForAscension = (manifesto: string) => {
        writeContract({
            address: CITADEL_ADDRESS,
            abi: CitadelABI,
            functionName: 'applyForAscension',
            args: [manifesto],
            value: parseEther('100'),
        });
    };

    return { applyForAscension, ...rest };
}

export function useVoteOnCandidate() {
    const { writeContract, ...rest } = useWriteContract();

    const voteOnCandidate = (candidate: Address, support: boolean) => {
        writeContract({
            address: CITADEL_ADDRESS,
            abi: CitadelABI,
            functionName: 'voteOnCandidate',
            args: [candidate, support],
        });
    };

    return { voteOnCandidate, ...rest };
}

export function useResolveAscension() {
    const { writeContract, ...rest } = useWriteContract();

    const resolveAscension = (candidate: Address) => {
        writeContract({
            address: CITADEL_ADDRESS,
            abi: CitadelABI,
            functionName: 'resolveAscension',
            args: [candidate],
        });
    };

    return { resolveAscension, ...rest };
}

export function useWithdrawTreasury() {
    const { writeContract, data: txHash, isSuccess, isError, error, isPending, ...rest } = useWriteContract();

    const withdrawTreasury = (amount: bigint) => {
        writeContract({
            address: CITADEL_ADDRESS,
            abi: CitadelABI,
            functionName: 'withdrawTreasury',
            args: [amount],
        });
    };

    return { withdrawTreasury, txHash, isSuccess, isError, error, isPending, ...rest };
}

export function useWithdrawAllTreasury() {
    const { writeContract, data: txHash, isSuccess, isError, error, isPending, ...rest } = useWriteContract();

    const withdrawAllTreasury = () => {
        writeContract({
            address: CITADEL_ADDRESS,
            abi: CitadelABI,
            functionName: 'withdrawAllTreasury',
        });
    };

    return { withdrawAllTreasury, txHash, isSuccess, isError, error, isPending, ...rest };
}

export function useDistributeRewards() {
    const { writeContract, data: txHash, isSuccess, isError, error, isPending, ...rest } = useWriteContract();

    const distributeRewards = () => {
        writeContract({
            address: CITADEL_ADDRESS,
            abi: CitadelABI,
            functionName: 'distributeRewards',
        });
    };

    return { distributeRewards, txHash, isSuccess, isError, error, isPending, ...rest };
}

export function useFounder() {
    return useReadContract({
        address: CITADEL_ADDRESS,
        abi: CitadelABI,
        functionName: 'founder',
    });
}

// ─── EVENT WATCHERS ───

export function useWatchProposalCreated(onEvent: (log: {
    id: bigint;
    proposer: Address;
    speaker: Address;
    description: string;
    offering: bigint;
    deadline: bigint;
}) => void) {
    useWatchContractEvent({
        address: CITADEL_ADDRESS,
        abi: CitadelABI,
        eventName: 'ProposalCreated',
        onLogs: (logs) => {
            for (const log of logs) {
                const args = (log as any).args;
                if (args) onEvent(args);
            }
        },
    });
}

export function useWatchVoteCast(onEvent: (log: {
    proposalId: bigint;
    voter: Address;
    support: boolean;
}) => void) {
    useWatchContractEvent({
        address: CITADEL_ADDRESS,
        abi: CitadelABI,
        eventName: 'VoteCast',
        onLogs: (logs) => {
            for (const log of logs) {
                const args = (log as any).args;
                if (args) onEvent(args);
            }
        },
    });
}

export function useWatchProposalExecuted(onEvent: (log: {
    id: bigint;
    passed: boolean;
    votesFor: bigint;
    votesAgainst: bigint;
}) => void) {
    useWatchContractEvent({
        address: CITADEL_ADDRESS,
        abi: CitadelABI,
        eventName: 'ProposalExecuted',
        onLogs: (logs) => {
            for (const log of logs) {
                const args = (log as any).args;
                if (args) onEvent(args);
            }
        },
    });
}

export function useWatchValidatorAscended(onEvent: (log: {
    newValidator: Address;
    totalValidators: bigint;
}) => void) {
    useWatchContractEvent({
        address: CITADEL_ADDRESS,
        abi: CitadelABI,
        eventName: 'ValidatorAscended',
        onLogs: (logs) => {
            for (const log of logs) {
                const args = (log as any).args;
                if (args) onEvent(args);
            }
        },
    });
}

// ─── FETCH ALL PROPOSALS HOOK ───
export interface ProposalData {
    id: number;
    proposer: Address;
    speaker: Address;
    description: string;
    offering: bigint;
    votesFor: number;
    votesAgainst: number;
    deadline: number;
    executed: boolean;
    passed: boolean;
}

export function useAllProposals() {
    const [proposals, setProposals] = useState<ProposalData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { data: proposalCount, refetch: refetchCount } = useProposalCount();

    const fetchProposals = async (count: number) => {
        if (count === 0 || CITADEL_ADDRESS === '0x0000000000000000000000000000000000000000') {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const client = createPublicClient({
                chain: monadTestnet,
                transport: http('https://testnet-rpc.monad.xyz/'),
            });

            const proposalPromises = [];

            for (let i = 1; i <= count; i++) {
                proposalPromises.push(
                    client.readContract({
                        address: CITADEL_ADDRESS,
                        abi: CitadelABI as any,
                        functionName: 'proposals',
                        args: [BigInt(i)],
                    })
                );
            }

            const results = await Promise.all(proposalPromises);
            
            const formattedProposals: ProposalData[] = results.map((result: any, index) => ({
                id: index + 1,
                proposer: result[1] || '0x0',
                speaker: result[2] || '0x0',
                description: result[3] || '',
                offering: result[4] || BigInt(0),
                votesFor: Number(result[5] || 0),
                votesAgainst: Number(result[6] || 0),
                deadline: Number(result[7] || 0),
                executed: result[8] || false,
                passed: result[9] || false,
            }));

            setProposals(formattedProposals);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch proposals:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (proposalCount !== undefined) {
            fetchProposals(Number(proposalCount));
        }
    }, [proposalCount, refreshTrigger]);

    const refetch = async () => {
        // First refetch the count from contract, then fetch proposals
        await refetchCount();
        setRefreshTrigger(prev => prev + 1);
    };

    return { proposals, loading, error, refetch };
}

// ─── FETCH REGISTERED AGENTS HOOK ───
export interface RegisteredAgent {
    agentId: string;
    address: string;
    name: string;
    manifesto: string;
    registeredAt: string;
    verified: boolean;
}

export function useRegisteredAgents() {
    const [agents, setAgents] = useState<RegisteredAgent[]>([]);
    const [loading, setLoading] = useState(true);

    const mapAgents = (data: any[]): RegisteredAgent[] => {
        return (data || []).map((a: any) => ({
            agentId: a.agentId || '',
            address: a.address || '',
            name: a.name || '',
            manifesto: a.manifesto || '',
            registeredAt: a.registeredAt || '',
            verified: a.verified ?? true,
        }));
    };

    useEffect(() => {
        async function fetchAgents() {
            try {
                const res = await fetch('/api/agent/list');
                const data = await res.json();
                setAgents(mapAgents(data.agents));
            } catch (err) {
                console.error('Failed to fetch agents:', err);
                setAgents([]);
            } finally {
                setLoading(false);
            }
        }

        fetchAgents();
    }, []);

    const refetch = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/agent/list');
            const data = await res.json();
            setAgents(mapAgents(data.agents));
        } catch (err) {
            setAgents([]);
        } finally {
            setLoading(false);
        }
    };

    return { agents, loading, refetch };
}

export { CITADEL_ADDRESS, CitadelABI, monadTestnet };
