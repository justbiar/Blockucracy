const { createPublicClient, http } = require('viem');

const RPC_URL = 'https://testnet-rpc.monad.xyz/';
const CHAIN_ID = 10143;

const client = createPublicClient({
    transport: http(RPC_URL)
});

async function testRpc() {
    console.log(`Testing RPC: ${RPC_URL}`);
    try {
        const chainId = await client.getChainId();
        console.log(`✅ Chain ID: ${chainId}`);

        if (chainId !== CHAIN_ID) {
            console.error(`❌ Chain ID mismatch! Expected ${CHAIN_ID}, got ${chainId}`);
        }

        const gasPrice = await client.getGasPrice();
        console.log(`✅ Gas Price: ${gasPrice.toString()} wei`);

        const blockNumber = await client.getBlockNumber();
        console.log(`✅ Block Number: ${blockNumber.toString()}`);

    } catch (error) {
        console.error('❌ RPC Connection Failed:', error);
    }
}

testRpc();
