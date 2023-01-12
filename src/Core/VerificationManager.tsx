import { RNVerificationManager } from '../RNVerificationManager';
import type { 
  VerificationStatus, 
  VerificationSessionInterface, 
  // WalletSessionInterface, 
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

/**
 * A class used for verification related tasks, like querying verification status for different wallets or creating verification sessions
 */
export class VerificationManager {

  private static instance: VerificationManager;

  private constructor() { }

  /**
   * VerificationManager singleton instance
   *
   * @returns The VerificationManager instance
   */
  public static getInstance(): VerificationManager {
    if (!VerificationManager.instance) {
      VerificationManager.instance = new VerificationManager();
    }

    return VerificationManager.instance;
  }

  /**
   * Initializes the SDK with a configuration
   *
   * !!! Important
   * You have to provide a configuration for the SDK **before** using it. Configuration can only be set **once** per app launch!
   * !!!
   * 
   * @param configuration The configuration options for the SDK
   */
  public static async configure(configuration: Configuration) {
     await RNVerificationManager.configure({ ... configuration });
  }

  /**
   * Creates a [[VerificationSession]] which is used for implementing the verification flow
   * 
   * @param walletAddress The address of the wallet we are creating the session for
   * @param walletSession The [[BaseWalletSession]] that will be used for signing messages and minting
   * @return The [[VerificationSession]] object
   */
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
                            sessionData.emailAddress
                            );
    }
    console.log("Native model of KYCSession does not match the TypeScript model");
    throw TypeError("Native model of KYCSession does not match the TypeScript model");
  }

  /**
   * Checks on-chain whether the wallet has a valid token for the verification type
   * 
   * @param verificationType The type of verification we want to find a valid token for
   * @param walletAddress The address of the wallet the token belongs to
   * @param chainId [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md) chain id of the network to use
   * @return True, when the wallet has a valid token for the selected verification type on the wallet session’s network
   */
  public async hasValidToken(verificationType: VerificationType, walletAddress: string, chainId: string) : Promise<boolean>;
  
  /**
   * Checks on-chain whether the wallet has a valid token for the verification type
   * 
   * @param verificationType The type of verification we want to find a valid token for
   * @param walletAddress The address of the wallet the token belongs to
   * @param walletSession A [[BaseWalletSession]] instance
   * @return True, when the wallet has a valid token for the selected verification type on the wallet session’s network
   */
  public async hasValidToken(verificationType: VerificationType, walletAddress: string, walletSession: BaseWalletSession) : Promise<boolean>;
  
  public async hasValidToken(verificationType: VerificationType, walletAddress: string, walletSessionOrChainId: BaseWalletSession | string) : Promise<boolean> {
    if (typeof walletSessionOrChainId === 'string') {
      return await RNVerificationManager.hasValidToken(verificationType, walletAddress, walletSessionOrChainId);
    }
    return await RNVerificationManager.hasValidToken(verificationType, walletAddress, walletSessionOrChainId.chainId);
  }

  /**
   * Checks on-chain whether the wallet has a valid token for the verification type
   * 
   * @param verificationType The type of verification we want to find a valid token for
   * @param walletAddress The address of the wallet the token belongs to
   * @return True, when the wallet has a valid token for the selected verification type on the wallet session’s network
   */
  public async checkVerifiedNetworks(verificationType: VerificationType, walletAddress: string) : Promise<{[key: string]: boolean}> {
    return await RNVerificationManager.checkVerifiedNetworks(verificationType, walletAddress);
  }

}

/**
 * A verification session object which contains session related data and session related operations
 */
export class VerificationSession {

  /** A unique identifier for the session */
  id: string;
  /** Wallet address used to create the session */
  walletAddress: string;
  /** The ID of the chain used specified in [CAIP-2 format](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md) */
  chainId: string;
  /** The login state of the user in this session */
  loggedIn: boolean;
  /** Email confirmation status of the user */
  emailConfirmed: boolean;
  /** Disclaimer acceptance status of the user */
  disclaimerAccepted: boolean;
  /** Indicates that the user provided every information required to continue with identity verification */
  requiredInformationProvided: boolean;
  /** Verification status of the user */
  verificationStatus: VerificationStatus;
  /** The membership status of the user
   * 
   * For users that are already members, you should skip the membership purchase step
   */
  hasMembership: boolean;
  /** A disclaimer text to show to the users */
  disclaimerText: string;
  /** Terms of service link to show */
  termsOfServiceURL: string;
  /** Privacy policy link to show */
  privacyPolicyURL: string;
  /** A wallet session associated with this `VerificationSession` */
  walletSession: BaseWalletSession;
  /** Email address of the user */
  emailAddress?: string;

  /** @internal */
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
    emailAddress?: string
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
    this.emailAddress = emailAddress;
  }

  /**
   * Logs in the user to the current session
   * 
   * The user will be redirected to their wallet where they have to sign a session data to login
   */
  public async login() {
    /***
     * By not sending `this` directly, but a copy, we avoid the react native bridge locking on our javascript object. 
     * The locking would result in the object becoming immutable, which prevents syncing session data with the native layer
     ***/
    await RNVerificationManager.login({ ...this });
    await this.syncSessionData();
  }

  /**
   * Used for signaling that the logged in user accepts kycDAO's disclaimer
   */
  public async acceptDisclaimer() {
    await RNVerificationManager.acceptDisclaimer({ ...this });
    await this.syncSessionData();
  }

  /**
   * Used for setting user related personal information.
   * 
   * !!! Important
   * Disclaimer has to be accepted before you can set the personal data
   * !!!
   * !!! Important
   * After setting personal data a confirmation email will be sent out to the user automatically
   * !!!
   * 
   * @param personalData Contains the personal data needed from the user
   */
  public async setPersonalData(personalData: PersonalData) {
    await RNVerificationManager.setPersonalData({ ...this }, personalData);
    await this.syncSessionData();
  }

  /**
   * Updates the email address of the user
   * 
   * !!! Important
   * Email confirmation is automatically sent, if the email is not confirmed yet.
   * !!!
   * 
   * @param newEmail New email address
   */
  public async updateEmail(newEmail: string) {
    await RNVerificationManager.updateEmail({ ...this }, newEmail);
    await this.syncSessionData();
  }

  /**
   * Resends a confirmation email to the user's email address
   * 
   * Initial confirmation email is sent out automatically after setting or updating email address
   * 
   * !!! Important
   * If the email address is already confirmed or an email address is not set for the user, then throws an error
   * !!!
   */
  public async resendConfirmationEmail() {
    await RNVerificationManager.resendConfirmationEmail({ ...this });
  }

  /** Suspends the current async task and continues execution when email address becomes confirmed. */
  public async resumeOnEmailConfirmed() {
    await RNVerificationManager.resumeOnEmailConfirmed({ ...this });
    await this.syncSessionData();
  }

  /**
   * Starts the identity verification process, uses [Persona](https://withpersona.com/)
   * 
   * !!!warning Warning
   * The return value only tells whether the user completed the identity flow or cancelled it. Information regarding the validity of the identity verification can be accessed at [[verificationStatus]].
   * !!!
   * !!! Important
   * The verification process may take a long time, you can actively wait for completion after the identity flow is done by by using [[resumeOnVerificationCompleted]].
   * !!!
   * 
   * @returns The result of the identity verification flow.
   */
  public async startIdentification(): Promise<IdentityFlowResult> {
    return await RNVerificationManager.startIdentification({ ...this });
  }

  /**
   * A function which awaits until the user's identity becomes successfuly verified
   */
  public async resumeOnVerificationCompleted() {
    await RNVerificationManager.resumeOnVerificationCompleted({ ...this });
    await this.syncSessionData();
  }

  /**
   * Provides the available kycNFT images the user can choose from
   * @returns A list of image related data
   */
  public async getNFTImages(): Promise<[TokenImage]> {
    return await RNVerificationManager.getNFTImages({ ...this });
  }

  /**
   * Regenerates and returns the available kycNFT images the user can choose from
   * @returns A list of image related data
   */
  public async regenerateNFTImages(): Promise<[TokenImage]> {
    let images = await RNVerificationManager.regenerateNFTImages({ ...this });
    await this.syncSessionData();
    return images;
  }

  /**
   * Use it for displaying annual membership cost to the user
   * @returns The cost of membership per year in USD
   */
  public async getMembershipCostPerYearText(): Promise<string> {
    return await RNVerificationManager.getMembershipCostPerYearText({ ...this });
  }

  /**
   * Use it for estimating membership costs for number of years
   * @param yearsPurchased Number of years to purchase a membership for
   * @returns The payment estimation
   */
  public async estimatePayment(yearsPurchased: number): Promise<PaymentEstimation> {
    return await RNVerificationManager.estimatePayment({ ...this }, yearsPurchased);
  }

  /**
   * Use it for estimating minting price, including gas fees and payment for membership
   * !!!warning Warning
   * Only call this function after you requested minting by calling [[requestMinting]] at some point, otherwise you will receive an `unauthorizedMinting` error
   * !!!
   * @returns The price estimation
   */
  public async getMintingPrice(): Promise<PriceEstimation> {
    return await RNVerificationManager.getMintingPrice({ ...this });
  }

  /**
   * Requesting minting authorization for a selected image and membership duration
   * 
   * You can get the list of available images from [[getNFTImages]]
   * @param selectedImageId The id of the image the user selected to mint
   * @param membershipDuration Membership duration to purchase
   */
  public async requestMinting(selectedImageId: string, membershipDuration: number) {
    await RNVerificationManager.requestMinting({ ...this }, selectedImageId, membershipDuration);
    await this.syncSessionData();
  }

  /**
   * Used for minting the kycNFT
   * 
   * !!! Important
   * Can only be called after the user was authorized for minting with a selected image and membership duration with [[requestMinting]]
   * !!!
   * @returns Successful minting related data
   */
  public async mint() : Promise<MintingResult> {
    let result = await RNVerificationManager.mint({ ...this });
    await this.syncSessionData();
    return result;
  }

  private async syncSessionData() {

    try {
      
      var sessionDataUpdate = await RNVerificationManager.freshSessionData({ ...this }) as VerificationSessionInterface;

      if (sessionDataUpdate !== undefined) {
        this.id = sessionDataUpdate.id;
        this.walletAddress = sessionDataUpdate.walletAddress;
        this.chainId = sessionDataUpdate.chainId;
        this.loggedIn = sessionDataUpdate.loggedIn;
        this.emailConfirmed = sessionDataUpdate.emailConfirmed;
        this.disclaimerAccepted = sessionDataUpdate.disclaimerAccepted;
        this.requiredInformationProvided = sessionDataUpdate.requiredInformationProvided;
        this.verificationStatus = sessionDataUpdate.verificationStatus;
        this.emailAddress = sessionDataUpdate.emailAddress;
      } else {
        throw TypeError("Session data update structure did not meet expected TypeScript model");
      }

    } catch (error) {
      console.error("Failed to sync session data");
      console.error(error);
    }

  }

}
