//
//  RNWalletConnectManager.swift
//  kycdao-mobile
//
//  Created by Vekety Robin on 2022. 09. 20..
//

import Foundation
import React
import KycDao
import Combine

extension WalletSession: Hashable {
    
    public func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
}

@objc(RNWalletConnectManager)
class RNWalletConnectManager: RCTEventEmitter {
    
    private var sessionStartedCancellable: AnyCancellable?
    private var hasListeners = false
    private var sessionsStarted: Set<WalletSession> = Set()
    
    override func startObserving() {
        hasListeners = true
    }
    
    override func stopObserving() {
        hasListeners = false
    }
    
    override func supportedEvents() -> [String]! {
        [KycReactEvents.wcSessionStarted.rawValue]
    }
    
    @objc(startListening:reject:)
    func startListening(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let uri = WalletConnectManager.shared.startListening()
        resolve(uri)
        
        guard sessionStartedCancellable == nil else { return }
        
        sessionStartedCancellable = WalletConnectManager.shared.sessionStarted.sink { [weak self] walletSession in
            
            guard self?.hasListeners == true else { return }
            guard let eventBody = try? walletSession.asReactModel.encodeToDictionary() else { return }
            self?.sessionsStarted.insert(walletSession)
            
            self?.sendEvent(withName: KycReactEvents.wcSessionStarted.rawValue,
                            body: eventBody)
            
        }
    }
    
    @objc(listWallets:reject:)
    func listWallets(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
            
                let wallets = try await WalletConnectManager.listWallets()
                print(wallets)
                let array = try wallets.encodeToArray()
                resolve(array)
                
            } catch let error {
                
                reject("list_wallets", "Failed to list wallets", error)
                
            }
        }
    }
    
    @objc(connect:resolve:reject:)
    func connect(_ walletDict: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        DispatchQueue.main.async {
            do {
            
                let wallet = try Wallet.decode(from: walletDict)
                try WalletConnectManager.shared.connect(withWallet: wallet)
                resolve(())
                
            } catch let error {
                
                print("Failed to connect to wallet\n\(walletDict)")
                reject("connect", "Failed to connect to wallet", error)
                
            }
        }
        
    }
    
    @objc(sign:account:message:resolve:reject:)
    func sign(_ sessionData: [String: Any], account: String, message: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                
                let rnSession = try RNWalletSession.decode(from: sessionData)
                guard let session = sessionsStarted.first(where: { $0.url.absoluteString == rnSession.url.absoluteString }) else {
                    throw KYCError.genericError
                }
                
                let signature = try await session.personalSign(walletAddress: account, message: message)
                resolve(signature)
                
            } catch let error {
                
                print("Failed to create signature\n\(sessionData)\n\(account)\n\(message)")
                reject("sign", "Failed to create signature", error)
                
            }
        }
    }
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
}
