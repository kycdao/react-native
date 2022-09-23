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
                    self?.sendEvent(withName: KycReactEvents.methodMintingTransaction.rawValue,
                                    body: ["id": walletSession.id,
                                           "walletAddress": walletAddress,
                                           "mintingProperties": mintingProperties])
                }
                
                //guard let network = Network(caip2Id: caip2Id) else { throw KYCError.genericError }
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
                
                let rnSession = try RNKYCSession.decode(from: sessionData)
                guard let session = sessions.first(where: { $0.id == rnSession.id })
                else {
                    throw KYCError.genericError
                }
                
                try await session.login()
                
                resolve(())
                
            } catch let error {
                
                reject("login", "Failed to login with wallet", error)
                
            }
        }
    }
    
    @objc(freshSessionData:resolve:reject:)
    func freshSessionData(_ oldSessionData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        do {
            
            let rnOldSession = try RNKYCSession.decode(from: oldSessionData)
            guard let session = sessions.first(where: { $0.id == rnOldSession.id })
            else {
                throw KYCError.genericError
            }
            
            let rnSession = try session.asReactModel.encodeToDictionary()
            resolve(rnSession)
            
        } catch let error {
            
            reject("login", "Failed to login with wallet", error)
            
        }
        
    }
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
}
