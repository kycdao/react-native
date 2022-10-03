
export interface KYCSessionInterface {
    id: string;
    walletAddress: string;
    chainId: string;
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
    verificationStatus: VerificationStatus;
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

export enum KycReactEvents {
    WCSessionStarted = "WC_SESSION_STARTED",
    MethodPersonalSign = "METHOD_PERSONAL_SIGN",
    MethodMintingTransaction = "METHOD_MINTING_TRANSACTION"
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

export interface WalletSessionInterface {
    id: string;
    chainId: string;

    personalSign(walletAddress: string, message: string): Promise<string>;
    sendMintingTransaction(walletAddress: string, mintingProperties: MintingProperties): Promise<string>;
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