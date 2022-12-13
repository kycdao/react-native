package com.kycdaomobile.models.react_model

import com.kycdao.android.sdk.model.VerificationStatus
import com.kycdao.android.sdk.verificationSession.VerificationSession

data class RNVerificationSession(
	val id: String,
	val walletAddress: String,
	val chainId: String,
	val loggedIn: Boolean,
	val emailConfirmed: Boolean,
	val disclaimerAccepted: Boolean,
	val requiredInformationProvided: Boolean,
	val verificationStatus: VerificationStatus,
	val hasMembership : Boolean,
	val disclaimerText: String,
	val termsOfServiceURL: String,
	val privacyPolicyURL: String
)

fun VerificationSession.toReactNativeModel(): RNVerificationSession {
	return RNVerificationSession(
		id = id,
		walletAddress = walletAddress,
		chainId = chainId,
		loggedIn = loggedIn,
		emailConfirmed = emailConfirmed,
		disclaimerAccepted = disclaimerAccepted,
		requiredInformationProvided = requiredInformationProvided,
		verificationStatus = verificationStatus,
		hasMembership = hasMembership,
		disclaimerText = disclaimerText,
		termsOfServiceURL = termsOfService.toString(),
		privacyPolicyURL = privacyPolicy.toString(),
		)
}