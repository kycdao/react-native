package com.kycdaomobile.models.react_model

import com.kycdao.android.sdk.kycSession.KycSession
import com.kycdao.android.sdk.model.VerificationStatus

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

fun KycSession.toReactNativeModel(): RNKycSession {
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