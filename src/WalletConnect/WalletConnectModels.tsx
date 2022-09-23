import type { WalletSessionInterface } from "src/KYC/KYCModels";

export interface Wallet {
    id: string;
    imageURL?: string;
    universalLinkBase?: string;
    name?: string;
    deepLinkBase?: string;
  }
  
  export interface WCURL {
    topic: string;
    version: string;
    bridgeURL: string;
    key: string;
    absoluteString: string;
  }

  export interface WalletConnectSessionInterface extends WalletSessionInterface {
    url: WCURL;
    walletId?: string;
    accounts?: [string];
    icon?: string;
    name?: string;
  }
