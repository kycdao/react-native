package com.kycdaomobile
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class RNKYCManager(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "RNKYCManager"
    }

  @ReactMethod
  fun createSession() {
    Log.d("RNKYCManager", "createSession() not implemented yet")
  }

}
