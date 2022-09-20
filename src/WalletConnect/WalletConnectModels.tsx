
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

  export interface WalletSessionInterface {
    url: WCURL;
    walletId?: string;
    accounts?: [string];
    icon?: string;
    name?: string;
    chainId?: number;
  }