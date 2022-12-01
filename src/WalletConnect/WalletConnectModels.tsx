import type { WalletSessionInterface } from "../Core/Models";

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

export class WCSessionError extends Error {
   wallet?: Wallet;

   constructor(message: string, wallet?: Wallet) {
    super(message)
    this.wallet = wallet
  }
}
