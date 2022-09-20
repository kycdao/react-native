import KycDao
import React
import Combine
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

extension WalletSession {
    var asReactModel: RNWalletSession {
        RNWalletSession(url: url.asReactModel,
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
                              network: network.caip2Id)
    }
}

extension KYCSession {
    var asReactModel: RNKYCSession {
        RNKYCSession(id: self.id,
                     walletAddress: self.walletAddress,
                     network: self.network.caip2Id,
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

@available(iOS 13, *)
extension UIWindowScene {
    static var focused: UIWindowScene? {
        return UIApplication.shared.connectedScenes
            .first { $0.activationState == .foregroundActive && $0 is UIWindowScene } as? UIWindowScene
    }
}

extension Encodable {
    
    func encodeToDictionary() throws -> [String: Any] {
        let encodedObject = try JSONEncoder().encode(self)
        
        guard let dictionary = try JSONSerialization.jsonObject(with: encodedObject, options: .fragmentsAllowed) as? [String: Any]
        else {
            print(self)
            print(try JSONSerialization.jsonObject(with: encodedObject, options: .fragmentsAllowed))
            throw KYCError.genericError
        }
        
        return dictionary
    }
    
    func encodeToArray() throws -> [Any] {
        let encodedObject = try JSONEncoder().encode(self)
        
        guard let dictionary = try JSONSerialization.jsonObject(with: encodedObject, options: .fragmentsAllowed) as? [Any]
        else {
            print(self)
            print(try JSONSerialization.jsonObject(with: encodedObject, options: .fragmentsAllowed))
            throw KYCError.genericError
        }
        
        return dictionary
    }
    
}

extension Decodable {
    
    static func decode(from dictionary: [String: Any]) throws -> Self {
        let data = try JSONSerialization.data(withJSONObject: dictionary, options: [])
        let decoder = JSONDecoder()
        return try decoder.decode(Self.self, from: data)
    }
    
}

@objc(KycdaoMobile)
class KycdaoMobile: NSObject {

    @objc(multiply:withB:withResolver:withRejecter:)
    func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        resolve(a*b)
    }
    
    @objc(printStuff:)
    func printStuff(stuff: String) {
        print("FROM REACT:\n\t\(stuff)")
    }
    
    @objc(launchKycFlow)
    func launchKycFlow() {
        DispatchQueue.main.async {
            
            let kycViewController = KycDaoViewController()
            guard let keyWindow = UIWindowScene.focused?.windows.first(where: { $0.isKeyWindow }) else { return }
        
            keyWindow.rootViewController?.present(kycViewController, animated: true)
        }
    }
    
}

extension WalletSession: Hashable {
    
    public func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
}

extension KYCSession: Hashable, Equatable {
    public static func == (lhs: KYCSession, rhs: KYCSession) -> Bool {
        lhs.id == rhs.id
    }
    
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
                
                let signature = try await session.sign(account: account, message: message)
                resolve(signature)
                
            } catch let error {
                
                print("Failed to create signature\n\(sessionData)\n\(account)\n\(message)")
                reject("sign", "Failed to create signaturet", error)
                
            }
        }
    }
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
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
