package com.kycdaomobile.models.react_model

import com.kycdao.android.sdk.model.NetworkOption
import com.kycdao.android.sdk.verificationSession.KycDaoEnvironment
import com.kycdao.android.sdk.verificationSession.VerificationManager

data class RNConfiguration(
	val environment: String,
	val networkConfigs : List<NetworkOption> = emptyList()
){
	fun asNativeModel() : VerificationManager.Configuration{
		return VerificationManager.Configuration(
			environment =KycDaoEnvironment.values().first { it.rnText == environment },
			networkConfigurations = networkConfigs
		)
	}
}
