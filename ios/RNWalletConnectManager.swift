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

extension WalletConnectSession: Hashable {
    
    public func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
}

@objc(RNWalletConnectManager)
class RNWalletConnectManager: RCTEventEmitter {
    
    private var sessionStartedCancellable: AnyCancellable?
    private var pendingSessionURICancellable: AnyCancellable?
    private var hasListeners = false
    private var sessionsStarted: Set<WalletConnectSession> = Set()
    
    override func startObserving() {
        hasListeners = true
    }
    
    override func stopObserving() {
        hasListeners = false
    }
    
    override func supportedEvents() -> [String]! {
        [
            KycReactEvents.wcSessionStarted.rawValue,
            KycReactEvents.wcSessionURIChanged.rawValue
        ]
    }
    
    @objc(startListening:reject:)
    func startListening(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        
        if sessionStartedCancellable == nil {
            
            sessionStartedCancellable = WalletConnectManager.shared.sessionStart.sink { [weak self] result in
                
                guard self?.hasListeners == true else { return }
                switch result {
                case .success(let walletSession):
                    guard let eventBody = try? walletSession.asReactModel.encodeToDictionary() else { return }
                    self?.sessionsStarted.insert(walletSession)
                    self?.sendEvent(withName: KycReactEvents.wcSessionStarted.rawValue,
                                    body: eventBody)
                case .failure(.failedToConnect(wallet: let wallet)):
                    let walletJSON = try? wallet?.asReactModel.toJSON()
                    let rnError = RNError(message: "Failed to connect to wallet", data: walletJSON)
                    guard let eventBody = try? rnError.encodeToDictionary() else { return }
                    self?.sendEvent(withName: KycReactEvents.wcSessionStarted.rawValue,
                                    body: eventBody)
                default:
                    break
                }
                
            }
        }
        
        if pendingSessionURICancellable == nil {
            
            pendingSessionURICancellable = WalletConnectManager.shared.pendingSessionURI.sink { [weak self] uri in
                guard self?.hasListeners == true else { return }
                
                self?.sendEvent(withName: KycReactEvents.wcSessionURIChanged.rawValue,
                                body: uri)
            }
            
        }
            
        WalletConnectManager.shared.startListening()
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
                
                reject("list_wallets", "Failed to list wallets: \(error.localizedDescription)", error)
                
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
                
                let session = try await fetchSessionFromData(sessionData)
                let signature = try await session.personalSign(walletAddress: account, message: message)
                resolve(signature)
                
            } catch let error {
                
                print("Failed to create signature\n\(sessionData)\n\(account)\n\(message)")
                reject("sign", "Failed to create signature", error)
                
            }
        }
    }
    
    @objc(sendMintingTransaction:walletAddress:mintingProperties:resolve:reject:)
    func sendMintingTransaction(_ sessionData: [String: Any], walletAddress: String, mintingProperties mintingPropertiesData: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                
                let session = try await fetchSessionFromData(sessionData)
                
                guard let mintingProperties = try? MintingProperties.decode(from: mintingPropertiesData) else { throw KycDaoError.genericError }
                
                let txHash = try await session.sendMintingTransaction(walletAddress: walletAddress, mintingProperties: mintingProperties)
                print("BRIDGE: Minting hash \(txHash)")
                resolve(txHash)
                
            } catch let error {
                reject("sendMintingTransaction", "Failed to mint NFT", error)
            }
        }
    }
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    private func fetchSessionFromData(_ sessionData: [String: Any]) async throws -> WalletConnectSession {
        
        let rnSession = try RNWalletSession.decode(from: sessionData)
        guard let session = sessionsStarted.first(where: { $0.url.absoluteString == rnSession.url.absoluteString }) else {
            throw KycDaoError.genericError
        }
        
        return session
        
    }
    
}
