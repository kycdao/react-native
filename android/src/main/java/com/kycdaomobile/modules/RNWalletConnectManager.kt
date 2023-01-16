package com.kycdaomobile.modules

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.kycdao.android.sdk.model.functions.mint.MintingProperties
import com.kycdao.android.sdk.util.Resource
import com.kycdao.android.sdk.verificationSession.VerificationManager
import com.kycdao.android.sdk.wallet.WalletConnectManager
import com.kycdao.android.sdk.wallet.WalletConnectSession
import com.kycdaomobile.Wallet
import com.kycdaomobile.events.KycDaoReactEvent
import com.kycdaomobile.extensions.launch
import com.kycdaomobile.extensions.toType
import com.kycdaomobile.models.RNEventTypes
import com.kycdaomobile.models.event_bodies.ErrorEventBody
import com.kycdaomobile.models.react_model.RNMethodHasTokenWalletSessionParams
import com.kycdaomobile.models.react_model.toReactNativeModel
import com.kycdaomobile.toWritableArray
import com.kycdaomobile.toWritableMap
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlin.coroutines.CoroutineContext


class RNWalletConnectManager(reactContext: ReactApplicationContext) :
	ReactContextBaseJavaModule(reactContext), CoroutineScope {

	override fun getName(): String {
		return "RNWalletConnectManager"
	}

	private val walletSessions = hashMapOf<String, WalletConnectSession>()

	@ReactMethod
	fun startListening() {
		Log.d("RNWalletConnectManager", "startListening()")
		WalletConnectManager.startListening()
		launch {
			with(reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)) {
				WalletConnectManager.sessionsState.collect { result ->
					when (result) {
						is Resource.Failure -> {
							val errorBody = ErrorEventBody(
								message = result.message,
							)
							emit(
								KycDaoReactEvent.WCSessionStarted.stringForm,
								errorBody.toWritableMap()
							)
						}
						is Resource.Success -> {
							result.data.let { session ->
								walletSessions[session.id] = session
								val eventBody = session.toReactNativeModel()
								emit(
									KycDaoReactEvent.WCSessionStarted.stringForm,
									eventBody.toWritableMap()
								)
							}
						}
					}
				}
			}
		}
	}
	@ReactMethod
	fun listWallets(promise: Promise) {
		Log.d("RNWalletConnectManager", "listWallets()")
		val list = listOf(Wallet("test", "MetaMask"))

		val nativeArray = list.toWritableArray()

		Log.d("RNWalletConnectManager", "$nativeArray")
		promise.resolve(nativeArray)
	}

	@ReactMethod
	fun connect(walletMap: Dynamic) {
		//val walletObject = walletMap.parse(Wallet::class.java)
		Log.d("RNWalletConnectManager", "connect() test")
		Log.d("RNWalletConnectManager", "walletMap: $walletMap")
		WalletConnectManager.connectWallet()
		//Log.d("RNWalletConnectManager", "walletObject: $walletObject")
	}

	@ReactMethod
	fun sign(sessionDataMap: ReadableMap, account: String, message: String, promise: Promise) {
		promise.launch(this) {
			val sessionData = sessionDataMap.toType(WalletConnectSession::class.java)
			val walletConnectSession =
				walletSessions[sessionData.id] ?: throw Exception("No walletSession found")
			val signature = walletConnectSession.personalSign(
				walletAddress = account,
				message = message
			)
			promise.resolve(signature)
		}
	}


	@ReactMethod
	fun sendMintingTransaction(
		sessionDataMap: ReadableMap,
		walletAddress: String,
		mintingPropertiesMap: ReadableMap,
		promise: Promise
	) {
		promise.launch(this) {
			val sessionData = sessionDataMap.toType(WalletConnectSession::class.java)
			val walletConnectSession =
				walletSessions[sessionData.id] ?: throw Exception("No walletSession found")
			val mintingProperties = mintingPropertiesMap.toType(MintingProperties::class.java)
			val mintingResult = walletConnectSession.sendMintingTransaction(
				walletAddress = walletAddress,
				mintingProperties = mintingProperties
			)
			promise.resolve(mintingResult.txHash)
		}
	}

	override val coroutineContext: CoroutineContext = Dispatchers.IO


}
