
export interface KYCSessionInterface {
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

export interface MintingProperties {
    contractAddress: string;
    contractABI: string;
    gasAmount: string;
    gasPrice: string;
}

export interface WalletSessionInterface {
    id: string;
    chainId: number;
    network: Network;

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