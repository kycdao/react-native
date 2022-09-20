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
