
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

export interface MintingProperties {
    contractAddress: string;
    contractABI: string;
    gasAmount: string;
    gasPrice: string;
    paymentAmount?: string;
}

export class PersonalData{
    email: string;
    residency: string;

    constructor(
        email: string,
        residency: string,
    ) {
        this.email = email
        this.residency = residency
    }
}

export class NetworkConfig {
    chainId: string;
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

export interface TokenImage {
    id: string;
    url?: string;
}

export interface PaymentEstimation {
    paymentAmount: string;
    discountYears: number;
    currency: CurrencyData;
    paymentAmountText: string;
}

export interface PriceEstimation {
    paymentAmount: string;
    gasFee: string;
    currency: CurrencyData;
    fullPrice: string;
    paymentAmountText: string;
    gasFeeText: string;
    fullPriceText: string;
}

export interface CurrencyData {
    name: string;
    symbol: string;
    decimals: number;
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

export interface MintingResult {
    transactionId: string;
    tokenId: string;
    imageURL?: string;
    explorerURL?: string;
}

export enum KycDaoEnvironment {
    Production = "PRODUCTION",
    Dev = "DEV"
}

export class Configuration {
    // apiKey: string;
    environment: KycDaoEnvironment;
    networkConfigs: NetworkConfig[];

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
