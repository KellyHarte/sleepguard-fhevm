import type { Eip1193Provider } from "ethers";

export interface FhevmInstance {
  createEncryptedInput(contractAddress: string, userAddress: string): EncryptedInputBuilder;
  getPublicKey(): Uint8Array;
  getPublicParams(maxBits?: number): Uint8Array;
  decrypt(contractAddress: string, handle: string): Promise<bigint | boolean>;
  userDecrypt(
    handles: Array<{ handle: string; contractAddress: string }>,
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimestamp: number,
    durationDays: number
  ): Promise<Record<string, bigint | boolean>>;
  createEIP712(
    publicKey: string,
    contractAddresses: string[],
    startTimestamp: number,
    durationDays: number
  ): EIP712Type;
  generateKeypair(): { publicKey: string; privateKey: string };
}

export interface EncryptedInputBuilder {
  add8(value: number | bigint): EncryptedInputBuilder;
  add16(value: number | bigint): EncryptedInputBuilder;
  add32(value: number | bigint): EncryptedInputBuilder;
  add64(value: number | bigint): EncryptedInputBuilder;
  addBool(value: boolean): EncryptedInputBuilder;
  encrypt(): Promise<EncryptedInput>;
}

export interface EncryptedInput {
  handles: string[];
  inputProof: string;
}

export interface FhevmInstanceConfig {
  network: Eip1193Provider | string;
  aclContractAddress: string;
  kmsVerifierContractAddress: string;
  inputVerifierContractAddress: string;
  publicKey?: Uint8Array;
  publicParams?: Uint8Array;
}

export interface FhevmWindowType extends Window {
  relayerSDK: FhevmRelayerSDKType;
}

export interface FhevmRelayerSDKType {
  initSDK(options?: FhevmInitSDKOptions): Promise<boolean>;
  createInstance(config: FhevmInstanceConfig): Promise<FhevmInstance>;
  SepoliaConfig: {
    aclContractAddress: string;
    kmsVerifierContractAddress: string;
    inputVerifierContractAddress: string;
  };
  __initialized__?: boolean;
}

export interface FhevmInitSDKOptions {
  debug?: boolean;
}

export type FhevmInitSDKType = (options?: FhevmInitSDKOptions) => Promise<boolean>;
export type FhevmLoadSDKType = () => Promise<void>;

export interface EIP712Type {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  primaryType: string;
  types: {
    [key: string]: Array<{ name: string; type: string }>;
  };
  message: Record<string, any>;
}

export interface FhevmDecryptionSignatureType {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number;
  durationDays: number;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
  eip712: EIP712Type;
}




