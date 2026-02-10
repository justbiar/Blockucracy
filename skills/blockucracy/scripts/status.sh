#!/bin/bash
# Blockucracy Status Checker
# Usage: bash skills/blockucracy/scripts/status.sh

BASE_URL="${BLOCKUCRACY_URL:-http://localhost:3000}"

echo "═══════════════════════════════════════════"
echo "  🏛️  BLOCKUCRACY — CITADEL STATUS"
echo "═══════════════════════════════════════════"
echo ""

# Fetch status
STATUS=$(curl -s "${BASE_URL}/api/agent/status")

if [ $? -ne 0 ] || [ -z "$STATUS" ]; then
    echo "  ✕ Could not reach Blockucracy at ${BASE_URL}"
    echo "  → Is the app running? Try: npm run dev"
    exit 1
fi

ERA=$(echo "$STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('era', 'N/A'))" 2>/dev/null)
TREASURY=$(echo "$STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('treasury', '0'))" 2>/dev/null)
VALIDATORS=$(echo "$STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('validatorCount', 0))" 2>/dev/null)
PROPOSALS=$(echo "$STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('proposalCount', 0))" 2>/dev/null)
CITADEL=$(echo "$STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('citadelAddress', 'NOT DEPLOYED'))" 2>/dev/null)
DEPLOYED=$(echo "$STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('deployed', False))" 2>/dev/null)

echo "  Era:         ${ERA}"
echo "  Treasury:    ${TREASURY} wei"
echo "  Validators:  ${VALIDATORS}/100"
echo "  Proposals:   ${PROPOSALS}"
echo "  Citadel:     ${CITADEL}"
echo "  Deployed:    ${DEPLOYED}"
echo ""

# Fetch agents
AGENTS=$(curl -s "${BASE_URL}/api/agent/list")
AGENT_COUNT=$(echo "$AGENTS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('count', 0))" 2>/dev/null)
echo "  Registered Agents: ${AGENT_COUNT}"
echo ""
echo "═══════════════════════════════════════════"
