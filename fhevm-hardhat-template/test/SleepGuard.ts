import { expect } from "chai";
import { ethers } from "hardhat";
import { createFhevmInstance, FhevmInstance } from "fhevmjs";
import type { Signers } from "./types";
import { getSigners, initSigners } from "./signers";
import type { SleepGuard } from "../types";

describe("SleepGuard", function () {
  before(async function () {
    await initSigners();
    this.signers = await getSigners();
  });

  beforeEach(async function () {
    const SleepGuardFactory = await ethers.getContractFactory("SleepGuard");
    const contract = await SleepGuardFactory.connect(this.signers.alice).deploy();
    await contract.waitForDeployment();
    this.contractAddress = await contract.getAddress();
    this.sleepGuard = contract as unknown as SleepGuard;

    // Create FHEVM instance for encryption
    this.fhevmInstance = await createFhevmInstance({
      networkUrl: "http://127.0.0.1:8545",
      aclAddress: "0x2Fb4341f57983Db5DDe06F0D

" + "Fb67BfD1B9f6e8",
      kmsVerifierAddress: "0x12E5FFb0841FaBC882F6",
    } as any);
  });

  describe("Profile Management", function () {
    it("Should create a new profile", async function () {
      const tx = await this.sleepGuard.connect(this.signers.alice).createProfile(true, true);
      await tx.wait();

      const profile = await this.sleepGuard.profiles(this.signers.alice.address);
      expect(profile.userAddress).to.equal(this.signers.alice.address);
      expect(profile.allowAggregation).to.be.true;
      expect(profile.allowAnonymousReport).to.be.true;
      expect(profile.totalEntries).to.equal(0);
    });

    it("Should not allow duplicate profile creation", async function () {
      await this.sleepGuard.connect(this.signers.alice).createProfile(true, false);
      
      await expect(
        this.sleepGuard.connect(this.signers.alice).createProfile(false, true)
      ).to.be.revertedWithCustomError(this.sleepGuard, "ProfileAlreadyExists");
    });

    it("Should update privacy settings", async function () {
      await this.sleepGuard.connect(this.signers.alice).createProfile(true, true);
      
      const tx = await this.sleepGuard.connect(this.signers.alice).updatePrivacySettings(false, false);
      await tx.wait();

      const profile = await this.sleepGuard.profiles(this.signers.alice.address);
      expect(profile.allowAggregation).to.be.false;
      expect(profile.allowAnonymousReport).to.be.false;
    });

    it("Should check if user has profile", async function () {
      let hasProfile = await this.sleepGuard.hasProfile(this.signers.alice.address);
      expect(hasProfile).to.be.false;

      await this.sleepGuard.connect(this.signers.alice).createProfile(true, false);

      hasProfile = await this.sleepGuard.hasProfile(this.signers.alice.address);
      expect(hasProfile).to.be.true;
    });
  });

  describe("Sleep Data Submission", function () {
    beforeEach(async function () {
      // Create profile first
      await this.sleepGuard.connect(this.signers.alice).createProfile(true, true);
    });

    it("Should submit encrypted sleep data", async function () {
      const date = Math.floor(Date.now() / 1000);
      const bedtime = 1380; // 23:00 in minutes
      const wakeTime = 420; // 07:00 in minutes
      const duration = 80; // 8.0 hours * 10
      const deepSleepRatio = 45; // 45%
      const wakeCount = 2;
      const sleepScore = 8;

      // Create encrypted input
      const input = this.fhevmInstance.createEncryptedInput(
        this.contractAddress,
        this.signers.alice.address
      );
      
      input.add16(bedtime);
      input.add16(wakeTime);
      input.add16(duration);
      input.add8(deepSleepRatio);
      input.add8(wakeCount);
      input.add8(sleepScore);
      
      const encryptedData = await input.encrypt();

      const tx = await this.sleepGuard.connect(this.signers.alice).submitSleepData(
        date,
        encryptedData.handles[0],
        encryptedData.handles[1],
        encryptedData.handles[2],
        encryptedData.handles[3],
        encryptedData.handles[4],
        encryptedData.handles[5],
        encryptedData.inputProof
      );
      await tx.wait();

      const entriesCount = await this.sleepGuard.getUserEntriesCount(this.signers.alice.address);
      expect(entriesCount).to.equal(1);

      const profile = await this.sleepGuard.profiles(this.signers.alice.address);
      expect(profile.totalEntries).to.equal(1);
    });

    it("Should not allow duplicate submission for same date", async function () {
      const date = Math.floor(Date.now() / 1000);
      
      const input1 = this.fhevmInstance.createEncryptedInput(
        this.contractAddress,
        this.signers.alice.address
      );
      input1.add16(1380).add16(420).add16(80).add8(45).add8(2).add8(8);
      const enc1 = await input1.encrypt();

      await this.sleepGuard.connect(this.signers.alice).submitSleepData(
        date, enc1.handles[0], enc1.handles[1], enc1.handles[2],
        enc1.handles[3], enc1.handles[4], enc1.handles[5], enc1.inputProof
      );

      const input2 = this.fhevmInstance.createEncryptedInput(
        this.contractAddress,
        this.signers.alice.address
      );
      input2.add16(1400).add16(440).add16(75).add8(50).add8(1).add8(9);
      const enc2 = await input2.encrypt();

      await expect(
        this.sleepGuard.connect(this.signers.alice).submitSleepData(
          date, enc2.handles[0], enc2.handles[1], enc2.handles[2],
          enc2.handles[3], enc2.handles[4], enc2.handles[5], enc2.inputProof
        )
      ).to.be.revertedWithCustomError(this.sleepGuard, "DataAlreadySubmittedForDate");
    });

    it("Should not allow submission without profile", async function () {
      const date = Math.floor(Date.now() / 1000);
      
      const input = this.fhevmInstance.createEncryptedInput(
        this.contractAddress,
        this.signers.bob.address
      );
      input.add16(1380).add16(420).add16(80).add8(45).add8(2).add8(8);
      const enc = await input.encrypt();

      await expect(
        this.sleepGuard.connect(this.signers.bob).submitSleepData(
          date, enc.handles[0], enc.handles[1], enc.handles[2],
          enc.handles[3], enc.handles[4], enc.handles[5], enc.inputProof
        )
      ).to.be.revertedWithCustomError(this.sleepGuard, "ProfileNotCreated");
    });
  });

  describe("Data Retrieval", function () {
    beforeEach(async function () {
      await this.sleepGuard.connect(this.signers.alice).createProfile(true, true);
    });

    it("Should get user entries count", async function () {
      expect(await this.sleepGuard.getUserEntriesCount(this.signers.alice.address)).to.equal(0);

      // Submit one entry
      const date = Math.floor(Date.now() / 1000);
      const input = this.fhevmInstance.createEncryptedInput(
        this.contractAddress,
        this.signers.alice.address
      );
      input.add16(1380).add16(420).add16(80).add8(45).add8(2).add8(8);
      const enc = await input.encrypt();

      await this.sleepGuard.connect(this.signers.alice).submitSleepData(
        date, enc.handles[0], enc.handles[1], enc.handles[2],
        enc.handles[3], enc.handles[4], enc.handles[5], enc.inputProof
      );

      expect(await this.sleepGuard.getUserEntriesCount(this.signers.alice.address)).to.equal(1);
    });

    it("Should get user sleep data", async function () {
      const date = Math.floor(Date.now() / 1000);
      const input = this.fhevmInstance.createEncryptedInput(
        this.contractAddress,
        this.signers.alice.address
      );
      input.add16(1380).add16(420).add16(80).add8(45).add8(2).add8(8);
      const enc = await input.encrypt();

      await this.sleepGuard.connect(this.signers.alice).submitSleepData(
        date, enc.handles[0], enc.handles[1], enc.handles[2],
        enc.handles[3], enc.handles[4], enc.handles[5], enc.inputProof
      );

      const entry = await this.sleepGuard.connect(this.signers.alice).getUserSleepData(0);
      expect(entry.date).to.equal(date);
      // Encrypted handles should be non-zero
      expect(entry.bedtime).to.not.equal(0);
    });

    it("Should revert on invalid index", async function () {
      await expect(
        this.sleepGuard.connect(this.signers.alice).getUserSleepData(0)
      ).to.be.revertedWithCustomError(this.sleepGuard, "InvalidIndex");
    });
  });

  describe("Aggregated Statistics", function () {
    beforeEach(async function () {
      await this.sleepGuard.connect(this.signers.alice).createProfile(true, true);
    });

    it("Should get user aggregated stats", async function () {
      // Submit multiple entries
      for (let i = 0; i < 3; i++) {
        const date = Math.floor(Date.now() / 1000) - i * 86400; // Different dates
        const input = this.fhevmInstance.createEncryptedInput(
          this.contractAddress,
          this.signers.alice.address
        );
        input.add16(1380).add16(420).add16(80).add8(45).add8(2).add8(8);
        const enc = await input.encrypt();

        await this.sleepGuard.connect(this.signers.alice).submitSleepData(
          date, enc.handles[0], enc.handles[1], enc.handles[2],
          enc.handles[3], enc.handles[4], enc.handles[5], enc.inputProof
        );
      }

      const stats = await this.sleepGuard.connect(this.signers.alice).getUserAggregatedStats(
        this.signers.alice.address
      );
      
      expect(stats.totalEntries).to.equal(3);
      // Encrypted sums should be non-zero
      expect(stats.sumDuration).to.not.equal(0);
    });

    it("Should not allow other users to view aggregated stats", async function () {
      await expect(
        this.sleepGuard.connect(this.signers.bob).getUserAggregatedStats(
          this.signers.alice.address
        )
      ).to.be.revertedWithCustomError(this.sleepGuard, "Unauthorized");
    });

    it("Should get global average stats", async function () {
      // Alice submits data
      const date1 = Math.floor(Date.now() / 1000);
      const input1 = this.fhevmInstance.createEncryptedInput(
        this.contractAddress,
        this.signers.alice.address
      );
      input1.add16(1380).add16(420).add16(80).add8(45).add8(2).add8(8);
      const enc1 = await input1.encrypt();

      await this.sleepGuard.connect(this.signers.alice).submitSleepData(
        date1, enc1.handles[0], enc1.handles[1], enc1.handles[2],
        enc1.handles[3], enc1.handles[4], enc1.handles[5], enc1.inputProof
      );

      // Bob creates profile and submits data
      await this.sleepGuard.connect(this.signers.bob).createProfile(true, false);
      const date2 = Math.floor(Date.now() / 1000) - 86400;
      const input2 = this.fhevmInstance.createEncryptedInput(
        this.contractAddress,
        this.signers.bob.address
      );
      input2.add16(1400).add16(440).add16(75).add8(50).add8(1).add8(9);
      const enc2 = await input2.encrypt();

      await this.sleepGuard.connect(this.signers.bob).submitSleepData(
        date2, enc2.handles[0], enc2.handles[1], enc2.handles[2],
        enc2.handles[3], enc2.handles[4], enc2.handles[5], enc2.inputProof
      );

      const globalStats = await this.sleepGuard.getGlobalAverageStats();
      expect(globalStats.participants).to.equal(2);
    });
  });

  describe("Leaderboard", function () {
    it("Should update leaderboard participation", async function () {
      await this.sleepGuard.connect(this.signers.alice).createProfile(true, true);
      
      let profile = await this.sleepGuard.profiles(this.signers.alice.address);
      expect(profile.joinLeaderboard).to.be.false;

      await this.sleepGuard.connect(this.signers.alice).updateLeaderboardParticipation(true);
      
      profile = await this.sleepGuard.profiles(this.signers.alice.address);
      expect(profile.joinLeaderboard).to.be.true;
    });
  });
});





