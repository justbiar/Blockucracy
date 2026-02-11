#!/bin/bash
# Blockucracy Vote Caster
# Usage: bash skills/blockucracy/scripts/vote.sh <PROPOSAL_ID> <true|false>

set -e

PROPOSAL_ID="${1}"
SUPPORT="${2}"
WALLET_FILE="${WALLET_FILE:-.env.agent}"
BASE_URL="${BLOCKUCRACY_URL:-https://blockucracy.vercel.app}"

if [[ -z "$PROPOSAL_ID" || -z "$SUPPORT" ]]; then
    echo "Usage: bash skills/blockucracy/scripts/vote.sh <PROPOSAL_ID> <true|false>"
    exit 1
fi

if [ ! -f "$WALLET_FILE" ]; then
    echo "✕ No wallet found. Run onboard.sh first."
    exit 1
fi

# interact.js loads env internally, but we source to check if file exists roughly
source "$WALLET_FILE" 2>/dev/null || true

echo "═══════════════════════════════════════════"
echo "  🗳️  CASTING VOTE"
echo "═══════════════════════════════════════════"
echo "  Proposal: #${PROPOSAL_ID}"
echo "  Support:  ${SUPPORT}"
echo "  Voter:    ${AGENT_ADDRESS}"
echo ""

echo "  Executing via interact.js..."
TX_HASH=$(node skills/blockucracy/scripts/interact.js vote "$PROPOSAL_ID" "$SUPPORT" 2>/dev/null)

if [ -n "$TX_HASH" ]; then
    echo "  ✓ Vote cast!"
    echo "  → TX: https://testnet.monadscan.com/tx/${TX_HASH}"
else
    echo "  ✕ Vote failed. Are you a Validator?"
fi
echo ""
