package com.kycdaomobile.models.react_model

import com.kycdao.android.sdk.model.PaymentEstimation
import java.math.BigInteger


data class RNPaymentEstimation(
	val paymentAmount: String,
	val discountYears: Double,
	val currency: RNCurrency,
	val paymentAmountText: String
)

fun PaymentEstimation.toReactModel(): RNPaymentEstimation{
	return RNPaymentEstimation(
		paymentAmount = paymentAmount.toString(),
		discountYears = discountYears.toDouble(),
		currency = currency.toReactModel(),
		paymentAmountText = paymentAmountText
	)
}