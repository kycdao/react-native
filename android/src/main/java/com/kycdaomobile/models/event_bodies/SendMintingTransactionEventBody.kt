package com.kycdaomobile.models.event_bodies

import com.kycdao.android.sdk.model.functions.mint.MintingProperties


data class SendMintingTransactionEventBody(
	val id : String,
	val walletAddress : String,
	val mintingProperties: MintingProperties
)