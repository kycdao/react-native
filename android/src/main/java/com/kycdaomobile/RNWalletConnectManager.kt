package com.kycdaomobile

import android.util.Log
import com.facebook.react.bridge.*
import com.google.gson.Gson
import org.json.JSONObject


class RNWalletConnectManager(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "RNWalletConnectManager"
    }

    @ReactMethod
    fun startListening(promise: Promise) {
        Log.d("RNWalletConnectManager", "startListening()")
        promise.resolve("test")
    }

    @ReactMethod
    fun listWallets(promise: Promise) {
        Log.d("RNWalletConnectManager", "listWallets()")
        val list = listOf(Wallet("test", "MetaMask"))

        val nativeArray = list.toNativeArray()

        Log.d("RNWalletConnectManager", "$nativeArray")
        promise.resolve(nativeArray)
    }

    @ReactMethod
    fun connect(walletDynamic: Dynamic) {
        Log.d("RNWalletConnectManager", "connect()")
        Log.d("RNWalletConnectManager", "walletDynamic: $walletDynamic")
        val walletObject = walletDynamic.toObject(Wallet::class.java)
        Log.d("RNWalletConnectManager", "walletObject: $walletObject")
    }

}
