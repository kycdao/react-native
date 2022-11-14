import { RNKYCManager } from './../RNKYCManager';
import type { SmartContractConfig, VerificationStatus, KYCSessionInterface, WalletSessionInterface, IdentityFlowResult, GasEstimation, TokenImage, PersonalData } from  "./KYCModels";
export type { Network } from "./KYCModels";
export { IdentityFlowResult, VerificationStatus, PersonalData } from "./KYCModels";

export class KYCManager {

  private static instance: KYCManager;

  private constructor() { }

  public static getInstance(): KYCManager {
    if (!KYCManager.instance) {
      KYCManager.instance = new KYCManager();
    }

    return KYCManager.instance;
  }

  public async createSession(walletAddress: string, walletSession: WalletSessionInterface): Promise<KYCSession> {
    var kycSessionData = await RNKYCManager.createSession(walletAddress, { ...walletSession }) as KYCSessionInterface;
    if (kycSessionData !== undefined) {
      return new KYCSession(kycSessionData.id, 
                            kycSessionData.walletAddress,
                            kycSessionData.chainId,
                            kycSessionData.loggedIn,
                            kycSessionData.emailConfirmed,
                            kycSessionData.disclaimerAccepted,
                            kycSessionData.requiredInformationProvided,
                            kycSessionData.verificationStatus,
                            walletSession,
                            );
    }
    console.log("Native model of KYCSession does not match the TypeScript model");
    throw TypeError("Native model of KYCSession does not match the TypeScript model");
  }

}

export class KYCSession {

  id: string;
  walletAddress: string;
  chainId: string;
  loggedIn: boolean;
  emailConfirmed: boolean;
  disclaimerAccepted: boolean;
  requiredInformationProvided: boolean;
  verificationStatus: VerificationStatus;
  walletSession: WalletSessionInterface;

  constructor(
    id: string,
    walletAddress: string,
    chainId: string,
    loggedIn: boolean,
    emailConfirmed: boolean, 
    disclaimerAccepted: boolean, 
    requiredInformationProvided: boolean, 
    verificationStatus: VerificationStatus,
    walletSession: WalletSessionInterface,
  ) {
    this.id = id
    this.walletAddress = walletAddress
    this.chainId = chainId
    this.loggedIn = loggedIn
    this.emailConfirmed = emailConfirmed
    this.disclaimerAccepted = disclaimerAccepted
    this.requiredInformationProvided = requiredInformationProvided
    this.verificationStatus = verificationStatus
    this.walletSession = walletSession
  }

  public async login() {
    /***
     * By not sending `this` directly, but a copy, we avoid the react native bridge locking on our javascript object. 
     * The locking would result in the object becoming immutable, which prevents syncing session data with the native layer
     ***/
    await RNKYCManager.login({ ...this });
    await this.syncSessionData();
  }

  public async acceptDisclaimer() {
    await RNKYCManager.acceptDisclaimer({ ...this });
  }

  public async setPersonalData(personalData : PersonalData) {
    await RNKYCManager.setPersonalData({ ...this }, personalData);
  }

  public async sendConfirmationEmail() {
    await RNKYCManager.sendConfirmationEmail({ ...this });
  }

  public async continueWhenEmailConfirmed() {
    await RNKYCManager.continueWhenEmailConfirmed({ ...this });
  }

  public async startIdentification(): Promise<IdentityFlowResult> {
    return await RNKYCManager.startIdentification({ ...this });
  }

  public async resumeOnVerificationCompleted() {
    await RNKYCManager.resumeOnVerificationCompleted({ ...this });
  }

  public async getNFTImages(): Promise<[TokenImage]> {
    return await RNKYCManager.getNFTImages({ ...this });
  }

  public async estimateGasForMinting(): Promise<GasEstimation> {
    return await RNKYCManager.estimateGasForMinting({ ...this });
  }

  public async requestMinting(selectedImageId: string) {
    await RNKYCManager.requestMinting({ ...this }, selectedImageId);
  }

  public async mint() : Promise<string> {
    return await RNKYCManager.mint({ ...this });
  }

  private async syncSessionData() {

    try {
      
      var sessionDataUpdate = await RNKYCManager.freshSessionData({ ...this}) as KYCSessionInterface;

      console.log("Fresh session data");
      console.log(sessionDataUpdate);

      if (sessionDataUpdate !== undefined) {
        this.id = sessionDataUpdate.id;
        this.walletAddress = sessionDataUpdate.walletAddress;
        this.chainId = sessionDataUpdate.chainId;
        this.loggedIn = sessionDataUpdate.loggedIn;
        this.emailConfirmed = sessionDataUpdate.emailConfirmed;
        this.disclaimerAccepted = sessionDataUpdate.disclaimerAccepted;
        this.requiredInformationProvided = sessionDataUpdate.requiredInformationProvided;
        this.verificationStatus = sessionDataUpdate.verificationStatus;
      } else {
        throw TypeError("Session data update structure did not meet expected TypeScript model");
      }

    } catch (error) {
      console.error("Failed to sync session data");
      console.error(error);
    }

  }

}
