package com.kycdaomobile.models.react_model

import com.kycdao.android.sdk.model.NetworkConfig
import com.kycdao.android.sdk.verificationSession.KycDaoEnvironment
import com.kycdao.android.sdk.verificationSession.VerificationManager

data class RNConfiguration(
	val environment: String,
	val networkConfigs : Set<NetworkConfig> = emptySet()
){
	fun asNativeModel() : VerificationManager.Configuration{
		return VerificationManager.Configuration(
			environment =KycDaoEnvironment.values().first { it.rnText == environment },
			networkConfigurations = networkConfigs
		)
	}
}
