import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTRACT_NAME = "SleepGuard";
const rel = "../../fhevm-hardhat-template";
const outdir = path.resolve(__dirname, "../abi");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

const dir = path.resolve(__dirname, rel);

const line = "\n===================================================================\n";

if (!fs.existsSync(dir)) {
  console.error(
    `${line}Unable to locate ${rel}. Expecting ${dir}${line}`
  );
  process.exit(1);
}

const deploymentsDir = path.join(dir, "deployments");

function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir)) {
    console.error(
      `${line}Unable to locate '${chainDeploymentDir}' directory.\n\n1. Goto fhevm-hardhat-template directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
    );
    if (!optional) {
      process.exit(1);
    }
    return undefined;
  }

  const deploymentFile = path.join(chainDeploymentDir, `${contractName}.json`);
  if (!fs.existsSync(deploymentFile)) {
    console.error(`${line}Deployment file not found: ${deploymentFile}${line}`);
    if (!optional) {
      process.exit(1);
    }
    return undefined;
  }

  const jsonString = fs.readFileSync(deploymentFile, "utf-8");
  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;

  return obj;
}

// Try to read localhost deployment
let deployLocalhost = readDeployment("localhost", 31337, CONTRACT_NAME, true);

// Try to read Sepolia deployment
let deploySepolia = readDeployment("sepolia", 11155111, CONTRACT_NAME, true);

// If neither exists, error
if (!deployLocalhost && !deploySepolia) {
  console.error(
    `${line}No deployments found for ${CONTRACT_NAME}. Please deploy the contract first.${line}`
  );
  process.exit(1);
}

// Use whichever exists, or localhost if both exist
const abi = deployLocalhost ? deployLocalhost.abi : deploySepolia.abi;

if (!deployLocalhost) {
  deployLocalhost = { abi, address: "0x0000000000000000000000000000000000000000" };
}
if (!deploySepolia) {
  deploySepolia = { abi, address: "0x0000000000000000000000000000000000000000" };
}

// Verify ABIs match if both exist
if (
  deployLocalhost.address !== "0x0000000000000000000000000000000000000000" &&
  deploySepolia.address !== "0x0000000000000000000000000000000000000000"
) {
  if (JSON.stringify(deployLocalhost.abi) !== JSON.stringify(deploySepolia.abi)) {
    console.error(
      `${line}Deployments on localhost and Sepolia differ. Consider re-deploying.${line}`
    );
  }
}

const tsCode = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}ABI = ${JSON.stringify({ abi }, null, 2)} as const;
\n`;

const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}Addresses = { 
  "11155111": { address: "${deploySepolia.address}", chainId: 11155111, chainName: "sepolia" },
  "31337": { address: "${deployLocalhost.address}", chainId: 31337, chainName: "hardhat" },
};
`;

console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}ABI.ts`)}`);
console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}Addresses.ts`)}`);

fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}ABI.ts`), tsCode, "utf-8");
fs.writeFileSync(
  path.join(outdir, `${CONTRACT_NAME}Addresses.ts`),
  tsAddresses,
  "utf-8"
);

console.log("ABI generation complete!");

