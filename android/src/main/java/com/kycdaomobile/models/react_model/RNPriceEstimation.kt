package com.kycdaomobile.models.react_model

import com.kycdao.android.sdk.model.PriceEstimation
import java.math.BigInteger

data class RNPriceEstimation(
	val paymentAmount: String,
	val gasFee: String,
	val currency: RNCurrency,
	val fullPrice: String,
	val paymentAmountText: String,
	val gasFeeText: String,
	val fullPriceText: String,
)

fun PriceEstimation.toReactModel(): RNPriceEstimation{
	return RNPriceEstimation(
		paymentAmount = paymentAmount.toString(),
		gasFee = gasFee.toString(),
		currency = currency.toReactModel(),
		fullPrice = fullPrice.toString(),
		paymentAmountText = paymentAmountText,
		gasFeeText = gasFeeText,
		fullPriceText = fullPriceText
	)
}