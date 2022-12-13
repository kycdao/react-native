package com.kycdaomobile.models.react_model

import com.kycdao.android.sdk.model.NativeCurrency
import java.math.BigInteger

data class RNCurrency(
	val name: String,
	val symbol: String,
	val decimals: Int,
	val baseToNativeDivisor: String,
)

fun NativeCurrency.toReactModel(): RNCurrency {
	return RNCurrency(
		name = name,
		symbol = symbol,
		decimals = decimals,
		baseToNativeDivisor = baseToNativeDivisor.toString()
	)
}