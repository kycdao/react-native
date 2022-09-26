//
//  Converters.swift
//  kycdao-mobile
//
//  Created by Vekety Robin on 2022. 09. 20..
//

import Foundation
import KycDao
import WalletConnectSwift

extension WalletSession {
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

extension SmartContractConfig {
    var asReactModel: RNSmartContractConfig {
        RNSmartContractConfig(address: address,
                              paymentDiscountPercent: paymentDiscountPercent,
                              verificationType: verificationType,
                              network: network)
    }
}

extension KYCSession {
    var asReactModel: RNKYCSession {
        RNKYCSession(id: self.id,
                     walletAddress: self.walletAddress,
                     chainId: self.chainId,
                     kycConfig: self.kycConfig?.asReactModel,
                     accreditedConfig: self.accreditedConfig?.asReactModel,
                     loginProof: self.loginProof,
                     isLoggedIn: self.isLoggedIn,
                     emailAddress: self.emailAddress,
                     emailConfirmed: self.emailConfirmed,
                     residency: self.residency,
                     residencyProvided: self.residencyProvided,
                     emailProvided: self.emailProvided,
                     disclaimerAccepted: self.disclaimerAccepted,
                     legalEntityStatus: self.legalEntityStatus,
                     requiredInformationProvided: self.residencyProvided,
                     verificationStatus: self.verificationStatus)
    }
}
