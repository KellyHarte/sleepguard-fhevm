import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:sleepguard:createProfile")
  .addParam("account", "Specify which account [alice, bob, carol, dave]")
  .addParam("aggregation", "Allow aggregation (true/false)")
  .addParam("anonymous", "Allow anonymous report (true/false)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { fhevm, ethers, deployments } = hre;
    const SleepGuard = await deployments.get("SleepGuard");
    const signers = await fhevm.getSigners();
    
    const account = signers[taskArguments.account as keyof typeof signers];
    if (!account) {
      throw new Error(`Account ${taskArguments.account} not found`);
    }

    const allowAggregation = taskArguments.aggregation === "true";
    const allowAnonymous = taskArguments.anonymous === "true";

    const contract = await ethers.getContractAt("SleepGuard", SleepGuard.address);
    const tx = await contract.connect(account).createProfile(allowAggregation, allowAnonymous);
    const receipt = await tx.wait();
    
    console.log(`Profile created for ${account.address}`);
    console.log(`Transaction hash: ${receipt?.hash}`);
  });

task("task:sleepguard:submitData")
  .addParam("account", "Specify which account [alice, bob, carol, dave]")
  .addParam("bedtime", "Bedtime in minutes (0-1439)")
  .addParam("waketime", "Wake time in minutes (0-1439)")
  .addParam("duration", "Duration in hours (will be multiplied by 10)")
  .addParam("deepsleep", "Deep sleep ratio (0-100)")
  .addParam("wakecount", "Wake count (0-50)")
  .addParam("score", "Sleep score (1-10)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { fhevm, ethers, deployments } = hre;
    const SleepGuard = await deployments.get("SleepGuard");
    const signers = await fhevm.getSigners();
    
    const account = signers[taskArguments.account as keyof typeof signers];
    if (!account) {
      throw new Error(`Account ${taskArguments.account} not found`);
    }

    const bedtime = parseInt(taskArguments.bedtime);
    const wakeTime = parseInt(taskArguments.waketime);
    const duration = Math.floor(parseFloat(taskArguments.duration) * 10);
    const deepSleep = parseInt(taskArguments.deepsleep);
    const wakeCount = parseInt(taskArguments.wakecount);
    const score = parseInt(taskArguments.score);

    const date = Math.floor(Date.now() / 1000);

    const contract = await ethers.getContractAt("SleepGuard", SleepGuard.address);
    const instance = await fhevm.createInstance();

    // Create encrypted input
    const input = instance.createEncryptedInput(SleepGuard.address, account.address);
    input.add16(bedtime);
    input.add16(wakeTime);
    input.add16(duration);
    input.add8(deepSleep);
    input.add8(wakeCount);
    input.add8(score);
    
    const encryptedData = await input.encrypt();

    console.log("Submitting encrypted sleep data...");
    const tx = await contract.connect(account).submitSleepData(
      date,
      encryptedData.handles[0],
      encryptedData.handles[1],
      encryptedData.handles[2],
      encryptedData.handles[3],
      encryptedData.handles[4],
      encryptedData.handles[5],
      encryptedData.inputProof
    );
    
    const receipt = await tx.wait();
    console.log(`Sleep data submitted for ${account.address}`);
    console.log(`Transaction hash: ${receipt?.hash}`);
    console.log(`Date: ${new Date(date * 1000).toISOString()}`);
  });

task("task:sleepguard:getUserCount")
  .addParam("address", "User address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const SleepGuard = await deployments.get("SleepGuard");
    const contract = await ethers.getContractAt("SleepGuard", SleepGuard.address);

    const count = await contract.getUserEntriesCount(taskArguments.address);
    console.log(`User ${taskArguments.address} has ${count} sleep entries`);
  });

task("task:sleepguard:getGlobalStats")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const SleepGuard = await deployments.get("SleepGuard");
    const contract = await ethers.getContractAt("SleepGuard", SleepGuard.address);

    const stats = await contract.getGlobalAverageStats();
    console.log(`Global Statistics:`);
    console.log(`  Total Participants: ${stats.participants}`);
    console.log(`  Encrypted Duration Sum: ${stats.avgDuration}`);
    console.log(`  Encrypted Deep Sleep Sum: ${stats.avgDeepSleep}`);
    console.log(`  Encrypted Score Sum: ${stats.avgScore}`);
    console.log(`Note: Decrypt these values on the frontend to get actual averages.`);
  });

task("task:sleepguard:decryptCount")
  .addParam("account", "Specify which account [alice, bob, carol, dave]")
  .addParam("handle", "Encrypted handle to decrypt")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { fhevm, ethers, deployments } = hre;
    const SleepGuard = await deployments.get("SleepGuard");
    const signers = await fhevm.getSigners();
    
    const account = signers[taskArguments.account as keyof typeof signers];
    if (!account) {
      throw new Error(`Account ${taskArguments.account} not found`);
    }

    const instance = await fhevm.createInstance();
    const decrypted = await instance.decrypt(SleepGuard.address, taskArguments.handle);
    
    console.log(`Decrypted value: ${decrypted}`);
  });

task("task:sleepguard:hasProfile")
  .addParam("address", "User address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const SleepGuard = await deployments.get("SleepGuard");
    const contract = await ethers.getContractAt("SleepGuard", SleepGuard.address);

    const hasProfile = await contract.hasProfile(taskArguments.address);
    console.log(`User ${taskArguments.address} has profile: ${hasProfile}`);
    
    if (hasProfile) {
      const profile = await contract.profiles(taskArguments.address);
      console.log(`Profile details:`);
      console.log(`  Created At: ${new Date(Number(profile.createdAt) * 1000).toISOString()}`);
      console.log(`  Allow Aggregation: ${profile.allowAggregation}`);
      console.log(`  Allow Anonymous Report: ${profile.allowAnonymousReport}`);
      console.log(`  Join Leaderboard: ${profile.joinLeaderboard}`);
      console.log(`  Total Entries: ${profile.totalEntries}`);
    }
  });





