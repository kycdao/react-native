
export interface VerificationSessionInterface {
    id: string;
    walletAddress: string;
    chainId: string;
    loggedIn: boolean;
    emailConfirmed: boolean;
    disclaimerAccepted: boolean;
    requiredInformationProvided: boolean;
    verificationStatus: VerificationStatus;
}

export interface ErrorEventBody {
    message: string;
    errorType: ErrorType;
}
  
export interface SmartContractConfig {
    address: string;
    paymentDiscountPercent: number;
    verificationType: string;
    network: Network;
}
  
export enum Network {
    EthereumMainnet = "eip155:1",
    CeloMainnet = "eip155:42220",
    CeloAlfajores = "eip155:44787",
    PolygonMumbai = "eip155:80001",
}

export enum KycDaoReactEvents {
    WCSessionStarted = "WC_SESSION_STARTED",
    WCSessionFailed = "WC_SESSION_FAILED",
    MethodHasValidToken ="METHOD_HAS_VALID_TOKEN",
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
}

export class PersonalData{
    email: string;
    residency: string;
    isLegalEntity : boolean;

    constructor(
        email: string,
        residency: string,
        isLegalEntity: boolean
    ){
        this.email = email
        this.residency = residency
        this.isLegalEntity = isLegalEntity
    }
}
export class NetworkOption{
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

export interface MethodHasValidTokenParams {
    verificationType: VerificationType,
    walletAddress: string,
    networkOption: NetworkOption
}
export interface MethodHasValidTokenWalletSessionParams {
    verificationType: VerificationType,
    walletAddress: string,
    walletSession: WalletSessionInterface
}

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

export interface GasEstimation {
    price: string;
    amount: string;
    gasCurrency: CurrencyData;
    fee: string;
    feeInNative: string;
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
        const error: RNError = object
        return typeof error.message  === "string"
            && typeof error.data === "object";
      }
}

export interface MintingResult {
    explorerURL?: string
    transactionId: string
    tokenId: string
}