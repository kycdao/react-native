//
//  RNModels.swift
//  kycdao-mobile
//
//  Created by Vekety Robin on 2022. 09. 20..
//

import Foundation
import KycDao
import WalletConnectSwift
import BigInt

enum KycReactEvents: String, Codable {
    case wcSessionStarted = "WC_SESSION_STARTED"
    case wcSessionFailed = "WC_SESSION_FAILED"
    case methodPersonalSign = "METHOD_PERSONAL_SIGN"
    case methodMintingTransaction = "METHOD_MINTING_TRANSACTION"
}

class RNWalletSession: Codable, WalletSessionProtocol {
    var id: String
    var url: RNWCURL
    var walletId: String?
    var accounts: [String]
    var icon: URL?
    var name: String
    var chainId: String
    
    internal var personalSignHandler: ((String, String) -> Void)?
    internal var sendMintingTransactionHandler: ((String, MintingProperties) -> Void)?
    var personalSignContinuation: CheckedContinuation<String, Error>?
    var sendMintingTransactionContinuation: CheckedContinuation<String, Error>?
    
    func personalSign(walletAddress: String, message: String) async throws -> String {
        guard let personalSignHandler = personalSignHandler else {
            throw KycDaoError.genericError
        }

        personalSignHandler(walletAddress, message)
        return try await withCheckedThrowingContinuation { [weak self] (continuation: CheckedContinuation<String, Error>) in
            self?.personalSignContinuation = continuation
        }
    }
    
    func sendMintingTransaction(walletAddress: String, mintingProperties: MintingProperties) async throws -> String {
        guard let sendMintingTransactionHandler = sendMintingTransactionHandler else {
            throw KycDaoError.genericError
        }

        sendMintingTransactionHandler(walletAddress, mintingProperties)
        return try await withCheckedThrowingContinuation { [weak self] (continuation: CheckedContinuation<String, Error>) in
            self?.sendMintingTransactionContinuation = continuation
        }
    }
    
    
    public enum RNWalletSessionKeys: String, CodingKey {
        case id
        case url
        case walletId
        case accounts
        case icon
        case name
        case chainId
        case network
    }
    
    init(id: String, url: RNWCURL, walletId: String?, accounts: [String], icon: URL?, name: String, chainId: String) {
        self.id = id
        self.url = url
        self.walletId = walletId
        self.accounts = accounts
        self.icon = icon
        self.name = name
        self.chainId = chainId
    }
    
    public required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: RNWalletSessionKeys.self)
        self.url = try container.decode(RNWCURL.self, forKey: .url)
        self.id = try container.decode(String.self, forKey: .id)
        self.walletId = try container.decodeIfPresent(String.self, forKey: .walletId)
        self.accounts = try container.decode([String].self, forKey: .accounts)
        self.icon = try container.decodeIfPresent(URL.self, forKey: .icon)
        self.name = try container.decode(String.self, forKey: .name)
        self.chainId = try container.decode(String.self, forKey: .chainId)
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: RNWalletSessionKeys.self)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.url, forKey: .url)
        try container.encodeIfPresent(self.walletId, forKey: .walletId)
        try container.encode(self.accounts, forKey: .accounts)
        try container.encodeIfPresent(self.icon, forKey: .icon)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.chainId, forKey: .chainId)
    }
}

struct RNWCURL: Codable {
    var topic: String
    var version: String
    var bridgeURL: URL
    var key: String
    var absoluteString: String
}

struct RNVerificationSession: Codable {
    var id: String
    var walletAddress: String
    var chainId: String
    var loggedIn: Bool
    var emailConfirmed: Bool
    var disclaimerAccepted: Bool
    var requiredInformationProvided: Bool
    var verificationStatus: RNVerificationStatus
}

struct RNSmartContractConfig: Codable {
    let address: String
    let paymentDiscountPercent: Int
    let verificationType: VerificationType
    let network: String
}

public struct RNGasEstimation: Codable {
    
    public let price: BigUInt
    public let amount: BigUInt
    public let gasCurrency: RNCurrencyData
    public var fee: BigUInt
    public var feeInNative: String
    
}

public struct RNCurrencyData: Codable {
    public let name: String
    public let symbol: String
    public let decimals: Int
    public var baseToNativeDivisor: BigUInt
}

public struct RNTokenImage: Codable {
    public let id: String
    public let url: URL?
}

public enum RNVerificationStatus: String, Codable {
    case verified = "VERIFIED"
    case processing = "PROCESSING"
    case notVerified = "NOT_VERIFIED"
}
