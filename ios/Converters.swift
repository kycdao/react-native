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
        RNVerificationSession(id: id,
                              walletAddress: walletAddress,
                              chainId: chainId,
                              loggedIn: loggedIn,
                              emailConfirmed: emailConfirmed,
                              disclaimerAccepted: disclaimerAccepted,
                              requiredInformationProvided: requiredInformationProvided,
                              verificationStatus: verificationStatus.asReactModel,
                              hasMembership: hasMembership,
                              disclaimerText: disclaimerText,
                              termsOfServiceURL: termsOfService.absoluteString,
                              privacyPolicyURL: privacyPolicy.absoluteString)
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
                        feeText: feeText)
    }
}

extension PaymentEstimation {
    var asReactModel: RNPaymentEstimation {
        RNPaymentEstimation(paymentAmount: "\(paymentAmount)",
                            discountYears: discountYears,
                            currency: currency.asReactModel,
                            paymentAmountText: paymentAmountText)
    }
}

extension PriceEstimation {
    var asReactModel: RNPriceEstimation {
        RNPriceEstimation(paymentAmount: "\(paymentAmount)",
                          gasFee: "\(gasFee)",
                          currency: currency.asReactModel,
                          fullPrice: "\(fullPrice)",
                          paymentAmountText: paymentAmountText,
                          gasFeeText: gasFeeText,
                          fullPriceText: fullPriceText)
    }
}



extension CurrencyData {
    var asReactModel: RNCurrencyData {
        return RNCurrencyData(name: name,
                       symbol: symbol,
                       decimals: decimals,
                       baseToNativeDivisor: "\(baseToNativeDivisor)")
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

extension Wallet {
    var asReactModel: RNWallet {
        RNWallet(id: id, name: name, imageURL: imageURL)
    }
}

extension MintingResult {
    var asReactModel: RNMintingResult {
        RNMintingResult(tokenId: tokenId,
                        transactionId: transactionId,
                        explorerURL: explorerURL?.absoluteString,
                        imageURL: imageURL?.absoluteString)
    }
}
