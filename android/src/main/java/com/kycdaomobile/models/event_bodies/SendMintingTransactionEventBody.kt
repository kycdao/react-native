package com.kycdaomobile.models.event_bodies

import com.kycdao.android.sdk.model.MintingProperties

data class SendMintingTransactionEventBody(
	val id : String,
	val walletAddress : String,
	val mintingProperties: MintingProperties
)