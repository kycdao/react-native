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

extension KYCSession: Hashable, Equatable {
    public static func == (lhs: KYCSession, rhs: KYCSession) -> Bool {
        lhs.id == rhs.id
    }
    
    public func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}

@objc(RNKYCManager)
class RNKYCManager: RCTEventEmitter {
    
    private var sessions: Set<KYCSession> = Set()
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
                
                let session = try await KYCManager.shared.createSession(walletAddress: walletAddress, walletSession: walletSession)
                sessions.insert(session)
                
                let rnSession = try session.asReactModel.encodeToDictionary()
                resolve(rnSession)
                
            } catch let error {
                
                reject("create_session", "Failed to create session", error)
                
            }
        }
    }
    
    @objc(personalSignSuccess:signature:)
    func personalSignSuccess(_ walletSessionData: [String: Any], signature: String) {
        
        do {
        
            let rnWalletSession = try RNWalletSession.decode(from: walletSessionData)
            guard let walletSession = sessions.first(where: { kycSession in kycSession.walletSession.id == rnWalletSession.id })?.walletSession as? RNWalletSession
            else {
                throw KYCError.genericError
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
                throw KYCError.genericError
            }

            walletSession.personalSignContinuation?.resume(throwing: KYCError.genericError)
            
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
                throw KYCError.genericError
            }
            
            walletSession.sendMintingTransactionContinuation?.resume(returning: txHash)
            
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
                throw KYCError.genericError
            }

            walletSession.sendMintingTransactionContinuation?.resume(throwing: KYCError.genericError)
            
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
    
    @objc(updateUser:email:residency:legalEntity:resolve:reject:)
    func updateUser(_ sessionData: [String: Any],
                    email: String,
                    residency: String,
                    legalEntity: Bool,
                    resolve: @escaping RCTPromiseResolveBlock,
                    reject: @escaping RCTPromiseRejectBlock
    ) {
        Task {
            do {
                
                let session = try fetchSessionFromData(sessionData)
                try await session.updateUser(email: email, residency: residency, legalEntity: legalEntity)
                resolve(())
                
            } catch let error {
                
                reject("update", "User update failed", error)
                
            }
        }
    }
    
    @objc(sendConfirmationEmail:resolve:reject:)
    func sendConfirmationEmail(_ sessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                
                let session = try fetchSessionFromData(sessionData)
                try await session.sendConfirmationEmail()
                resolve(())
                
            } catch let error {
                
                reject("sendConfirmationEmail", "Failed to send confirmation email", error)
                
            }
        }
        
    }

    @objc(continueWhenEmailConfirmed:resolve:reject:)
    func continueWhenEmailConfirmed(_ sessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                
                let session = try fetchSessionFromData(sessionData)
                await session.continueWhenEmailConfirmed()
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
                reject("startIdentification", "Failed to start identification", KYCError.genericError)
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
    
    @objc(continueWhenIdentified:resolve:reject:)
    func continueWhenIdentified(_ sessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                let session = try fetchSessionFromData(sessionData)
                await session.continueWhenIdentified()
                resolve(())
            } catch let error {
                reject("continueWhenIdentified", "Failed to wait for identification", error)
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
    
    @objc(requestMinting:selectedImageId:resolve:reject:)
    func requestMinting(_ sessionData: [String: Any], selectedImageId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                let session = try fetchSessionFromData(sessionData)
                try await session.requestMinting(selectedImageId: selectedImageId)
                resolve(())
            } catch let error {
                reject("requestMinting", "Failed to request minting authorization", error)
            }
        }
        
    }
    
    @objc(estimateGasForMinting:resolve:reject:)
    func estimateGasForMinting(_ sessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                let session = try fetchSessionFromData(sessionData)
                let gasEstimation = try await session.estimateGasForMinting()
                let rnGasEstimation = try gasEstimation.asReactModel.encodeToDictionary()
                resolve(rnGasEstimation)
            } catch let error {
                reject("estimateGasForMinting", "Failed to estimate gas fee for minting", error)
            }
        }
        
    }
    
    @objc(mint:resolve:reject:)
    func mint(_ sessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                
                print(sessionData)
                
                let session = try fetchSessionFromData(sessionData)
                try await session.mint()
                resolve(())
                
            } catch let error {
                
                reject("mint", "Failed to mint with wallet", error)
                
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
    
    private func fetchSessionFromData(_ sessionData: [String: Any]) throws -> KYCSession {
        
        let rnSession = try RNKYCSession.decode(from: sessionData)
        guard let session = sessions.first(where: { $0.id == rnSession.id })
        else {
            throw KYCError.genericError
        }
        
        return session
        
    }
    
}
