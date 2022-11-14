package com.kycdaomobile.models.react_model

import com.kycdao.android.sdk.model.WalletConnectURL

data class ReactNativeWCURL(
  val topic: String,
  val version: String,
  val bridgeURL: String,
  val key: String,
  val absoluteString: String,
)

fun WalletConnectURL.toReactNativeModel(): ReactNativeWCURL {
  return ReactNativeWCURL(
    topic = this.topic,
    version = this.version.toString(),
    bridgeURL = this.bridgeURL,
    key = this.key,
    absoluteString = this.absoluteUri
  )
}
