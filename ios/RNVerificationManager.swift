//
//  RNKycManager.swift
//  kycdao-mobile
//
//  Created by Vekety Robin on 2022. 09. 20..
//

import Foundation
import React
import KycDao
import Combine
import UIKit

extension VerificationSession: Hashable, Equatable {
    public static func == (lhs: VerificationSession, rhs: VerificationSession) -> Bool {
        lhs.id == rhs.id
    }
    
    public func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}

@objc(RNVerificationManager)
class RNVerificationManager: RCTEventEmitter {
    
    private var sessions: Set<VerificationSession> = Set()
    private var personalSignContinuation: CheckedContinuation<String, Error>?
    private var hasListeners = false
    private var activeTopMostWindowScene: UIWindowScene?
    
    override func startObserving() {
        hasListeners = true
    }
    
    override func stopObserving() {
        hasListeners = false
    }
    
    override func supportedEvents() -> [String]! {
        [KycReactEvents.methodPersonalSign.rawValue,
         KycReactEvents.methodMintingTransaction.rawValue]
    }
    
    override init() {
        super.init()
        NotificationCenter.default.addObserver(self, selector: #selector(newSceneActivated), name: UIScene.didActivateNotification, object: nil)
    }
    
    @objc
    func newSceneActivated() {
        activeTopMostWindowScene = UIWindowScene.focused
    }
    
    @objc(configure:resolve:reject:)
    func configure(_ configurationData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                
                let rnConfiguration = try RNConfiguration.decode(from: configurationData)
                VerificationManager.configure(rnConfiguration.asNativeModel)
                resolve(())
                
            } catch let error {
                reject("configure", "Failed to configure, invalid configuration data: \(configurationData) error: \(error.localizedDescription)", error)
            }
        }
        
    }
    
    @objc(createSession:walletSession:resolve:reject:)
    func createSession(_ walletAddress: String, walletSession walletSessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                
                let walletSession = try RNWalletSession.decode(from: walletSessionData)
                
                walletSession.personalSignHandler = { [weak self] walletAddress, message in
                    self?.sendEvent(withName: KycReactEvents.methodPersonalSign.rawValue,
                                    body: ["id": walletSession.id,
                                           "walletAddress": walletAddress,
                                           "message": message])
                }
                
                walletSession.sendMintingTransactionHandler = { [weak self] walletAddress, mintingProperties in
                    guard let mintingPropertiesData = try? mintingProperties.encodeToDictionary() else { return }
                    
                    self?.sendEvent(withName: KycReactEvents.methodMintingTransaction.rawValue,
                                    body: ["id": walletSession.id,
                                           "walletAddress": walletAddress,
                                           "mintingProperties": mintingPropertiesData])
                }
                
                let session = try await VerificationManager.shared.createSession(walletAddress: walletAddress, walletSession: walletSession)
                sessions.insert(session)
                
                let rnSession = try session.asReactModel.encodeToDictionary()
                resolve(rnSession)
                
            } catch let error {
                
                reject("create_session", "Failed to create session", error)
                
            }
        }
    }
    
    @objc(hasValidToken:walletAddress:chainId:resolve:reject:)
    func hasValidToken(_ verificationTypeData: String, walletAddress: String, chainId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                
                let verificationType = VerificationType(rawValue: verificationTypeData)
                guard let verificationType else { throw KycDaoError.genericError }
                
                let hasValidToken = try await VerificationManager.shared
                    .hasValidToken(verificationType: verificationType,
                                   walletAddress: walletAddress,
                                   chainId: chainId)
                
                resolve(hasValidToken)
                
            } catch let error {
                
                reject("login", "Failed to login with wallet", error)
                
            }
        }
    }
    
    @objc(personalSignSuccess:signature:)
    func personalSignSuccess(_ walletSessionData: [String: Any], signature: String) {
        
        do {
        
            let rnWalletSession = try RNWalletSession.decode(from: walletSessionData)
            guard let walletSession = sessions.first(where: { kycSession in kycSession.walletSession.id == rnWalletSession.id })?.walletSession as? RNWalletSession
            else {
                throw KycDaoError.genericError
            }
            
            walletSession.personalSignContinuation?.resume(returning: signature)
            
        } catch {
            
            print("Can not find session for personal sign response on the native layer")
            
        }
        
    }
    
    @objc(personalSignFailure:reason:)
    func personalSignFailure(_ walletSessionData: [String: Any], reason: String) {
        
        do {
        
            let rnWalletSession = try RNWalletSession.decode(from: walletSessionData)
            guard let walletSession = sessions.first(where: { kycSession in kycSession.walletSession.id == rnWalletSession.id })?.walletSession as? RNWalletSession
            else {
                throw KycDaoError.genericError
            }

            walletSession.personalSignContinuation?.resume(throwing: KycDaoError.genericError)
            
        } catch {
            
            print("Can not find session for personal sign response on the native layer")
            
        }
        
    }
    
    @objc(mintingTransactionSuccess:txHash:)
    func mintingTransactionSuccess(_ walletSessionData: [String: Any], txHash: String) {
        
        do {
        
            let rnWalletSession = try RNWalletSession.decode(from: walletSessionData)
            guard let walletSession = sessions.first(where: { kycSession in kycSession.walletSession.id == rnWalletSession.id })?.walletSession as? RNWalletSession
            else {
                throw KycDaoError.genericError
            }
            
            walletSession.sendMintingTransactionContinuation?.resume(returning: MintingTransactionResult(txHash: txHash))
            
        } catch {
            
            print("Can not find session for minting transaction response on the native layer")
            
        }
        
    }
    
    @objc(mintingTransactionFailure:reason:)
    func mintingTransactionFailure(_ walletSessionData: [String: Any], reason: String) {
        
        do {
        
            let rnWalletSession = try RNWalletSession.decode(from: walletSessionData)
            guard let walletSession = sessions.first(where: { kycSession in kycSession.walletSession.id == rnWalletSession.id })?.walletSession as? RNWalletSession
            else {
                throw KycDaoError.genericError
            }

            walletSession.sendMintingTransactionContinuation?.resume(throwing: KycDaoError.genericError)
            
        } catch {
            
            print("Can not find session for minting transaction response on the native layer")
            
        }
        
    }
    
    @objc(login:resolve:reject:)
    func login(_ sessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                
                let session = try fetchSessionFromData(sessionData)
                try await session.login()
                resolve(())
                
            } catch let error {
                
                reject("login", "Failed to login with wallet", error)
                
            }
        }
    }
    
    @objc(acceptDisclaimer:resolve:reject:)
    func acceptDisclaimer(_ sessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                
                let session = try fetchSessionFromData(sessionData)
                try await session.acceptDisclaimer()
                resolve(())
                
            } catch let error {
                
                reject("acceptDisclaimer", "Failed to accept disclaimer", error)
                
            }
        }
    }
    
    @objc(setPersonalData:personalDataRaw:resolve:reject:)
    func setPersonalData(_ sessionData: [String: Any],
                         personalData: [String: Any],
                         resolve: @escaping RCTPromiseResolveBlock,
                         reject: @escaping RCTPromiseRejectBlock
    ) {
        Task {
            do {
                
                let session = try fetchSessionFromData(sessionData)
                let rnPersonalData = try RNPersonalData.decode(from: personalData)
                try await session.setPersonalData(
                    PersonalData(email: rnPersonalData.email,
                                 residency: rnPersonalData.email)
                )
                resolve(())
                
            } catch let error {
                
                reject("setPersonalData", "Setting personal data failed", error)
                
            }
        }
    }
    
    @objc(updateEmail:email:resolve:reject:)
    func updateEmail(_ sessionData: [String: Any],
                     email: String,
                     resolve: @escaping RCTPromiseResolveBlock,
                     reject: @escaping RCTPromiseRejectBlock
    ) {
        Task {
            do {
                
                let session = try fetchSessionFromData(sessionData)
                try await session.updateEmail(email)
                resolve(())
                
            } catch let error {
                
                reject("updateEmail", "Update email failed", error)
                
            }
        }
    }
    
    @objc(resendConfirmationEmail:resolve:reject:)
    func resendConfirmationEmail(_ sessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                
                let session = try fetchSessionFromData(sessionData)
                try await session.resendConfirmationEmail()
                resolve(())
                
            } catch let error {
                
                reject("resendConfirmationEmail", "Failed to resend confirmation email", error)
                
            }
        }
        
    }

    @objc(resumeOnEmailConfirmed:resolve:reject:)
    func resumeOnEmailConfirmed(_ sessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                
                let session = try fetchSessionFromData(sessionData)
                try await session.resumeOnEmailConfirmed()
                resolve(())
                
            } catch let error {
                
                reject("continueWhenEmailConfirmed", "Waiting for email confirmation failed", error)
                
            }
        }
    }
    
    @objc(startIdentification:resolve:reject:)
    func startIdentification(_ sessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task { @MainActor in
        
            guard let keyWindow = activeTopMostWindowScene?.windows.first(where: { $0.isKeyWindow }),
                  let rootViewController = keyWindow.rootViewController
            else {
                reject("startIdentification", "Failed to start identification", KycDaoError.genericError)
                return
            }
                do {
                    
                    let session = try self.fetchSessionFromData(sessionData)
                    let status = try await session.startIdentification(fromViewController: rootViewController)
                    resolve(status.asReactModel)
                    
                } catch let error {
                    reject("startIdentification", "Failed to start identification", error)
                }
            
        }

    }
    
    @objc(resumeOnVerificationCompleted:resolve:reject:)
    func resumeOnVerificationCompleted(_ sessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                let session = try fetchSessionFromData(sessionData)
                try await session.resumeOnVerificationCompleted()
                resolve(())
            } catch let error {
                reject("resumeOnVerificationCompleted", "Failed to wait for verification", error)
            }
        }
        
    }
    
    @objc(getMembershipCostPerYear:resolve:reject:)
    func getMembershipCostPerYear(_ sessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                let session = try fetchSessionFromData(sessionData)
                let costPerYear = try await session.getMembershipCostPerYear()
                resolve(costPerYear)
            } catch let error {
                reject("getMembershipCostPerYear", "Failed to get cost per year: \(error)", error)
            }
        }
    }
    
    @objc(getNFTImages:resolve:reject:)
    func getNFTImages(_ sessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                
                let session = try fetchSessionFromData(sessionData)
                let images = session.getNFTImages()
                    .map { $0.asReactModel }
                let rnImages = try images.encodeToArray()
                
                resolve(rnImages)
                
            } catch let error {
                reject("getNFTImages", "Failed to get nft images", error)
            }
        }
        
    }
    
    @objc(requestMinting:selectedImageId:membershipDuration:resolve:reject:)
    func requestMinting(_ sessionData: [String: Any], selectedImageId: String, membershipDuration membershipDurationSigned: NSNumber, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                let membershipDuration = UInt32(exactly: membershipDurationSigned)
                guard let membershipDuration else { throw KycDaoError.genericError }
                
                let session = try fetchSessionFromData(sessionData)
                try await session.requestMinting(selectedImageId: selectedImageId, membershipDuration: membershipDuration)
                resolve(())
            } catch let error {
                reject("requestMinting", "Failed to request minting authorization: \(error.localizedDescription)", error)
            }
        }
        
    }
    
    @objc(getMintingPrice:resolve:reject:)
    func getMintingPrice(_ sessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                let session = try fetchSessionFromData(sessionData)
                let priceEstimation = try await session.getMintingPrice()
                let rnPriceEstimation = try priceEstimation.asReactModel.encodeToDictionary()
                resolve(rnPriceEstimation)
            } catch let error {
                reject("mintingPrice", "Failed to estimate prices for minting: \(error)", error)
            }
        }
    }
    
    @objc(estimatePayment:yearsPurchased:resolve:reject:)
    func estimatePayment(_ sessionData: [String: Any], yearsPurchased: NSNumber, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                let yearsPurchased = UInt32(exactly: yearsPurchased)
                guard let yearsPurchased else { throw KycDaoError.genericError }
                
                let session = try fetchSessionFromData(sessionData)
                let paymentEstimation = try await session.estimatePayment(yearsPurchased: yearsPurchased)
                let rnPaymentEstimation = try paymentEstimation.asReactModel.encodeToDictionary()
                resolve(rnPaymentEstimation)
            } catch let error {
                reject("paymentEstimation", "Failed to estimate payment for membership: \(error)", error)
            }
        }
        
    }
    
    @objc(mint:resolve:reject:)
    func mint(_ sessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                
                print(sessionData)
                
                let session = try fetchSessionFromData(sessionData)
                let mintingResult = try await session.mint()
                let rnMintingResult = try mintingResult.asReactModel.encodeToDictionary()
                resolve(rnMintingResult)
                
            } catch let error {
                
                reject("mint", "Failed to mint", error)
                
            }
        }
    }
    
    @objc(freshSessionData:resolve:reject:)
    func freshSessionData(_ oldSessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        do {
            
            let session = try fetchSessionFromData(oldSessionData)
            let rnSession = try session.asReactModel.encodeToDictionary()
            resolve(rnSession)
            
        } catch let error {
            
            reject("freshSessionData", "Failed to refresh session data", error)
            
        }
        
    }
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    private func fetchSessionFromData(_ sessionData: [String: Any]) throws -> VerificationSession {
        
        let rnSession = try RNVerificationSession.decode(from: sessionData)
        guard let session = sessions.first(where: { $0.id == rnSession.id })
        else {
            throw KycDaoError.genericError
        }
        
        return session
        
    }
    
}
