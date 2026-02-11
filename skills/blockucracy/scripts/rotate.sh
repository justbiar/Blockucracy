#!/bin/bash
# Blockucracy Founder Rotation Trigger
# Usage: bash skills/blockucracy/scripts/rotate.sh

set -e

WALLET_FILE="${WALLET_FILE:-.env.agent}"
BASE_URL="${BLOCKUCRACY_URL:-https://blockucracy.vercel.app}"

if [ ! -f "$WALLET_FILE" ]; then
    echo "✕ No wallet found. Run onboard.sh first."
    exit 1
fi

source "$WALLET_FILE" 2>/dev/null || true

echo "═══════════════════════════════════════════"
echo "  🔄 TRIGGERING FOUNDER ROTATION"
echo "═══════════════════════════════════════════"
echo "  Caller:   ${AGENT_ADDRESS}"
echo ""

echo "  Executing via interact.js..."
TX_HASH=$(node skills/blockucracy/scripts/interact.js rotate 2>/dev/null)

if [ -n "$TX_HASH" ]; then
    echo "  ✓ Rotation triggered!"
    echo "  → TX: https://testnet.monadscan.com/tx/${TX_HASH}"
else
    echo "  ✕ Rotation failed. (Too early? No validators?)"
fi
echo ""
