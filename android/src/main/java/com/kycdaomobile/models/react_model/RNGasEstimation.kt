package com.kycdaomobile.models.react_model

import android.icu.number.Precision
import com.kycdao.android.sdk.model.GasEstimation
import java.math.BigInteger

data class RNGasEstimation(
	val price: BigInteger,
	val amount: BigInteger,
	val gasCurrency: RNCurrency,
	val fee: BigInteger,
	val feeInNative:String,
)

fun GasEstimation.toReactModel() : RNGasEstimation{
	return RNGasEstimation(
		price = price,
		amount = amount,
		gasCurrency = gasCurrency.toReactModel(),
		fee = fee,
		feeInNative = feeText()
	)
}