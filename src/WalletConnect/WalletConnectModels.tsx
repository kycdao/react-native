import type { MintingProperties } from "../Core/Models";

/**
 * A model that describes a wallet for the SDK usable with WalletConnect.
 * The data provided in the model is derived from the [WalletConnect V1 registry](https://registry.walletconnect.com/api/v1/wallets)
 */
export interface Wallet {
  /** A unique id of the wallet */
  id: string;
  /** An url pointing to an icon image of the wallet app */
  imageURL?: string;
  /** Universal link used for opening the wallet */
  universalLinkBase?: string;
  /** Name of the wallet app */
  name?: string;
  /** Deep link used for opening the wallet */
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
  id: string;
  chainId: string;

  personalSign(walletAddress: string, message: string): Promise<string>;
  sendMintingTransaction(walletAddress: string, mintingProperties: MintingProperties): Promise<MintingTransactionResult>;
}

export interface WalletConnectSessionInterface extends WalletSessionInterface {
  url: WCURL;
  walletId?: string;
  accounts: [string];
  icon?: string;
  name?: string;
}

export namespace WalletConnectSessionInterface {
  export function looksLike(object: any): object is WalletConnectSessionInterface {
    const wcSession: WalletConnectSessionInterface = object
    return typeof wcSession.id  === "string"
        && typeof wcSession.name === "string"
        && typeof wcSession.url === "object"
        && typeof wcSession.accounts === "object"
        && typeof wcSession.icon === "string"
        && (typeof wcSession.walletId === "string"
        || typeof wcSession.walletId === "undefined")
        && typeof wcSession.chainId === "string";
  }
}

/**
 * An Error class that describes a WalletConnectSession related error.
 * Has a message and optional associated wallet data. Wallet data only available on iOS
 */
export class WCSessionError extends Error {
  /** 
   * The wallet associated with the failed session 
   * !!!danger iOS Only
   * This parameter is iOS only and will be null on Android
   * !!!
   */
   wallet?: Wallet;

   constructor(message: string, wallet?: Wallet) {
    super(message)
    this.wallet = wallet
  }
}

export interface MintingTransactionResult {
  txHash: string;
}
