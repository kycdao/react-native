package com.kycdaomobile
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.kycdaomobile.modules.RNVerificationManager
import com.kycdaomobile.modules.RNWalletConnectManager

class KycdaoMobilePackage : ReactPackage {

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(
          KycdaoMobileModule(reactContext),
          RNWalletConnectManager(reactContext),
          RNVerificationManager(reactContext),
        )
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
