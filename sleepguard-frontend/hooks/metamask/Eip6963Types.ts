import type { Eip1193Provider } from "ethers";

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: Eip1193Provider;
}

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963AnnounceProviderEvent extends CustomEvent {
  detail: EIP6963ProviderDetail;
}

export interface EIP6963RequestProviderEvent extends Event {
  type: "eip6963:requestProvider";
}





