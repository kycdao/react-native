//
//  Converters.swift
//  kycdao-mobile
//
//  Created by Vekety Robin on 2022. 09. 20..
//

import Foundation
import KycDao
import WalletConnectSwift

extension WalletConnectSession {
    var asReactModel: RNWalletSession {
        RNWalletSession(id: id,
                        url: url.asReactModel,
                        walletId: walletId,
                        accounts: accounts,
                        icon: icon,
                        name: name,
                        chainId: chainId)
    }
}

extension WCURL {
    var asReactModel: RNWCURL {
        RNWCURL(topic: topic,
                version: version,
                bridgeURL: bridgeURL,
                key: key,
                absoluteString: absoluteString)
    }
}

/*extension SmartContractConfig {
    var asReactModel: RNSmartContractConfig {
        RNSmartContractConfig(address: address,
                              paymentDiscountPercent: paymentDiscountPercent,
                              verificationType: verificationType,
                              network: network)
    }
}*/

extension VerificationSession {
    var asReactModel: RNVerificationSession {
        RNVerificationSession(id: self.id,
                     walletAddress: self.walletAddress,
                     chainId: self.chainId,
                     loggedIn: self.loggedIn,
                     emailConfirmed: self.emailConfirmed,
                     disclaimerAccepted: self.disclaimerAccepted,
                     requiredInformationProvided: self.requiredInformationProvided,
                     verificationStatus: self.verificationStatus.asReactModel)
    }
}

extension IdentityFlowResult {
    var asReactModel: String {
        switch self {
        case .completed:
            return "COMPLETED"
        case .cancelled:
            return "CANCELLED"
        }
    }
}

extension GasEstimation {
    var asReactModel: RNGasEstimation {
        RNGasEstimation(price: price,
                        amount: amount,
                        gasCurrency: gasCurrency.asReactModel,
                        fee: fee,
                        feeInNative: feeInNative)
    }
}

extension CurrencyData {
    var asReactModel: RNCurrencyData {
        RNCurrencyData(name: name,
                       symbol: symbol,
                       decimals: decimals,
                       baseToNativeDivisor: baseToNativeDivisor)
    }
}

extension TokenImage {
    var asReactModel: RNTokenImage {
        RNTokenImage(id: id,
                     url: url)
    }
}

extension VerificationStatus {
    var asReactModel: RNVerificationStatus {
        switch self {
        case .verified:
            return .verified
        case .processing:
            return .processing
        case .notVerified:
            return .notVerified
        }
    }
}
