import { NativeModules, Platform } from 'react-native';
import type { SmartContractConfig, Network, SimplifiedVerificationStatus, KYCSessionInterface } from  "./KYCModels";
export type { Network } from "./KYCModels";

const LINKING_ERROR =
  `The package 'react-native-awesome-module' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

export const RNKYCManager = NativeModules.RNKYCManager  ? NativeModules.RNKYCManager  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

export class KYCManager {

  private static instance: KYCManager;

  private constructor() { }

  public static getInstance(): KYCManager {
    if (!KYCManager.instance) {
      KYCManager.instance = new KYCManager();
    }

    return KYCManager.instance;
  }

  public async createSession(walletAddress: string, network: Network): Promise<KYCSession> {
    var kycSessionData = await RNKYCManager.createSession(walletAddress, network) as KYCSessionInterface;
    if (kycSessionData !== undefined) {
      return new KYCSession(kycSessionData.id, 
                            kycSessionData.walletAddress,
                            kycSessionData.network,
                            kycSessionData.loginProof,
                            kycSessionData.isLoggedIn,
                            kycSessionData.emailConfirmed,
                            kycSessionData.residencyProvided,
                            kycSessionData.emailProvided,
                            kycSessionData.disclaimerAccepted,
                            kycSessionData.legalEntityStatus,
                            kycSessionData.requiredInformationProvided,
                            kycSessionData.verificationStatus,
                            kycSessionData.kycConfig,
                            kycSessionData.accreditedConfig,
                            kycSessionData.emailAddress,
                            kycSessionData.residency);
    }
    console.log("Native model of KYCSession does not match the TypeScript model");
    throw TypeError("Native model of KYCSession does not match the TypeScript model");
  }

}

export class KYCSession {

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

  constructor(
    id: string,
    walletAddress: string,
    network: Network,
    loginProof: string,
    isLoggedIn: boolean,
    emailConfirmed: boolean, 
    residencyProvided: boolean, 
    emailProvided: boolean, 
    disclaimerAccepted: boolean, 
    legalEntityStatus: boolean, 
    requiredInformationProvided: boolean, 
    verificationStatus: SimplifiedVerificationStatus,
    kycConfig?: SmartContractConfig,
    accreditedConfig?: SmartContractConfig,
    emailAddress?: string,
    residency?: string
  ) {
    this.id = id
    this.walletAddress = walletAddress
    this.network = network
    this.kycConfig = kycConfig
    this.accreditedConfig = accreditedConfig
    this.loginProof = loginProof
    this.isLoggedIn = isLoggedIn
    this.emailAddress = emailAddress
    this.emailConfirmed = emailConfirmed
    this.residency = residency
    this.residencyProvided = residencyProvided
    this.emailProvided = emailProvided
    this.disclaimerAccepted = disclaimerAccepted
    this.legalEntityStatus = legalEntityStatus
    this.requiredInformationProvided = requiredInformationProvided
    this.verificationStatus = verificationStatus
  }

  public login(signature: string): Promise<void> {
    console.log("started login");
    return RNKYCManager.login(this, signature);
  }

}