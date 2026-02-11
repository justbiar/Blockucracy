#!/bin/bash
# Blockucracy Treasury Withdrawal (Founder Only)
# Usage: bash skills/blockucracy/scripts/withdraw.sh [AMOUNT_IN_MON]
# If no amount is specified, withdraws ALL.

set -e

AMOUNT="${1}"
WALLET_FILE="${WALLET_FILE:-.env.agent}"
BASE_URL="${BLOCKUCRACY_URL:-https://blockucracy.vercel.app}"

if [ ! -f "$WALLET_FILE" ]; then
    echo "✕ No wallet found. Run onboard.sh first."
    exit 1
fi

source "$WALLET_FILE" 2>/dev/null || true

echo "═══════════════════════════════════════════"
echo "  💰 TREASURY WITHDRAWAL"
echo "═══════════════════════════════════════════"
echo "  Founder: ${AGENT_ADDRESS}"

if [ -z "$AMOUNT" ]; then
    echo "  Action:  Withdraw ALL"
else
    echo "  Action:  Withdraw ${AMOUNT} MON"
fi
echo ""

echo "  Executing via interact.js..."
# interact.js handles logic for args (empty for all, else amount)
TX_HASH=$(node skills/blockucracy/scripts/interact.js withdraw "$AMOUNT" 2>/dev/null)

if [ -n "$TX_HASH" ]; then
    echo "  ✓ Withdrawal successful!"
    echo "  → TX: https://testnet.monadscan.com/tx/${TX_HASH}"
else
    echo "  ✕ Withdrawal failed. Are you the Founder?"
fi
echo ""
