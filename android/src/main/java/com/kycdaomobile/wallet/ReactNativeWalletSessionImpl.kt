package com.kycdaomobile.wallet

import com.kycdao.android.sdk.model.functions.mint.MintingProperties
import com.kycdao.android.sdk.model.functions.mint.MintingTransactionResult
import com.kycdao.android.sdk.wallet.WalletSession
import com.kycdaomobile.models.react_model.ReactNativeWCURL
import com.kycdaomobile.models.react_model.ReactNativeWCWalletSession
import kotlinx.coroutines.CancellableContinuation
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.Continuation

typealias PersonalSignAction = ((String,String,String)->Unit)?
typealias SendMintingTransactionAction = ((String, String, MintingProperties)->Unit)?
class ReactNativeWalletSessionImpl private constructor(
	override val id: String,
	val url: ReactNativeWCURL,
	val walletId: String?,
	val accounts: List<String>,
	val icon: String?,
	val name: String,
	val chainID: String,
) : WalletSession {

	companion object Builder {
		fun createFromNativeModel(
			data: ReactNativeWCWalletSession,
			): ReactNativeWalletSessionImpl {
			return ReactNativeWalletSessionImpl(
				id = data.id,
				url = data.url,
				walletId = data.walletId,
				accounts = data.accounts,
				icon = data.icon,
				name = data.name,
				chainID = data.chainId,
			)
		}
	}
	var personalSignAction : PersonalSignAction = null
	var personalSignContinuation : Continuation<String>? = null
	var sendMintingAction : SendMintingTransactionAction = null
	var sendMintingContinuation : Continuation<MintingTransactionResult>? = null
	override val rpcURL: String? = null

	override fun getChainId(): String {
		return chainID
	}

	override suspend fun personalSign(walletAddress: String, message: String): String {
		personalSignAction?.let { action->
			action(id,walletAddress,message)
			return suspendCancellableCoroutine { continuation ->
				personalSignContinuation = continuation
			}
		} ?: run {throw Exception("No handler available for personalSign")}
	}

	override suspend fun sendMintingTransaction(
		walletAddress: String,
		mintingProperties: MintingProperties
	): MintingTransactionResult {
		sendMintingAction?.let { action->
			action(id,walletAddress,mintingProperties)
			return suspendCancellableCoroutine { continuation ->
				sendMintingContinuation = continuation
			}
		} ?: run {throw Exception("No handler available for sendMintingTransaction")}
	}
}

fun ReactNativeWalletSessionImpl.onPersonalSign(action: PersonalSignAction) : ReactNativeWalletSessionImpl{
	this.personalSignAction = action
	return this
}

fun ReactNativeWalletSessionImpl.onSendMintingTransaction(action: SendMintingTransactionAction) : ReactNativeWalletSessionImpl{
	this.sendMintingAction = action
	return this
}