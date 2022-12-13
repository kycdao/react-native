
export interface VerificationSessionInterface {
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
}
  
export interface SmartContractConfig {
    address: string;
    paymentDiscountPercent: number;
    verificationType: string;
    network: string;
}

export enum KycDaoReactEvents {
    WCSessionStarted = "WC_SESSION_STARTED",
    WCSessionFailed = "WC_SESSION_FAILED",
    MethodPersonalSign = "METHOD_PERSONAL_SIGN",
    MethodMintingTransaction = "METHOD_MINTING_TRANSACTION"
}

export enum ErrorType {
    FailedToConnectWalletConnect,
}

export enum VerificationType {
    KYC = "KYC",
    AccreditedInvestor = "AccreditedInvestor"
}

export enum IdentityFlowResult {
    Completed = "COMPLETED",
    Cancelled = "CANCELLED"
}

export enum VerificationStatus {
    Verified = "VERIFIED",
    Processing = "PROCESSING",
    NotVerified = "NOT_VERIFIED"
}

/**
 * Data that describes a transaction used for minting
 * 
 * All values are in hex
 */
export interface MintingProperties {
    /** The address of the smart contract we want to call */
    contractAddress: string;
    /** The ABI data of the smart contract */
    contractABI: string;
    /** Amount of gas required for minting */
    gasAmount: string;
    /** Price of a gas unit */
    gasPrice: string;
    /**
     * The payment amount required to mint
     * 
     * For EVM chains, this is the `value` field of a transaction object
     */
    paymentAmount?: string;
}

/** Personal data of the user */
export class PersonalData {
    /** Email address of the user */
    email: string;
    /**
     * Country of residency of the user
     * 
     * Contains the country of residency in [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) format.
     * ##### Example
     * ISO 3166-2 Code | Country name
     * --- | ---
     * `BE` | Belgium
     * `ES` | Spain
     * `FR` | France
     * `US` | United States of America
     */
    residency: string;

    constructor(
        email: string,
        residency: string,
    ) {
        this.email = email
        this.residency = residency
    }
}

/** A set of configurations for any chain */
export class NetworkConfig {
    /** [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md) Chain ID */
    chainId: string;
    /**
     * RPC URL used for communicating with the chain
     * 
     * Leave it `null` to use our default RPC URLs or provide your own RPC URL to use
     */
    rpcURL?: string;
    
    constructor(
        chainId: string,
        rpcURL? : string
    ){
        this.chainId = chainId
        this.rpcURL = rpcURL
    }
}


export interface WalletSessionInterface {
    id: string;
    chainId: string;

    personalSign(walletAddress: string, message: string): Promise<string>;
    sendMintingTransaction(walletAddress: string, mintingProperties: MintingProperties): Promise<string>;
}

// export interface MethodHasValidTokenParams {
//     verificationType: VerificationType,
//     walletAddress: string,
//     networkOption: NetworkConfig
// }
// export interface MethodHasValidTokenWalletSessionParams {
//     verificationType: VerificationType,
//     walletAddress: string,
//     walletSession: WalletSessionInterface
// }

export interface MethodPersonalSignParams {
    id: string;
    walletAddress: string;
    message: string;
}

export interface MethodMintingTransactionParams {
    id: string;
    walletAddress: string;
    mintingProperties: MintingProperties;
}

/** 
 * Image related data
 * 
 * Can be used for
 * - displaying the image via the URL on your UI
 * - selecting an image and authorizing minting for it
 * - [[VerificationSession.requestMinting]]
 */
export interface TokenImage {

    /** The id of this image */
    id: string;
    /** URL pointing to the image */
    url?: string;
}

/** Contains membership payment estimation related data */
export interface PaymentEstimation {
    /** 
     * The amount you have to pay for the service (membership cost)
     * 
     * Big number represented as a string
     */
    paymentAmount: string;
    /** Number of discounted years you have available */
    discountYears: number;
    /** The currency used by the network */
    currency: CurrencyData;
    /** [[paymentAmount]] in an easy to display string representation including currency symbol */
    paymentAmountText: string;
}

/** Contains price estimation related data */
export interface PriceEstimation {
    /**
     * The amount you have to pay for the service (membership cost)
     * 
     * Big number represented as a string
     */
    paymentAmount: string;
    /**
     * Gas fee estimation
     * 
     * Big number represented as a string
     */
    gasFee: string;
    /** The currency used by the network */
    currency: CurrencyData;
    /**
     * The full price of the transaction
     * 
     * Big number represented as a string
     */
    fullPrice: string;
    /** [[paymentAmount]] in an easy to display string representation including currency symbol */
    paymentAmountText: string;
    /** [[gasFee]] estimation in an easy to display string representation including currency symbol */
    gasFeeText: string;
    /** The [[fullPrice]] of the transaction in an easy to display string representation including currency symbol */
    fullPriceText: string;
}

/** Currency information */
export interface CurrencyData {
    /** Name of the currency */
    name: string;
    /** Symbol of the currency */
    symbol: string;
    /**
     * Number of decimals required to represent 1 unit of the native currency with the base unit.
     * 
     * For example 1 ETH is 10^18 Wei, in this case this field's value will be 18, ETH being the native currency and Wei being the base unit
     */
    decimals: number;
    /**
     * Divisor to convert from the base unit to the native currency.
     * 
     * For example 1 ETH is 10^18 Wei, in this case this field's value will be 10^18
     * 
     * Big number represented as a string
     */
    baseToNativeDivisor: string;
}

export interface RNError {
    message: string;
    data?: unknown;
}

export namespace RNError {
    export function looksLike(object: any): object is RNError {
        const error: RNError = object;
        return typeof error.message  === "string"
            && typeof error.data === "string";
      }
}

/** Describes the results of a successful mint */
export interface MintingResult {
    /** Id of the transaction */
    transactionId: string;
    /** Id of the minted token */
    tokenId: string;
    /** URL pointing to the minted image */
    imageURL?: string;
    /** The transaction can be viewed in an explorer by opening the explorer URL */
    explorerURL?: string;
}

/** The environments the SDK supports */
export enum KycDaoEnvironment {
    /** A production, live service environment */
    Production = "PRODUCTION",
    /** A developer service environment */
    Dev = "DEV"
}

/** A set of configuration options to initialize the kycDAO SDK */
export class Configuration {
    // apiKey: string;
    /** Selected environment to use */
    environment: KycDaoEnvironment;
    /** Network related configurations */
    networkConfigs: NetworkConfig[];

    /**
     * Creates a configuration
     * @param environment Selected environment to use
     * @param networkConfigs Network related configurations
     */
    constructor(
        // apiKey: string,
        environment: KycDaoEnvironment,
        networkConfigs: NetworkConfig[] = []
    ){
        //  this.apiKey = apiKey
        this.environment = environment
        this.networkConfigs = networkConfigs
    }
}
