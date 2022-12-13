package com.kycdaomobile.models.react_model

import com.kycdao.android.sdk.model.MintingResult

data class RNMintingResult(
	 val tokenId: String,
	 val transactionId: String,
	 val explorerURL: String?,
	 val imageURL: String?,
)


fun MintingResult.toReactModel(): RNMintingResult{
	return RNMintingResult(
		tokenId = tokenId,
		transactionId = transactionId,
		explorerURL = explorerURL.toString(),
		imageURL = imageURL
	)
}