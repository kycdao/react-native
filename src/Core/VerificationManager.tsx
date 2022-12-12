import { RNVerificationManager } from '../RNVerificationManager';
import type { 
  VerificationStatus, 
  VerificationSessionInterface, 
  WalletSessionInterface, 
  IdentityFlowResult, 
  PaymentEstimation,
  PriceEstimation, 
  TokenImage, 
  PersonalData, 
  // MethodHasValidTokenParams, 
  // MethodHasValidTokenWalletSessionParams, 
  MintingResult, 
  Configuration,
  VerificationType
} from  "./Models";
import type { BaseWalletSession } from './BaseWalletSession';

export { IdentityFlowResult, VerificationStatus, PersonalData, Configuration, KycDaoEnvironment } from "./Models";
export { BaseWalletSession }

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

  public async createSession(walletAddress: string, walletSession: BaseWalletSession): Promise<VerificationSession> {
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
                            sessionData.hasMembership,
                            sessionData.disclaimerText,
                            sessionData.termsOfServiceURL,
                            sessionData.privacyPolicyURL,
                            walletSession,
                            );
    }
    console.log("Native model of KYCSession does not match the TypeScript model");
    throw TypeError("Native model of KYCSession does not match the TypeScript model");
  }

  public async hasValidToken(verificationType: VerificationType, walletAddress: string, chainId: string) : Promise<boolean>;
  public async hasValidToken(verificationType: VerificationType, walletAddress: string, walletSession: WalletSessionInterface) : Promise<boolean>;
  
  public async hasValidToken(verificationType: VerificationType, walletAddress: string, walletSessionOrChainId: WalletSessionInterface | string) : Promise<boolean> {
    if (typeof walletSessionOrChainId === 'string') {
      return await RNVerificationManager.hasValidToken(verificationType, walletAddress, walletSessionOrChainId);
    }
    return await RNVerificationManager.hasValidToken(verificationType, walletAddress, walletSessionOrChainId.chainId);
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
  hasMembership: boolean;
  disclaimerText: string;
  termsOfServiceURL: string;
  privacyPolicyURL: string;
  walletSession: BaseWalletSession;

  constructor(
    id: string,
    walletAddress: string,
    chainId: string,
    loggedIn: boolean,
    emailConfirmed: boolean, 
    disclaimerAccepted: boolean, 
    requiredInformationProvided: boolean, 
    verificationStatus: VerificationStatus,
    hasMembership: boolean,
    disclaimerText: string,
    termsOfServiceURL: string,
    privacyPolicyURL: string,
    walletSession: BaseWalletSession,
  ) {
    this.id = id;
    this.walletAddress = walletAddress;
    this.chainId = chainId;
    this.loggedIn = loggedIn;
    this.emailConfirmed = emailConfirmed;
    this.disclaimerAccepted = disclaimerAccepted;
    this.requiredInformationProvided = requiredInformationProvided;
    this.verificationStatus = verificationStatus;
    this.hasMembership = hasMembership;
    this.disclaimerText = disclaimerText;
    this.termsOfServiceURL = termsOfServiceURL;
    this.privacyPolicyURL = privacyPolicyURL;
    this.walletSession = walletSession;
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

  public async resendConfirmationEmail() {
    await RNVerificationManager.resendConfirmationEmail({ ...this });
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

  public async getMembershipCostPerYear(): Promise<number> {
    return await RNVerificationManager.getMembershipCostPerYear({ ...this });
  }

  public async estimatePayment(yearsPurchased: number): Promise<PaymentEstimation> {
    return await RNVerificationManager.estimatePayment({ ...this }, yearsPurchased);
  }

  public async getMintingPrice(): Promise<PriceEstimation> {
    return await RNVerificationManager.getMintingPrice({ ...this });
  }

  public async requestMinting(selectedImageId: string, membershipDuration: number) {
    await RNVerificationManager.requestMinting({ ...this }, selectedImageId, membershipDuration);
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
