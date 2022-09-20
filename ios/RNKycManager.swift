//
//  RNKycManager.swift
//  kycdao-mobile
//
//  Created by Vekety Robin on 2022. 09. 20..
//

import Foundation
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
class RNKYCManager: NSObject {
    
    private var sessions: Set<KYCSession> = Set()
    
    @objc(createSession:network:resolve:reject:)
    func createSession(_ walletAddress: String, network caip2Id: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                
                guard let network = Network(caip2Id: caip2Id) else { throw KYCError.genericError }
                let session = try await KYCManager.shared.createSession(walletAddress: walletAddress, network: network)
                sessions.insert(session)
                
                let rnSession = try session.asReactModel.encodeToDictionary()
                resolve(rnSession)
                
            } catch let error {
                
                reject("create_session", "Failed to create session", error)
                
            }
        }
    }
    
    @objc(login:signature:resolve:reject:)
    func login(_ sessionData: [String: Any], signature: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                
                let rnSession = try RNKYCSession.decode(from: sessionData)
                guard let session = sessions.first(where: { $0.id == rnSession.id })
                else {
                    throw KYCError.genericError
                }
                
                try await session.login(signature: signature)
                
                resolve(())
                
            } catch let error {
                
                reject("login", "Failed to login with wallet", error)
                
            }
        }
    }
    
    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
}
