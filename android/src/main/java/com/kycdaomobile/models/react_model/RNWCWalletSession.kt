package com.kycdaomobile.models.react_model

import com.kycdao.android.sdk.wallet.WalletConnectSession


data class ReactNativeWCWalletSession(
  val id: String,
  val url: ReactNativeWCURL,
  val walletId: String?,
  val accounts: List<String>,
  val icon: String,
  val name: String,
  val chainId: String
)


fun WalletConnectSession.toReactNativeModel() : ReactNativeWCWalletSession {
  return ReactNativeWCWalletSession(
    id = this.id,
    url = this.url.toReactNativeModel(),
    walletId = null,
    accounts = this.accounts ?: emptyList(),
    icon = this.icons?.first() ?: "",
    name = this.name ?: "Unknown name",
    chainId = this.getChainId()
  )
}
