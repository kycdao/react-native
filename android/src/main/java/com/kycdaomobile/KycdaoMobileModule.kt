package com.kycdaomobile
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class KycdaoMobileModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "KycdaoMobile"
    }

    // Example method
    // See https://reactnative.dev/docs/native-modules-android
    @ReactMethod
    fun multiply(a: Int, b: Int, promise: Promise) {
      Log.d("KycdaoMobile", "a: $a, b: $b")
      promise.resolve(a * b)
    }

    @ReactMethod
    fun printStuff(stuff: String) {
      Log.d("KycdaoMobile", stuff)
    }

    @ReactMethod
    fun launchKycFlow() {
      Log.d("KycdaoMobile", "launchKycFlow()")
    }

}
