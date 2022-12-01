import { RNVerificationManager } from '../RNVerificationManager';
import { RNWalletConnectManager } from '../WalletConnect/WalletConnectManager';
import type { 
  VerificationStatus, 
  VerificationSessionInterface, 
  WalletSessionInterface, 
  IdentityFlowResult, 
  GasEstimation, 
  TokenImage, 
  PersonalData, 
  MethodHasValidTokenParams, 
  MethodHasValidTokenWalletSessionParams, 
  MintingResult, 
  Configuration,
} from  "./Models";
export type { Network } from "./Models";
export { IdentityFlowResult, VerificationStatus, PersonalData, Configuration, KycDaoEnvironment } from "./Models";

export class VerificationManager {

  private static instance: VerificationManager;

  private constructor() { }

  public static getInstance(): VerificationManager {
    if (!VerificationManager.instance) {
      VerificationManager.instance = new VerificationManager();
    }

    return VerificationManager.instance;
  }

  public static async configure(configuration: Configuration) {
     await RNVerificationManager.configure({ ... configuration });
  }

  public async createSession(walletAddress: string, walletSession: WalletSessionInterface): Promise<VerificationSession> {
    var sessionData = await RNVerificationManager.createSession(walletAddress, { ...walletSession }) as VerificationSessionInterface;
    if (sessionData !== undefined) {
      return new VerificationSession(sessionData.id, 
                            sessionData.walletAddress,
                            sessionData.chainId,
                            sessionData.loggedIn,
                            sessionData.emailConfirmed,
                            sessionData.disclaimerAccepted,
                            sessionData.requiredInformationProvided,
                            sessionData.verificationStatus,
                            walletSession,
                            );
    }
    console.log("Native model of KYCSession does not match the TypeScript model");
    throw TypeError("Native model of KYCSession does not match the TypeScript model");
  }

  public async hasValidToken(params: MethodHasValidTokenParams) : Promise<boolean>{
    return await RNVerificationManager.hasValidToken(params)
  }
  public async hasValidTokenWalletSession(params: MethodHasValidTokenWalletSessionParams) : Promise<boolean>{
    return await RNWalletConnectManager.hasValidTokenWalletSession(params)
  }

}

export class VerificationSession {

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
    await RNVerificationManager.login({ ...this });
    await this.syncSessionData();
  }

  public async acceptDisclaimer() {
    await RNVerificationManager.acceptDisclaimer({ ...this });
  }

  public async setPersonalData(personalData : PersonalData) {
    await RNVerificationManager.setPersonalData({ ...this }, personalData);
  }

  public async sendConfirmationEmail() {
    await RNVerificationManager.sendConfirmationEmail({ ...this });
  }

  public async resumeOnEmailConfirmed() {
    await RNVerificationManager.resumeOnEmailConfirmed({ ...this });
  }

  public async startIdentification(): Promise<IdentityFlowResult> {
    return await RNVerificationManager.startIdentification({ ...this });
  }

  public async resumeOnVerificationCompleted() {
    await RNVerificationManager.resumeOnVerificationCompleted({ ...this });
  }

  public async getNFTImages(): Promise<[TokenImage]> {
    return await RNVerificationManager.getNFTImages({ ...this });
  }

  public async estimateGasForMinting(): Promise<GasEstimation> {
    return await RNVerificationManager.estimateGasForMinting({ ...this },3);
  }

  public async requestMinting(selectedImageId: string) {
    await RNVerificationManager.requestMinting({ ...this }, selectedImageId);
  }

  public async mint() : Promise<MintingResult> {
    return await RNVerificationManager.mint({ ...this });
  }

  private async syncSessionData() {

    try {
      
      var sessionDataUpdate = await RNVerificationManager.freshSessionData({ ...this}) as VerificationSessionInterface;

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
