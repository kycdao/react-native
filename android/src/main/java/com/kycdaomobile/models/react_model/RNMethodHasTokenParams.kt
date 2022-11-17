package com.kycdaomobile.models.react_model

import com.kycdao.android.sdk.model.NetworkOption
import com.kycdao.android.sdk.model.VerificationType
import com.kycdao.android.sdk.wallet.WalletSession

data class RNMethodHasTokenParams(
	val verificationType: VerificationType,
	val walletAddress: String,
	val networkOption: NetworkOption
)

data class RNMethodHasTokenWalletSessionParams(
	val verificationType: VerificationType,
	val walletAddress: String,
	val walletSession: ReactNativeWCWalletSession
)
