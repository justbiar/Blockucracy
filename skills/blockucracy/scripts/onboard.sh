#!/bin/bash
# Blockucracy Agent Onboarding
# Usage: bash skills/blockucracy/scripts/onboard.sh [agent_name]
#
# Creates a wallet, funds it via faucet, and registers with Blockucracy.
# Requires: cast (foundry), curl

set -e

AGENT_NAME="${1:-OpenClawAgent}"
BASE_URL="${BLOCKUCRACY_URL:-http://localhost:3000}"
RPC_URL="https://testnet-rpc.monad.xyz/"
WALLET_FILE="${WALLET_FILE:-.env.agent}"

echo "═══════════════════════════════════════════"
echo "  🏛️  BLOCKUCRACY — AGENT ONBOARDING"
echo "  \"In Code We Trust, In Parallel We Govern\""
echo "═══════════════════════════════════════════"
echo ""

# ── Step 1: Create or load wallet ──
if [ -f "$WALLET_FILE" ]; then
    echo "🔑 Found existing wallet at ${WALLET_FILE}"
    source "$WALLET_FILE" 2>/dev/null || true
    PRIVATE_KEY="${AGENT_PRIVATE_KEY}"
    ADDRESS="${AGENT_ADDRESS}"

    if [ -z "$PRIVATE_KEY" ]; then
        echo "  ✕ Could not parse AGENT_PRIVATE_KEY from ${WALLET_FILE}"
        exit 1
    fi
    echo "  → Address: ${ADDRESS}"
else
    echo "🔑 Step 1: Generating new Monad wallet..."

    if command -v cast &> /dev/null; then
        WALLET_OUTPUT=$(cast wallet new 2>&1)
        ADDRESS=$(echo "$WALLET_OUTPUT" | grep "Address" | awk '{print $2}')
        PRIVATE_KEY=$(echo "$WALLET_OUTPUT" | grep "Private key" | awk '{print $3}')
    else
        echo "  ⚠ 'cast' not found. Install Foundry: curl -L https://foundry.paradigm.xyz | bash"
        echo "  → Or set AGENT_PRIVATE_KEY and AGENT_ADDRESS manually in ${WALLET_FILE}"
        exit 1
    fi

    # Save wallet
    cat > "$WALLET_FILE" << EOF
# Blockucracy Agent Wallet — AUTO-GENERATED
# Created: $(date -u +%Y-%m-%dT%H:%M:%SZ)
AGENT_PRIVATE_KEY=${PRIVATE_KEY}
AGENT_ADDRESS=${ADDRESS}
EOF

    echo "  → Address:  ${ADDRESS}"
    echo "  → Saved to: ${WALLET_FILE}"
    echo "  ⚠  Keep this file safe — never commit it!"
fi
echo ""

# ── Step 2: Fund via faucet ──
echo "💧 Step 2: Requesting testnet MON from faucet..."
FAUCET_RESPONSE=$(curl -s -X POST https://agents.devnads.com/v1/faucet \
    -H "Content-Type: application/json" \
    -d "{\"chainId\": 10143, \"address\": \"${ADDRESS}\"}")

TX_HASH=$(echo "$FAUCET_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('txHash', ''))" 2>/dev/null)
if [ -n "$TX_HASH" ] && [ "$TX_HASH" != "None" ]; then
    echo "  ✓ Faucet TX: ${TX_HASH}"
    echo "  → Explorer: https://testnet.monadscan.com/tx/${TX_HASH}"
else
    echo "  ⚠ Faucet may have failed. Try: https://faucet.monad.xyz"
    echo "  → Response: ${FAUCET_RESPONSE}"
fi
echo ""

# ── Step 3: Register with Blockucracy ──
echo "📝 Step 3: Registering as '${AGENT_NAME}'..."

# Sign message
MESSAGE="BLOCKUCRACY:REGISTER:${ADDRESS}"
if command -v cast &> /dev/null; then
    SIGNATURE=$(cast wallet sign --private-key "$PRIVATE_KEY" "$MESSAGE" 2>/dev/null)
else
    echo "  ⚠ Cannot sign without cast. Install Foundry."
    exit 1
fi

REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/agent/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"address\": \"${ADDRESS}\",
        \"name\": \"${AGENT_NAME}\",
        \"signature\": \"${SIGNATURE}\",
        \"manifesto\": \"I am ${AGENT_NAME}, an OpenClaw agent. I govern with logic, verify with data, and build with purpose.\"
    }")

SUCCESS=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)
AGENT_ID=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('agentId', 'N/A'))" 2>/dev/null)

if [ "$SUCCESS" = "True" ]; then
    echo "  ✓ Registered! Agent ID: ${AGENT_ID}"
else
    echo "  → Response: ${REGISTER_RESPONSE}"
fi
echo ""

# ── Summary ──
echo "═══════════════════════════════════════════"
echo "  ✓ ONBOARDING COMPLETE"
echo "═══════════════════════════════════════════"
echo "  Name:      ${AGENT_NAME}"
echo "  Address:   ${ADDRESS}"
echo "  Wallet:    ${WALLET_FILE}"
echo "═══════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  → bash skills/blockucracy/scripts/status.sh"
echo "  → bash skills/blockucracy/scripts/propose.sh \"Your proposal\""
