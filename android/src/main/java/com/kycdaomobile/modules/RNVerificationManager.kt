package com.kycdaomobile.modules

import androidx.activity.ComponentActivity
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.kycdao.android.sdk.model.GasEstimation
import com.kycdao.android.sdk.model.PersonalData
import com.kycdao.android.sdk.model.functions.mint.MintingTransactionResult
import com.kycdao.android.sdk.verificationSession.VerificationManager
import com.kycdao.android.sdk.verificationSession.VerificationSession
import com.kycdaomobile.events.KycDaoReactEvent
import com.kycdaomobile.extensions.launch
import com.kycdaomobile.extensions.toType
import com.kycdaomobile.models.event_bodies.PersonalSignEventBody
import com.kycdaomobile.models.event_bodies.SendMintingTransactionEventBody
import com.kycdaomobile.models.react_model.*
import com.kycdaomobile.toWritableArray
import com.kycdaomobile.toWritableMap
import com.kycdaomobile.wallet.ReactNativeWalletSessionImpl
import com.kycdaomobile.wallet.onPersonalSign
import com.kycdaomobile.wallet.onSendMintingTransaction
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlin.Exception
import kotlin.coroutines.CoroutineContext
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

class RNVerificationManager(private val reactContext: ReactApplicationContext) :
	ReactContextBaseJavaModule(reactContext), CoroutineScope {

	override val coroutineContext: CoroutineContext
		get() = Dispatchers.Default

	override fun getName(): String {
		return "RNVerificationManager"
	}

	private var sessions: HashMap<String, VerificationSession> = hashMapOf()

	@ReactMethod
	fun createSession(walletAddress: String, walletSessionMap: ReadableMap, promise: Promise) {
		promise.launch(this) {
			val eventEmiter =
				reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
			val walletSessionNativeModel = walletSessionMap.toType(
				ReactNativeWCWalletSession::class.java
			)
			val walletSession =
				ReactNativeWalletSessionImpl
					.createFromNativeModel(walletSessionNativeModel)
					.onPersonalSign { id, walletAddress, message ->
						val eventBody = PersonalSignEventBody(
							id = id,
							walletAddress = walletAddress,
							message = message
						).toWritableMap()
						eventEmiter.emit(
							KycDaoReactEvent.MethodPersonalSign.stringForm,
							eventBody
						)
					}
					.onSendMintingTransaction { id, walletAddress, mintingProperties ->
						val eventBody = SendMintingTransactionEventBody(
							id = id,
							walletAddress = walletAddress,
							mintingProperties = mintingProperties
						).toWritableMap()
						eventEmiter.emit(
							KycDaoReactEvent.MethodMintingTransaction.stringForm,
							eventBody
						)
					}
			val kycSession = VerificationManager.createSession(walletAddress, walletSession)
			sessions[kycSession.id] = kycSession

			promise.resolve(kycSession.toReactNativeModel().toWritableMap())
		}
	}

	@ReactMethod
	fun hasValidToken(hasTokenValidParams: ReadableMap,promise: Promise){
		promise.launch(this){
			val params = hasTokenValidParams.toType(RNMethodHasTokenParams::class.java)
			val result = VerificationManager.hasValidToken(
				params.verificationType,
				params.walletAddress,
				params.networkOption.chainId
			)
			promise.resolve(result)
		}
	}


	@ReactMethod
	fun login(sessionDataMap: ReadableMap, promise: Promise) {
		promise.launch(this) {
			usingKycSessionFrom(sessionDataMap) {
				login()
				promise.resolve(null)
			}
		}
	}

	@ReactMethod
	fun personalSignSuccess(walletSessionMap: ReadableMap, signature: String) {
		val rnWalletSession = walletSessionMap.toType(ReactNativeWalletSessionImpl::class.java)
		val kycSessionID =
			sessions.values.first { it.walletSession.id == rnWalletSession.id }.id
		val walletSession =
			sessions[kycSessionID]?.walletSession as ReactNativeWalletSessionImpl
		walletSession.personalSignContinuation?.resume(signature)
	}

	@ReactMethod
	fun personalSignFailure(walletSessionMap: ReadableMap, error: String) {
		val rnWalletSession = walletSessionMap.toType(ReactNativeWalletSessionImpl::class.java)
		val kycSessionID =
			sessions.values.first { it.walletSession.id == rnWalletSession.id }.id
		val walletSession =
			sessions[kycSessionID]?.walletSession as ReactNativeWalletSessionImpl
		walletSession.personalSignContinuation?.resumeWithException(Exception("Failed to sign: $error"))
	}

	@ReactMethod
	fun mintingTransactionSuccess(walletSessionMap: ReadableMap, txHash: String) {
		val rnWalletSession = walletSessionMap.toType(ReactNativeWalletSessionImpl::class.java)
		val kycSessionID =
			sessions.values.first { it.walletSession.id == rnWalletSession.id }.id
		val walletSession =
			sessions[kycSessionID]?.walletSession as ReactNativeWalletSessionImpl
		walletSession.sendMintingContinuation?.resume(MintingTransactionResult(txHash))
	}

	@ReactMethod
	fun mintingTransactionFailure(walletSessionMap: ReadableMap, error: String) {
		val rnWalletSession = walletSessionMap.toType(ReactNativeWalletSessionImpl::class.java)
		val kycSessionID =
			sessions.values.first { it.walletSession.id == rnWalletSession.id }.id
		val walletSession =
			sessions[kycSessionID]?.walletSession as ReactNativeWalletSessionImpl
		walletSession.sendMintingContinuation?.resumeWithException(Exception("Failed minting transaction: $error"))
	}

	@ReactMethod
	fun acceptDisclaimer(sessionDataMap: ReadableMap,promise: Promise){
		promise.launch(this){
			usingKycSessionFrom(sessionDataMap){
				acceptDisclaimer()
				promise.resolve(null)
			}
		}
	}

	@ReactMethod
	fun setPersonalData(sessionDataMap: ReadableMap, personalDataMap : ReadableMap, promise: Promise){
		promise.launch(this){
			usingKycSessionFrom(sessionDataMap){
				val personalData = personalDataMap.toType(PersonalData::class.java)
				setPersonalData(personalData)
				promise.resolve(null)
			}
		}
	}

	@ReactMethod
	fun freshSessionData(sessionDataMap: ReadableMap, promise: Promise){
		promise.launch(this){
			usingKycSessionFrom(sessionDataMap){
				promise.resolve(this.toReactNativeModel().toWritableMap())
			}
		}
	}

	@ReactMethod
	fun sendConfirmationEmail(sessionDataMap: ReadableMap, promise: Promise){
		promise.launch(this){
			usingKycSessionFrom(sessionDataMap){
				sendConfirmationEmail()
				promise.resolve(null)
			}
		}
	}

	@ReactMethod
	fun continueWhenEmailConfirmed(sessionDataMap: ReadableMap, promise: Promise){
		promise.launch(this){
			usingKycSessionFrom(sessionDataMap){
				resumeOnEmailConfirmed()
				promise.resolve(null)
			}
		}
	}

	@ReactMethod
	fun startIdentification(sessionDataMap: ReadableMap,promise: Promise){
		promise.launch(this){
			usingKycSessionFrom(sessionDataMap){
				val identificationResult = startIdentification(currentActivity as ComponentActivity)
				promise.resolve(identificationResult.name)
			}
		}
	}

	@ReactMethod
	fun resumeOnVerificationCompleted(sessionDataMap: ReadableMap, promise: Promise){
		promise.launch(this){
			usingKycSessionFrom(sessionDataMap){
				this.resumeWhenIdentified()
				promise.resolve(null)
			}
		}
	}

	@ReactMethod
	fun getNFTImages(sessionDataMap: ReadableMap, promise: Promise){
		promise.launch(this){
			usingKycSessionFrom(sessionDataMap){
				promise.resolve(getNFTImages().toWritableArray())
			}
		}
	}

	@ReactMethod
	fun requestMinting(sessionDataMap: ReadableMap,selectedImageId: String, promise: Promise){
		promise.launch(this){
			usingKycSessionFrom(sessionDataMap){
				requestMinting(selectedImageId)
				promise.resolve(null)
			}
		}
	}

	@ReactMethod
	fun mint(sessionDataMap: ReadableMap, promise: Promise){
		promise.launch(this){
			usingKycSessionFrom(sessionDataMap){
				val uri = mint()
				promise.resolve(uri.toString())
			}
		}
	}

	@ReactMethod
	fun estimateGasForMinting(sessionDataMap: ReadableMap,precision: Int = 3,promise: Promise){
		promise.launch(this){
			usingKycSessionFrom(sessionDataMap){
				val estimation: GasEstimation = estimateGasForMinting()
				val rnEstimation = estimation.toReactModel(precision)
				promise.resolve(rnEstimation.toWritableMap())
			}
		}
	}

	private suspend fun usingKycSessionFrom(sessionDataMap: ReadableMap, action :suspend VerificationSession.() ->Unit) {
		val sessionData = sessionDataMap.toType(RNKycSession::class.java)
		action(sessions[sessionData.id] ?: throw Exception("No kyc session found"))
	}


}