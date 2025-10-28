import { JsonRpcProvider } from "ethers";

const HARDHAT_URL = "http://localhost:8545";

async function checkHardhatNode() {
  try {
    const provider = new JsonRpcProvider(HARDHAT_URL);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    if (chainId === 31337) {
      console.log("✓ Hardhat node detected (chainId: 31337)");
      console.log("✓ dev:mock mode will use @fhevm/mock-utils");
      return true;
    } else {
      console.warn(`⚠ Node at ${HARDHAT_URL} has chainId ${chainId}, expected 31337`);
      return false;
    }
  } catch (error) {
    console.error("✗ Hardhat node not running at " + HARDHAT_URL);
    console.error("  Please start it with: cd fhevm-hardhat-template && npx hardhat node");
    process.exit(1);
  }
}

await checkHardhatNode();





