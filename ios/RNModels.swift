//
//  RNModels.swift
//  kycdao-mobile
//
//  Created by Vekety Robin on 2022. 09. 20..
//

import Foundation
import KycDao
import WalletConnectSwift

enum KycReactEvents: String, Codable {
    case wcSessionStarted = "WC_SESSION_STARTED"
}

struct RNWalletSession: Codable {
    var url: RNWCURL
    var walletId: String?
    var accounts: [String]?
    var icon: URL?
    var name: String?
    var chainId: Int?
}

struct RNWCURL: Codable {
    var topic: String
    var version: String
    var bridgeURL: URL
    var key: String
    var absoluteString: String
}

struct RNKYCSession: Codable {
    var id: String
    var walletAddress: String
    var network: String
    var kycConfig: RNSmartContractConfig?
    var accreditedConfig: RNSmartContractConfig?
    var loginProof: String
    var isLoggedIn: Bool
    var emailAddress: String?
    var emailConfirmed: Bool
    var residency: String?
    var residencyProvided: Bool
    var emailProvided: Bool
    var disclaimerAccepted: Bool
    var legalEntityStatus: Bool
    var requiredInformationProvided: Bool
    var verificationStatus: SimplifiedVerificationStatus
}

struct RNSmartContractConfig: Codable {
    let address: String
    let paymentDiscountPercent: Int
    let verificationType: VerificationType
    let network: String
}
