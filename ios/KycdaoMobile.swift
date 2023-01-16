import KycDao
import React
import Combine
import WalletConnectSwift

@available(iOS 13, *)
extension UIWindowScene {
    static var focused: UIWindowScene? {
        return UIApplication.shared.connectedScenes
            .first { $0.activationState == .foregroundActive && $0 is UIWindowScene } as? UIWindowScene
    }
}

@objc(KycdaoMobile)
class KycdaoMobile: NSObject {
    
    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
}
