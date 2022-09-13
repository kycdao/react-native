import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-awesome-module' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const KycdaoMobile = NativeModules.KycdaoMobile  ? NativeModules.KycdaoMobile  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export const RNWalletConnectManager = NativeModules.RNWalletConnectManager  ? NativeModules.RNWalletConnectManager  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export const RNKYCManager = NativeModules.RNKYCManager  ? NativeModules.RNKYCManager  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

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

export interface WalletSession {
  url: WCURL;
  walletId?: string;
  accounts?: [string];
  icon?: string;
  name?: string;
  chainId?: number;
}

export interface KYCSession {
  id: string;
  walletAddress: string;
  network: Network;
  kycConfig?: SmartContractConfig;
  accreditedConfig?: SmartContractConfig;
  loginProof: string;
  isLoggedIn: boolean;
  emailAddress?: string;
  emailConfirmed: boolean;
  residency?: string;
  residencyProvided: boolean;
  emailProvided: boolean;
  disclaimerAccepted: boolean;
  legalEntityStatus: boolean;
  requiredInformationProvided: boolean;
  verificationStatus: SimplifiedVerificationStatus;
}

export enum SimplifiedVerificationStatus {
  Verified,
  Processing,
  NotVerified
}

export interface SmartContractConfig {
  address: string;
  paymentDiscountPercent: number;
  verificationType: string;
  network: Network;
}

export enum Network {
  EthereumMainnet = 1,
  CeloMainnet = 42220,
  CeloAlfajores = 44787,
  PolygonMumbai = 80001,
}

export enum KycReactEvents {
  WCSessionStarted = "WC_SESSION_STARTED",
}

export function multiply(a: number, b: number): Promise<number> {
  return KycdaoMobile.multiply(a, b);
}

export function printStuff(stuff: string) {
  KycdaoMobile.printStuff(stuff);
}

export function launchKycFlow() {
  KycdaoMobile.launchKycFlow();
}

export function startListening(): Promise<string> {
  return RNWalletConnectManager.startListening();
}

export function listWallets(): Promise<[Wallet]> {
  return RNWalletConnectManager.listWallets();
}

export function connect(wallet: Wallet): Promise<void> {
  return RNWalletConnectManager.connect(wallet);
}

export function sign(sessionData: WalletSession, account: string, message: string): Promise<string> {
  return RNWalletConnectManager.sign(sessionData, account, message);
}

export function createSession(walletAddress: string, network: Network): Promise<KYCSession> {
  return RNKYCManager.createSession(walletAddress, network);
}

export function login(sessionData: KYCSession, signature: string): Promise<void> {
  return RNKYCManager.login(sessionData, signature);
}
