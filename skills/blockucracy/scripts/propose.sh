#!/bin/bash
# Blockucracy Proposal Submitter
# Usage: bash skills/blockucracy/scripts/propose.sh "Your proposal description"
#
# Requires: cast (foundry), a funded wallet in .env.agent

set -e

DESCRIPTION="${1}"
WALLET_FILE="${WALLET_FILE:-.env.agent}"
BASE_URL="${BLOCKUCRACY_URL:-https://blockucracy.vercel.app}"
RPC_URL="https://testnet-rpc.monad.xyz/"

if [ -z "$DESCRIPTION" ]; then
    echo "Usage: bash skills/blockucracy/scripts/propose.sh \"Your proposal description\""
    exit 1
fi

if [ ! -f "$WALLET_FILE" ]; then
    echo "✕ No wallet found. Run onboard.sh first:"
    echo "  bash skills/blockucracy/scripts/onboard.sh"
    exit 1
fi

source "$WALLET_FILE" 2>/dev/null || true

if [ -z "$AGENT_PRIVATE_KEY" ]; then
    echo "✕ Could not load AGENT_PRIVATE_KEY from ${WALLET_FILE}"
    exit 1
fi

# Get Citadel address from status API
CITADEL_ADDRESS=$(curl -s "${BASE_URL}/api/agent/status" | \
    python3 -c "import sys,json; print(json.load(sys.stdin).get('citadelAddress', ''))" 2>/dev/null)

if [ -z "$CITADEL_ADDRESS" ] || [ "$CITADEL_ADDRESS" = "None" ] || [ "$CITADEL_ADDRESS" = "null" ]; then
    echo "✕ Citadel contract not deployed yet."
    echo "  → Deploy first: npx hardhat run scripts/deploy.ts --network monadTestnet"
    exit 1
fi

echo "═══════════════════════════════════════════"
echo "  🏛️  SUBMITTING GOVERNANCE PROPOSAL"
echo "═══════════════════════════════════════════"
echo ""
echo "  Citadel:     ${CITADEL_ADDRESS}"
echo "  From:        ${AGENT_ADDRESS}"
echo "  Description: ${DESCRIPTION}"
echo "  Offering:    5 MON"
echo ""

if ! command -v node &> /dev/null; then
    echo "✕ 'node' not found. Please install Node.js."
    exit 1
fi

echo "  Executing via interact.js..."
TX_HASH=$(node skills/blockucracy/scripts/interact.js propose "$DESCRIPTION" 2>/dev/null)

if [ -n "$TX_HASH" ]; then
    echo "  ✓ Proposal submitted!"
    echo "  → TX: https://testnet.monadscan.com/tx/${TX_HASH}"
else
    echo "  ✕ Transaction failed. Check your balance (need 5+ MON)"
fi
echo ""
echo "═══════════════════════════════════════════"
