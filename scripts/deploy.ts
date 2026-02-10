import { ethers } from "hardhat";

async function main() {
    console.log("╔══════════════════════════════════════════════════════════╗");
    console.log("║  Deploying THE CITADEL to Monad Testnet...              ║");
    console.log("║  'In Code We Trust, In Parallel We Govern'              ║");
    console.log("╚══════════════════════════════════════════════════════════╝");

    const [deployer] = await ethers.getSigners();
    console.log(`\n> Founder (Deployer): ${deployer.address}`);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`> Balance: ${ethers.formatEther(balance)} MON\n`);

    // Deploy the Citadel
    const Citadel = await ethers.getContractFactory("Citadel");
    const citadel = await Citadel.deploy();
    await citadel.waitForDeployment();

    const address = await citadel.getAddress();
    console.log(`✓ Citadel deployed at: ${address}`);
    console.log(`✓ Founder registered as first Validator`);
    console.log(`\n> Add this address to your .env.local:`);
    console.log(`  NEXT_PUBLIC_CITADEL_ADDRESS=${address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
