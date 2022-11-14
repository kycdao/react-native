package com.kycdaomobile.models.react_model

import com.kycdao.android.sdk.model.VerificationType

data class RNSmartContractConfig(
	val address: String,
	val paymentDiscountPercent: Int,
	val verificationType: VerificationType,
	val network: String,
)
