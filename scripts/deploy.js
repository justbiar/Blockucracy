const hre = require("hardhat");

async function main() {
    console.log("╔══════════════════════════════════════════════════════════╗");
    console.log("║  Deploying THE CITADEL to Monad Testnet...              ║");
    console.log("║  'In Code We Trust, In Parallel We Govern'              ║");
    console.log("╚══════════════════════════════════════════════════════════╝");

    const [deployer] = await hre.ethers.getSigners();

    // DEBUG: Check if account is loaded
    if (!deployer) {
        console.error("\n❌ ERROR: No deployer account found!");
        console.error("DEBUG INFO:");
        console.error("1. Network:", hre.network.name);
        console.error("2. Private Key Loaded?", process.env.PRIVATE_KEY ? "YES (Length: " + process.env.PRIVATE_KEY.length + ")" : "NO (Undefined)");
        console.error("3. Hardhat Accounts Config:", hre.network.config.accounts);
        console.error("\n👉 Lütfen .env.local dosyasında PRIVATE_KEY tanımladığından emin ol.");
        process.exit(1);
    }

    console.log(`\n> Founder (Deployer): ${deployer.address}`);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`> Balance: ${hre.ethers.formatEther(balance)} MON\n`);

    // Deploy the Citadel
    const Citadel = await hre.ethers.getContractFactory("Citadel");
    const citadel = await Citadel.deploy();
    await citadel.waitForDeployment();

    const address = await citadel.getAddress();
    console.log(`✓ Citadel deployed at: ${address}`);
    console.log(`✓ Founder registered as first Validator`);

    // Rotating Founder Info
    console.log(`\n> GOVERNANCE MODE: Rotating Founder`);
    console.log(`> Interval: 3600 blocks (~1 hour)`);
    console.log(`> Trigger: Anyone can call rotateFounder() when time is up.`);

    console.log(`\n> Add this address to your .env.local:`);
    console.log(`  NEXT_PUBLIC_CITADEL_ADDRESS=${address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
