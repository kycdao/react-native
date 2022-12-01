package com.kycdaomobile.models.react_model

import com.kycdao.android.sdk.model.VerificationStatus
import com.kycdao.android.sdk.verificationSession.VerificationSession

data class RNKycSession(
	val id: String,
	val walletAddress: String,
	val chainId: String,
	val loggedIn: Boolean,
	val emailConfirmed: Boolean,
	val disclaimerAccepted: Boolean,
	val requiredInformationProvided: Boolean,
	val verificationStatus: VerificationStatus
)

fun VerificationSession.toReactNativeModel(): RNKycSession {
	return RNKycSession(
		id = id,
		walletAddress = walletAddress,
		chainId = chainId,
		loggedIn = loggedIn,
		emailConfirmed = emailConfirmed,
		disclaimerAccepted = disclaimerAccepted,
		requiredInformationProvided = requiredInformationProvided,
		verificationStatus = verificationStatus
	)
}