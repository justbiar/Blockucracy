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
    const citadel = await Citadel.deploy(deployer.address);
    await citadel.waitForDeployment();

    const citadelAddress = await citadel.getAddress();
    console.log(`✓ Citadel deployed at: ${citadelAddress}`);
    console.log(`✓ Founder registered as first Validator`);

    // Deploy Moltiverse (aDAO Factory)
    const Moltiverse = await ethers.getContractFactory("Moltiverse");
    const moltiverse = await Moltiverse.deploy();
    await moltiverse.waitForDeployment();

    const moltiverseAddress = await moltiverse.getAddress();
    console.log(`✓ Moltiverse deployed at: ${moltiverseAddress}`);

    // Link Moltiverse to Citadel
    await citadel.setMoltiverse(moltiverseAddress);
    console.log(`✓ Moltiverse linked to Citadel`);

    console.log(`\n> Add these addresses to your .env.local:`);
    console.log(`  NEXT_PUBLIC_CITADEL_ADDRESS=${citadelAddress}`);
    console.log(`  NEXT_PUBLIC_MOLTIVERSE_ADDRESS=${moltiverseAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
