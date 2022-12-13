package com.kycdaomobile.modules

import androidx.activity.ComponentActivity
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.kycdao.android.sdk.model.GasEstimation
import com.kycdao.android.sdk.model.PersonalData
import com.kycdao.android.sdk.model.PriceEstimation
import com.kycdao.android.sdk.model.VerificationType
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
		val config = configuration.toType(RNConfiguration::class.java)
		VerificationManager.configure(config.asNativeModel())
	}

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
	fun hasValidToken(verificationTypeText: String, walletAddress: String, chainID: String, promise: Promise){
		promise.launch(this){
			val verificationType = VerificationType.valueOf(verificationTypeText)
			val result = VerificationManager.hasValidToken(
				verificationType,
				walletAddress,
				chainID
			)
			promise.resolve(result)
		}
	}


	@ReactMethod
	fun login(sessionDataMap: ReadableMap, promise: Promise) {
		promise.launch(this) {
			usingVerificationSessionFrom(sessionDataMap) {
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
			usingVerificationSessionFrom(sessionDataMap){
				acceptDisclaimer()
				promise.resolve(null)
			}
		}
	}

	@ReactMethod
	fun setPersonalData(sessionDataMap: ReadableMap, personalDataMap : ReadableMap, promise: Promise){
		promise.launch(this){
			usingVerificationSessionFrom(sessionDataMap){
				val personalData = personalDataMap.toType(PersonalData::class.java)
				setPersonalData(personalData)
				promise.resolve(null)
			}
		}
	}

	@ReactMethod
	fun freshSessionData(sessionDataMap: ReadableMap, promise: Promise){
		promise.launch(this){
			usingVerificationSessionFrom(sessionDataMap){
				promise.resolve(this.toReactNativeModel().toWritableMap())
			}
		}
	}

	@ReactMethod
	fun resendConfirmationEmail(sessionDataMap: ReadableMap, promise: Promise){
		promise.launch(this){
			usingVerificationSessionFrom(sessionDataMap){
				resendConfirmationEmail()
				promise.resolve(null)
			}
		}
	}

	@ReactMethod
	fun getMembershipCostPerYear(sessionDataMap: ReadableMap, promise: Promise){
		promise.launch(this){
			usingVerificationSessionFrom(sessionDataMap){
				val cost = getMembershipCostPerYear()
				promise.resolve(cost)
			}
		}
	}

	@ReactMethod
	fun continueWhenEmailConfirmed(sessionDataMap: ReadableMap, promise: Promise){
		promise.launch(this){
			usingVerificationSessionFrom(sessionDataMap){
				resumeOnEmailConfirmed()
				promise.resolve(null)
			}
		}
	}

	@ReactMethod
	fun startIdentification(sessionDataMap: ReadableMap,promise: Promise){
		promise.launch(this){
			usingVerificationSessionFrom(sessionDataMap){
				val identificationResult = startIdentification(currentActivity as ComponentActivity)
				promise.resolve(identificationResult.name)
			}
		}
	}

	@ReactMethod
	fun resumeOnVerificationCompleted(sessionDataMap: ReadableMap, promise: Promise){
		promise.launch(this){
			usingVerificationSessionFrom(sessionDataMap){
				this.resumeWhenIdentified()
				promise.resolve(null)
			}
		}
	}

	@ReactMethod
	fun getNFTImages(sessionDataMap: ReadableMap, promise: Promise){
		promise.launch(this){
			usingVerificationSessionFrom(sessionDataMap){
				promise.resolve(getNFTImages().toWritableArray())
			}
		}
	}

	@ReactMethod
	fun requestMinting(sessionDataMap: ReadableMap,selectedImageId: String,membershipDuration: Double, promise: Promise){
		promise.launch(this){
			usingVerificationSessionFrom(sessionDataMap){
				requestMinting(selectedImageId, membershipDuration.toUInt())
				promise.resolve(null)
			}
		}
	}

	@ReactMethod
	fun mint(sessionDataMap: ReadableMap, promise: Promise){
		promise.launch(this){
			usingVerificationSessionFrom(sessionDataMap){
				val mintingResult = mint()
				val rnMintingResult = mintingResult.toReactModel()
				promise.resolve(rnMintingResult)
			}
		}
	}
	@ReactMethod
	fun updateEmail(sessionDataMap: ReadableMap, email: String, promise: Promise){
		promise.launch(this){
			usingVerificationSessionFrom(sessionDataMap){
				updateEmail(email)
			}
		}
	}

	@ReactMethod
	fun estimatePayment(sessionDataMap: ReadableMap, yearsPurchased: Double,promise: Promise){
		promise.launch(this){
			usingVerificationSessionFrom(sessionDataMap){
				val paymentEstimation = estimatePayment(yearsPurchased.toUInt())
				val rnPaymentEstimation = paymentEstimation.toReactModel()
				promise.resolve(rnPaymentEstimation.toWritableMap())
			}
		}
	}

	@ReactMethod
	fun getMintingPrice(sessionDataMap: ReadableMap,promise: Promise){
		promise.launch(this){
			usingVerificationSessionFrom(sessionDataMap){
				val priceEstimation: PriceEstimation = getMintingPrice()
				val rnEstimation = priceEstimation.toReactModel()
				promise.resolve(rnEstimation.toWritableMap())
			}
		}
	}

	private suspend fun usingVerificationSessionFrom(sessionDataMap: ReadableMap, action :suspend VerificationSession.() ->Unit) {
		val sessionData = sessionDataMap.toType(RNVerificationSession::class.java)
		action(sessions[sessionData.id] ?: throw Exception("No kyc session found"))
	}


}
