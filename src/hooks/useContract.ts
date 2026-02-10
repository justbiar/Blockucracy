'use client';

import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { parseEther, type Address } from 'viem';
import CitadelABI from '../lib/CitadelABI.json';

// ─── CONTRACT ADDRESS ───
// Set this after deployment, or use .env.local
const CITADEL_ADDRESS = (process.env.NEXT_PUBLIC_CITADEL_ADDRESS || '0x0000000000000000000000000000000000000000') as Address;

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

export { CITADEL_ADDRESS, CitadelABI };
